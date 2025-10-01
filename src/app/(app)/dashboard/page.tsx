
'use client';
import { useState } from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitionForm } from '@/components/competition-form';
import useLocalStorageState from '@/hooks/use-local-storage-state';
import type { Competition, Participant } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [competitions, setCompetitions] = useLocalStorageState<Competition[]>('competitions', []);
  const [participants] = useLocalStorageState<Participant[]>('participants', []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);

  const handleCreateNew = () => {
    setEditingCompetition(null);
    setDialogOpen(true);
  };

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition);
    setDialogOpen(true);
  };

  const handleDelete = (competitionId: string) => {
    setCompetitions(prev => prev.filter(c => c.id !== competitionId));
  };
  
  const router = useRouter();

  const handleManageCompetition = (competitionId: string) => {
    localStorage.setItem('selected_competition_id', competitionId);
    router.push('/competition');
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Competitions Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your competitions and view their status.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Competition
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {competitions.length > 0 ? (
          competitions.map(comp => {
            const participantCount = participants.filter(p => p.competition_id === comp.id).length;
            return (
            <Card key={comp.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-xl">{comp.competition_name}</CardTitle>
                    {comp.address && <CardDescription>{comp.address}</CardDescription>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(comp)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                competition and all its participants.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(comp.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div className="text-sm text-muted-foreground">
                  Date: {format(new Date(comp.start_date), 'PPP')}
                </div>
                 <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{participantCount} Participants</span>
                </div>
                 <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      comp.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      comp.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      comp.status === 'registration_closed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>{comp.status.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" className="w-full" onClick={() => handleManageCompetition(comp.id)}>
                    Manage Competition
                </Button>
              </div>
            </Card>
          )})
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 mt-10">
            <CardHeader className="text-center">
              <CardTitle className="font-headline">No Competitions Yet</CardTitle>
              <CardDescription>Get started by creating your first competition.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a Competition
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CompetitionForm
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        competition={editingCompetition}
      />
    </>
  );
}
