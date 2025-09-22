import type { Competition } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface CompetitionHeaderProps {
  competition: Competition;
  participantCount: number;
}

export default function CompetitionHeader({ competition, participantCount }: CompetitionHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline">{competition.competition_name}</h2>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="secondary">{competition.competition_type}</Badge>
        <Badge variant="outline">{participantCount} Participants</Badge>
      </div>
    </div>
  );
}
