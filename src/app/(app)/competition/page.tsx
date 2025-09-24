
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLocalStorageState from '@/hooks/use-local-storage-state';
import { Competition, Participant } from '@/lib/types';
import CompetitionHeader from './_components/competition-header';
import ParticipantsList from './_components/participants-list';
import PoolsManager from './_components/pools-manager';
import CompetitionAnalytics from './_components/competition-analytics';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompetitionPage() {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);
    const [competitions] = useLocalStorageState<Competition[]>('competitions', []);
    const [participants, setParticipants] = useLocalStorageState<Participant[]>('participants', []);

    useEffect(() => {
        // Ensure this runs only on the client
        const storedId = localStorage.getItem('selected_competition_id');
        if (storedId) {
            setId(storedId);
        } else {
            router.replace('/dashboard');
        }
    }, [router]);

    const competition = useMemo(() => {
        if (!id) return null;
        return competitions.find(c => c.id === id) || null;
    }, [competitions, id]);
    
    const competitionParticipants = useMemo(() => {
        if (!id) return [];
        return participants.filter(p => p.competition_id === id)
    }, [participants, id]);

    const setCompetitionParticipants = (newParticipants: Participant[] | ((prev: Participant[]) => Participant[])) => {
        setParticipants(prev => {
            if (!id) return prev; // Guard against updates if id is not set
            const otherParticipants = prev.filter(p => p.competition_id !== id);
            const currentCompetitionParticipants = prev.filter(p => p.competition_id === id);
            
            const updatedCompetitionParticipants = typeof newParticipants === 'function' 
                ? newParticipants(currentCompetitionParticipants) 
                : newParticipants;

            return [...otherParticipants, ...updatedCompetitionParticipants];
        });
    }

    if (!id || !competition) {
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
                    <ParticipantsList competition={competition} participants={competitionParticipants} setParticipants={setCompetitionParticipants} />
                </TabsContent>
                <TabsContent value="pools" className="space-y-4">
                    <PoolsManager competition={competition} participants={competitionParticipants} setParticipants={setCompetitionParticipants}/>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <CompetitionAnalytics participants={competitionParticipants} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
