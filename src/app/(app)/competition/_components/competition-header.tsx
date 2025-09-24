
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
      {competition.address && (
        <p className="text-muted-foreground mt-1">{competition.address}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline">{participantCount} Participants</Badge>
      </div>
    </div>
  );
}
