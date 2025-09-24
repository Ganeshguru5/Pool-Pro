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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Competition, Participant } from '@/lib/types';
import { TAMIL_NADU_DISTRICTS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  district: z.string().min(1, { message: 'District is required.' }),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  participant: Participant | null;
  competition: Competition;
  onFormSubmit: (participant: Participant) => void;
}

export function ParticipantForm({ isOpen, setIsOpen, participant, competition, onFormSubmit }: ParticipantFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        district: '',
    },
  });

  useEffect(() => {
    if (participant) {
      form.reset(participant);
    } else {
      form.reset({
        name: '',
        district: '',
      });
    }
  }, [participant, form, isOpen]);


  const onSubmit = (data: ParticipantFormValues) => {
    const newParticipant: Participant = {
      id: participant ? participant.id : crypto.randomUUID(),
      competition_id: competition.id,
      ...data,
      registration_date: participant ? participant.registration_date : new Date().toISOString(),
      pool_assignment: participant ? participant.pool_assignment : null,
    };

    onFormSubmit(newParticipant);

    if (participant) {
      toast({ title: 'Success', description: 'Participant updated successfully.' });
    } else {
      toast({ title: 'Success', description: 'Participant added successfully.' });
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {participant ? 'Edit Participant' : 'Add Participant'}
          </DialogTitle>
          <DialogDescription>
            {participant ? 'Update details for this participant.' : `Register a new participant for ${competition.competition_name}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAMIL_NADU_DISTRICTS.map(district => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">
                {participant ? 'Save Changes' : 'Add Participant'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
