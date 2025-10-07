
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
      
      let yPos = 55;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ageCategoryName} - ${weightCategoryName}`, 14, yPos);
      if (weightCategoryDescription) {
        doc.setFontSize(8);
        doc.text(weightCategoryDescription, 14, yPos + 4);
      }
      
      // --- Bracket Logic ---
      const numParticipants = poolParticipants.length;
      if (numParticipants < 2) {
        doc.text("Not enough participants to create a bracket.", 14, yPos + 15);
        return;
      }
      
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
      const byes = bracketSize - numParticipants;
      
      // Distribute participants and byes strategically
      let participantsWithByes: (Participant | null)[] = [];
      if (byes > 0) {
          const p_copy = [...poolParticipants];
          participantsWithByes = new Array(bracketSize).fill(null);
          
          // Standard seeding distribution for byes
          const indices: number[] = [];
          let i = 0;
          let nextPowerOf2 = 2;
          while(i < bracketSize) {
              indices.push(i);
              if (indices.length === nextPowerOf2) {
                  indices.reverse();
                  nextPowerOf2 *= 2;
              }
              i++;
          }
          
          let p_i = 0;
          while(p_i < byes) {
            // Assign byes to seeded positions first
            p_i++;
          }
          
          p_i=0;
          const byePositions = [0, bracketSize-1, bracketSize/2, bracketSize/2-1, bracketSize/4, bracketSize - bracketSize/4 -1];
          let assignedByeCount = 0;
          while(assignedByeCount < byes){
              let bye_idx = byePositions.shift();
              if(bye_idx !== undefined){
                participantsWithByes[bye_idx] = "BYE" as any;
                assignedByeCount++;
              } else {
                break;
              }
          }

          for(let i=0; i<bracketSize; i++){
            if(participantsWithByes[i] === null){
                if(p_copy.length > 0){
                    participantsWithByes[i] = p_copy.shift()!;
                }
            }
          }
      } else {
        participantsWithByes = poolParticipants;
      }


      const playerBoxHeight = 12;
      const verticalGap = 4; // Reduced from 8
      const playerBoxWidth = 60;
      const horizontalGap = 20;
      const startX = 14;
      const startY = yPos + 15;

      const drawBracket = (participants: (Participant | null | 'BYE')[], x: number, y: number, round: number): number[] => {
          if (participants.length <= 1) {
              if (participants[0]) { // Draw final line for winner
                  doc.line(x, y + playerBoxHeight / 2, x + horizontalGap, y + playerBoxHeight / 2);
              }
              return [y + playerBoxHeight / 2];
          }

          const mid = Math.ceil(participants.length / 2);
          const topHalf = participants.slice(0, mid);
          const bottomHalf = participants.slice(mid);

          const yGap = (playerBoxHeight + verticalGap) * Math.pow(2, round - 1);
          const topYPositions = drawBracket(topHalf, x + horizontalGap, y, round + 1);
          
          const yOffsetForBottom = topYPositions.length * yGap;
          const bottomYPositions = drawBracket(bottomHalf, x + horizontalGap, y + yOffsetForBottom, round + 1);

          const allYPositions = [...topYPositions, ...bottomYPositions];

          if (round === 1) {
              participants.forEach((p, i) => {
                  const currentY = y + i * (playerBoxHeight + verticalGap);
                  if (p && p !== 'BYE') {
                      doc.rect(x, currentY, playerBoxWidth, playerBoxHeight);
                      doc.setFontSize(7);
                      doc.text(p.district, x + 2, currentY + 4);
                      doc.setFontSize(9);
                      doc.text(p.name, x + 2, currentY + 9);
                  } else if (p === 'BYE') {
                      doc.setFontSize(9);
                      doc.text("BYE", x + 2, currentY + 7);
                  }
                  allYPositions[i] = currentY; // Store initial positions
              });
          }

          let connectionPoints = [];
          for (let i = 0; i < allYPositions.length; i += 2) {
              const y1 = allYPositions[i] + (round > 1 ? 0 : playerBoxHeight / 2);
              let y2_val = allYPositions[i + 1];
              
              if(y2_val === undefined) { // Handle odd number of participants in a round (bye)
                  connectionPoints.push(y1);
                  doc.line(x, y1, x - horizontalGap, y1);
                  continue;
              }

              const y2 = y2_val + (round > 1 ? 0 : playerBoxHeight / 2);

              const lineX = x;
              doc.line(lineX, y1, lineX, y2); // Vertical connector
              
              const midY = (y1 + y2) / 2;
              doc.line(lineX, midY, lineX - horizontalGap, midY); // Horizontal connector to previous round

              if (round > 1) {
                const p1 = participants[i];
                const p2 = participants[i+1];
                if(p1 && p1 !== 'BYE'){ doc.line(lineX, y1, lineX + horizontalGap, y1);}
                if(p2 && p2 !== 'BYE'){ doc.line(lineX, y2, lineX + horizontalGap, y2);}
                if( (p1 && p1 !== 'BYE') && (!p2 || p2 === 'BYE') ) { doc.line(lineX, y1, lineX - horizontalGap, y1) }
                if( (p2 && p2 !== 'BYE') && (!p1 || p1 === 'BYE') ) { doc.line(lineX, y2, lineX - horizontalGap, y2) }

              } else {
                 const p1 = participants[i];
                 const p2 = participants[i+1];
                 const player1LineY = y + i * (playerBoxHeight + verticalGap) + playerBoxHeight/2;
                 const player2LineY = y + (i+1) * (playerBoxHeight + verticalGap) + playerBoxHeight/2;
                 
                 if (p1 && p1 !== 'BYE') {
                    doc.line(x, player1LineY, x + horizontalGap, player1LineY);
                 }
                 if (p2 && p2 !== 'BYE') {
                    doc.line(x, player2LineY, x + horizontalGap, player2LineY);
                 }
                 if ((p1 && p1 !== 'BYE') && (!p2 || p2 === 'BYE')) {
                     const byeWinnerY = (player1LineY + player2LineY) / 2;
                     doc.line(x, player1LineY, x, byeWinnerY);
                     doc.line(x, byeWinnerY, x - horizontalGap, byeWinnerY);
                 }
              }
              
              connectionPoints.push(midY);
          }
          return connectionPoints;
      };

      drawBracket(participantsWithByes.map(p=> p? p : 'BYE'), startX, startY, 1);
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
