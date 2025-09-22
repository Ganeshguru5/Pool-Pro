'use client';

import { useEffect, useMemo } from 'react';
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
  FormDescription,
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
import { AGE_CATEGORIES, getWeightCategoriesForAgeCategory } from '@/lib/categories';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().int().positive({ message: 'Please enter a valid age.' }),
  district: z.string().min(1, { message: 'District is required.' }),
  age_category: z.string().min(1, { message: 'Age category is required.' }),
  weight_category: z.string().min(1, { message: 'Weight category is required.' }),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  participant: Participant | null;
  competition: Competition;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

export function ParticipantForm({ isOpen, setIsOpen, participant, competition, setParticipants }: ParticipantFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        district: '',
    },
  });

  const selectedAgeCategoryId = form.watch('age_category');
  const availableAgeCategories = useMemo(() => {
    return AGE_CATEGORIES.filter(ac => competition.age_categories.includes(ac.id));
  }, [competition.age_categories]);

  const weightCategories = useMemo(() => {
    return getWeightCategoriesForAgeCategory(selectedAgeCategoryId);
  }, [selectedAgeCategoryId]);


  useEffect(() => {
    if (participant) {
      form.reset(participant);
    } else {
      form.reset({
        name: '',
        age: undefined,
        district: '',
        age_category: '',
        weight_category: '',
      });
    }
  }, [participant, form, isOpen]);

  // Reset weight category when age category changes
  useEffect(() => {
    if (isOpen) {
        form.resetField('weight_category');
    }
  }, [selectedAgeCategoryId, isOpen, form]);

  const onSubmit = (data: ParticipantFormValues) => {
    const newParticipant: Participant = {
      id: participant ? participant.id : crypto.randomUUID(),
      competition_id: competition.id,
      ...data,
      registration_date: participant ? participant.registration_date : new Date().toISOString(),
      pool_assignment: participant ? participant.pool_assignment : null,
    };

    if (participant) {
      setParticipants(prev =>
        prev.map(p => (p.id === participant.id ? newParticipant : p))
      );
      toast({ title: 'Success', description: 'Participant updated successfully.' });
    } else {
      setParticipants(prev => [...prev, newParticipant]);
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
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
            
            <FormField
              control={form.control}
              name="age_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an age category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAgeCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAgeCategoryId && (
                    <FormDescription>
                        {AGE_CATEGORIES.find(ac => ac.id === selectedAgeCategoryId)?.description}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedAgeCategoryId && (
              <FormField
                control={form.control}
                name="weight_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="" disabled={!selectedAgeCategoryId || weightCategories.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a weight category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weightCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && (
                        <FormDescription>
                            {weightCategories.find(wc => wc.id === field.value)?.description}
                        </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
