
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLocalStorageState from '@/hooks/use-local-storage-state';
import type { Competition, Participant } from '@/lib/types';
import CompetitionHeader from './_components/competition-header';
import ParticipantsList from './_components/participants-list';
import PoolsManager from './_components/pools-manager';
import CompetitionAnalytics from './_components/competition-analytics';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompetitionPage() {
    const router = useRouter();
    const [competitionId, setCompetitionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [competitions] = useLocalStorageState<Competition[]>('competitions', []);
    const [allParticipants, setAllParticipants] = useLocalStorageState<Participant[]>('participants', []);

    useEffect(() => {
        const storedId = localStorage.getItem('selected_competition_id');
        if (storedId) {
            setCompetitionId(storedId);
        } else {
            router.replace('/dashboard');
        }
    }, [router]);

    const competition = useMemo(() => {
        if (!competitionId) return null;
        const found = competitions.find(c => c.id === competitionId);
        return found || null;
    }, [competitions, competitionId]);
    
    const competitionParticipants = useMemo(() => {
        if (!competitionId) return [];
        return allParticipants.filter(p => p.competition_id === competitionId);
    }, [allParticipants, competitionId]);

    useEffect(() => {
        // This effect runs whenever competitionId or the list of competitions changes.
        // Once we have an ID, we check if the corresponding competition has been loaded from storage.
        if (competitionId) {
            // The `competitions` array from useLocalStorageState might not be populated on the first render.
            // We set loading to false only once the competition data is actually available.
            if (competition) {
                setIsLoading(false);
            }
        } else if (localStorage.getItem('selected_competition_id') === null) {
            // If there's no ID at all, we're likely being redirected, so we can stop loading.
            setIsLoading(false);
        }
    }, [competitionId, competition, competitions]);


    const setCompetitionParticipants = (updater: Participant[] | ((prev: Participant[]) => Participant[])) => {
        if (!competitionId) return;
        setAllParticipants(prev => {
            const otherParticipants = prev.filter(p => p.competition_id !== competitionId);
            const currentCompetitionParticipants = prev.filter(p => p.competition_id === competitionId);
            
            const updatedParticipants = typeof updater === 'function' 
                ? updater(currentCompetitionParticipants) 
                : updater;

            return [...otherParticipants, ...updatedParticipants];
        });
    }

    if (isLoading || !competition) {
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
