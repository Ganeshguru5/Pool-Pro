'use client';

import { useState, useMemo } from 'react';
import { Shuffle, Users, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Competition, Participant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { getCategoryInfo } from '@/lib/categories';


interface PoolsManagerProps {
  competition: Competition;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

export default function PoolsManager({ competition, participants, setParticipants }: PoolsManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const pools = useMemo(() => {
    const grouped: { [key: string]: Participant[] } = {};
    participants.forEach(p => {
      const poolKey = p.pool_assignment || 'unassigned';
      if (!grouped[poolKey]) {
        grouped[poolKey] = [];
      }
      grouped[poolKey].push(p);
    });
    return Object.entries(grouped).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  }, [participants]);

  const handleGeneratePools = () => {
    if (participants.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'No participants to assign to pools.' });
      return;
    }

    setIsLoading(true);

    try {
      // Group participants by district
      const participantsByDistrict: { [district: string]: Participant[] } = {};
      participants.forEach(p => {
        if (!participantsByDistrict[p.district]) {
          participantsByDistrict[p.district] = [];
        }
        participantsByDistrict[p.district].push(p);
      });

      // Determine number of pools needed (max participants from one district)
      const numPools = Math.max(...Object.values(participantsByDistrict).map(arr => arr.length), 0, 2);

      // Create pools and assign participants
      const newPools: { [key: string]: string[] } = {};
      for (let i = 1; i <= numPools; i++) {
        newPools[`Pool ${i}`] = [];
      }
      
      let poolIndex = 0;
      // Distribute participants in a round-robin fashion, district by district
      Object.values(participantsByDistrict).forEach(districtParticipants => {
        districtParticipants.forEach(participant => {
            let assigned = false;
            let initialPoolIndex = poolIndex;
            while(!assigned) {
                const poolName = `Pool ${poolIndex + 1}`;
                if (!newPools[poolName].some(pId => participants.find(p => p.id === pId)?.district === participant.district)) {
                    newPools[poolName].push(participant.id);
                    assigned = true;
                }
                poolIndex = (poolIndex + 1) % numPools;
                if(poolIndex === initialPoolIndex && !assigned){
                    // This should not happen with the logic of numPools, but as a safe guard
                    console.error("Could not assign participant", participant);
                    break;
                }
            }
        });
      });

      const updatedParticipants = participants.map(p => ({...p, pool_assignment: null}));

      Object.entries(newPools).forEach(([poolName, participantIds]) => {
          participantIds.forEach(participantId => {
              const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
              if (participantIndex !== -1) {
                  updatedParticipants[participantIndex].pool_assignment = poolName;
              }
          });
      });

      setParticipants(updatedParticipants);
      toast({ title: 'Success', description: 'Pools have been generated.' });

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate pools.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAssignment = (participantId: string, newPool: string) => {
    const participantToMove = participants.find(p => p.id === participantId);
    if (!participantToMove) return;

    if (newPool !== 'unassigned') {
        const targetPoolParticipants = participants.filter(p => p.pool_assignment === newPool);
        const districtExistsInPool = targetPoolParticipants.some(p => p.district === participantToMove.district);

        if (districtExistsInPool) {
            toast({
                variant: 'destructive',
                title: 'Assignment Failed',
                description: `Pool "${newPool}" already has a participant from ${participantToMove.district}.`,
            });
            return;
        }
    }
    
    setParticipants(prev =>
      prev.map(p => (p.id === participantId ? { ...p, pool_assignment: newPool === 'unassigned' ? null : newPool } : p))
    );
  };
  
  const poolNames = useMemo(() => ['unassigned', ...pools.filter(([key]) => key !== 'unassigned').map(([key]) => key)], [pools]);
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const { ageCategoryName, weightCategoryName, weightCategoryDescription } = getCategoryInfo(competition.age_category, competition.weight_category);
  
    pools.forEach(([poolName, poolParticipants], poolIndex) => {
      if (poolName === 'unassigned' || poolParticipants.length === 0) return;
  
      if (poolIndex > 0 && !(pools[0][0] === 'unassigned' && pools[0][1].length === 0 && poolIndex === 1)) {
        doc.addPage();
      }
  
      // --- Header ---
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(competition.competition_name, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (competition.start_date && !isNaN(new Date(competition.start_date).getTime())) {
        doc.text(`Date: ${format(new Date(competition.start_date), 'dd/MM/yyyy')}`, pageWidth / 2, 26, { align: 'center' });
      }
      doc.text(`Organized by: ${competition.organized_by}`, pageWidth / 2, 32, { align: 'center' });
      doc.text(competition.address, pageWidth / 2, 38, { align: 'center' });
  
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(poolName, pageWidth / 2, 48, { align: 'center' });
      
      let yPos = 60;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ageCategoryName} - ${weightCategoryName}`, 14, yPos);
      if (weightCategoryDescription) {
        doc.setFontSize(8);
        doc.text(weightCategoryDescription, 14, yPos + 4);
      }
      yPos += 15;
  
      // --- Bracket Logic ---
      const numParticipants = poolParticipants.length;
      if (numParticipants < 2) {
        doc.text("Not enough participants to create a bracket.", 14, yPos);
        return;
      }
      
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
      const byes = bracketSize - numParticipants;
  
      const playerBoxHeight = 10;
      const verticalGap = 4;
      const playerBoxWidth = 60;
      const horizontalGap = 15;
      const startX = 14;
      let startY = yPos;
  
      let pIndex = 0;
      const firstRoundPositions: {x: number, y:number, p: Participant | null}[] = [];
  
      // Distribute byes
      const distributedByes = new Array(bracketSize).fill(false);
      let byesToPlace = byes;
      if (byes > 0) {
        // Simple top/bottom placement for now
        for (let i = 0; i < Math.floor(byes / 2); i++) distributedByes[i] = true;
        for (let i = 0; i < Math.ceil(byes / 2); i++) distributedByes[bracketSize - 1 - i] = true;
      }

      for (let i = 0; i < bracketSize; i++) {
        const y = startY + i * (playerBoxHeight + verticalGap) + (playerBoxHeight/2);
        let participant = null;
        if (distributedByes[i]) {
           participant = null; // This is a bye
        } else {
           participant = poolParticipants[pIndex++];
        }

        if(participant) {
            doc.setFontSize(8);
            doc.rect(startX, y - playerBoxHeight/2, playerBoxWidth, playerBoxHeight);
            doc.text(`${participant.district}`, startX + 2, y - 1);
            doc.text(participant.name, startX + 2, y + 3);
        }
        firstRoundPositions.push({ x: startX + playerBoxWidth, y, p: participant });
      }

      function drawBracket(positions: { x: number, y: number }[]) {
        if (positions.length < 1) return;

        const currentX = positions[0].x;
        const nextX = currentX + horizontalGap;

        // Draw final tail if this is the winner
        if (positions.length === 1) {
            const pos = positions[0];
            doc.line(pos.x, pos.y, pos.x + horizontalGap, pos.y);
            return;
        }

        const nextRoundPositions = [];
        for (let i = 0; i < positions.length; i += 2) {
            const pos1 = positions[i];
            const pos2 = positions[i + 1];

            // This should not happen, but safeguard for odd numbers in later rounds
            if (!pos2) {
                doc.line(pos1.x, pos1.y, nextX, pos1.y); // Draw straight line for bye
                nextRoundPositions.push({ x: nextX, y: pos1.y });
                continue;
            }

            // Draw horizontal lines from player boxes/previous connector
            doc.line(pos1.x, pos1.y, nextX, pos1.y);
            doc.line(pos2.x, pos2.y, nextX, pos2.y);
    
            // Draw vertical connecting line
            doc.line(nextX, pos1.y, nextX, pos2.y);
    
            const midY = (pos1.y + pos2.y) / 2;
            nextRoundPositions.push({ x: nextX, y: midY });
        }
        
        drawBracket(nextRoundPositions);
      }

      const initialRoundToDraw = [];
      const nextRoundPositions = [];

      // Process first round matches and byes
      for(let i = 0; i < firstRoundPositions.length; i += 2) {
          const matchUp1 = firstRoundPositions[i];
          const matchUp2 = firstRoundPositions[i+1];

          if(matchUp1.p && matchUp2.p) { // Normal match
              initialRoundToDraw.push({x: matchUp1.x, y: matchUp1.y});
              initialRoundToDraw.push({x: matchUp2.x, y: matchUp2.y});
          } else { // One of them is a bye, advance the player
              const realPlayerMatchup = matchUp1.p ? matchUp1 : matchUp2;
              const midY = (matchUp1.y + matchUp2.y) / 2;
              
              // Draw line for player who got a bye
              doc.line(realPlayerMatchup.x, realPlayerMatchup.y, realPlayerMatchup.x + horizontalGap, realPlayerMatchup.y);
              
              nextRoundPositions.push({ x: realPlayerMatchup.x + horizontalGap, y: midY });
          }
      }

      const firstRoundWinners = [];
      // Draw first round and get winner positions
       for (let i = 0; i < initialRoundToDraw.length; i += 2) {
        const pos1 = initialRoundToDraw[i];
        const pos2 = initialRoundToDraw[i + 1];

        const nextX = pos1.x + horizontalGap;

        doc.line(pos1.x, pos1.y, nextX, pos1.y);
        doc.line(pos2.x, pos2.y, nextX, pos2.y);
        doc.line(nextX, pos1.y, nextX, pos2.y);
        
        const midY = (pos1.y + pos2.y) / 2;
        firstRoundWinners.push({ x: nextX, y: midY });
      }

      // Combine winners from byes and first round matches, then sort by Y position and draw the rest of the bracket
      const allNextRoundParticipants = [...firstRoundWinners, ...nextRoundPositions].sort((a,b) => a.y - b.y);

      drawBracket(allNextRoundParticipants);
    });
  
    doc.save(`${competition.competition_name}_pools.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const { ageCategoryName, weightCategoryName } = getCategoryInfo(competition.age_category, competition.weight_category);
    
    pools.forEach(([poolName, poolParticipants]) => {
        if(poolName === 'unassigned' && poolParticipants.length === 0) return;
        const wsData = [
            ['Name', 'District', 'Age Category', 'Weight Category'],
            ...poolParticipants.map(p => [p.name, p.district, ageCategoryName, weightCategoryName])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, poolName.replace(/ /g, '_').substring(0, 31));
    });
    XLSX.writeFile(wb, `${competition.competition_name}_pools.xlsx`);
  };

  const hasAssignedPools = useMemo(() => pools.some(([key]) => key !== 'unassigned'), [pools]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
            <div>
                <CardTitle>Pool Management</CardTitle>
                <CardDescription>Generate pools automatically or assign participants manually.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleGeneratePools} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                    Generate Pools
                </Button>
                {hasAssignedPools && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4"/>
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportPDF}>Download as PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportExcel}>Download as Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {participants.length === 0 ? (
             <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Participants</h3>
                <p className="mt-2 text-sm text-muted-foreground">Add participants before managing pools.</p>
            </div>
        ) : pools.length === 1 && pools[0][0] === 'unassigned' ? (
          <Alert>
            <Shuffle className="h-4 w-4" />
            <AlertTitle>No Pools Generated</AlertTitle>
            <AlertDescription>
              Click 'Generate Pools' to automatically create balanced pools for your participants.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pools.map(([poolName, poolParticipants]) => (
              <Card key={poolName}>
                <CardHeader>
                  <CardTitle className="capitalize">{poolName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {poolParticipants.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span>{p.name} <Badge variant="outline">{p.district}</Badge></span>
                      <Select
                        value={p.pool_assignment || 'unassigned'}
                        onValueChange={(newPool) => handleManualAssignment(p.id, newPool)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {poolNames.map(name => (
                            <SelectItem key={name} value={name} className="capitalize">{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
