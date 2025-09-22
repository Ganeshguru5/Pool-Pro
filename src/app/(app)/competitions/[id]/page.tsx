'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLocalStorageState from '@/hooks/use-local-storage-state';
import { Competition, Participant } from '@/lib/types';
import CompetitionHeader from './_components/competition-header';
import ParticipantsList from './_components/participants-list';
import PoolsManager from './_components/pools-manager';
import CompetitionAnalytics from './_components/competition-analytics';
import { Loader2 } from 'lucide-react';

export default function CompetitionPage() {
    const params = useParams();
    const id = params.id as string;
    const [competitions] = useLocalStorageState<Competition[]>('competitions', []);
    const [participants, setParticipants] = useLocalStorageState<Participant[]>('participants', []);

    const competition = useMemo(() => competitions.find(c => c.id === id), [competitions, id]);
    const competitionParticipants = useMemo(() => participants.filter(p => p.competition_id === id), [participants, id]);

    if (!competition) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <CompetitionHeader competition={competition} participantCount={competitionParticipants.length} />
            <Tabs defaultValue="participants" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                    <TabsTrigger value="pools">Pools</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="participants" className="space-y-4">
                    <ParticipantsList competition={competition} participants={competitionParticipants} setParticipants={setParticipants} />
                </TabsContent>
                <TabsContent value="pools" className="space-y-4">
                    <PoolsManager competition={competition} participants={competitionParticipants} setParticipants={setParticipants}/>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <CompetitionAnalytics participants={competitionParticipants} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
