'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import useLocalStorageState from '@/hooks/use-local-storage-state';
import { Competition, CompetitionStatus, CompetitionStatusType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  competition_name: z.string().min(3, { message: 'Competition name must be at least 3 characters.' }),
  competition_type: z.string().min(1, { message: 'Competition type is required.' }),
  competition_date: z.date({ required_error: 'Competition date is required.' }),
  registration_deadline: z.date({ required_error: 'Registration deadline is required.' }),
  venue: z.string().optional(),
  description: z.string().optional(),
  max_participants: z.coerce.number().int().positive().optional(),
  min_age: z.coerce.number().int().positive().optional(),
  max_age: z.coerce.number().int().positive().optional(),
  status: z.enum(CompetitionStatus),
});

type CompetitionFormValues = z.infer<typeof formSchema>;

interface CompetitionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  competition: Competition | null;
}

export function CompetitionForm({ isOpen, setIsOpen, competition }: CompetitionFormProps) {
  const [, setCompetitions] = useLocalStorageState<Competition[]>('competitions', []);
  const { toast } = useToast();
  
  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competition_name: '',
      competition_type: '',
      venue: '',
      description: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (competition) {
      form.reset({
        ...competition,
        competition_date: new Date(competition.competition_date),
        registration_deadline: new Date(competition.registration_deadline),
      });
    } else {
      form.reset({
        competition_name: '',
        competition_type: '',
        venue: '',
        description: '',
        status: 'draft',
        competition_date: undefined,
        registration_deadline: undefined,
        max_participants: undefined,
        min_age: undefined,
        max_age: undefined,
      });
    }
  }, [competition, form, isOpen]);

  const onSubmit = (data: CompetitionFormValues) => {
    const newCompetition: Competition = {
      id: competition ? competition.id : crypto.randomUUID(),
      ...data,
      competition_date: data.competition_date.toISOString(),
      registration_deadline: data.registration_deadline.toISOString(),
      created_at: competition ? competition.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (competition) {
      setCompetitions(prev =>
        prev.map(c => (c.id === competition.id ? newCompetition : c))
      );
      toast({ title: 'Success', description: 'Competition updated successfully.' });
    } else {
      setCompetitions(prev => [...prev, newCompetition]);
      toast({ title: 'Success', description: 'Competition created successfully.' });
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {competition ? 'Edit Competition' : 'Create New Competition'}
          </DialogTitle>
          <DialogDescription>
            {competition ? 'Update the details of your competition.' : 'Fill in the details for your new competition.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="competition_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Dance Off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competition_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Singing, Dancing, Sports" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="competition_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Competition Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registration_deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Registration Deadline</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                           disabled={(date) => date > (form.getValues('competition_date') || new Date()) || date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City Convention Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the competition..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="min_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CompetitionStatus.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">
                {competition ? 'Save Changes' : 'Create Competition'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
