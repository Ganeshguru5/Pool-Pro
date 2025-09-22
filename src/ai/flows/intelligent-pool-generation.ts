'use server';

/**
 * @fileOverview This file implements the intelligent pool generation flow.
 *
 * It automatically generates balanced pools of participants, grouping those from the same district together where possible, to save time and ensure fair competition.
 *
 * - generateBalancedPools - A function that generates balanced pools of participants.
 * - GenerateBalancedPoolsInput - The input type for the generateBalancedPools function.
 * - GenerateBalancedPoolsOutput - The return type for the generateBalancedPools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParticipantSchema = z.object({
  id: z.string(),
  competition_id: z.string(),
  name: z.string(),
  age: z.number(),
  district: z.string(),
  phone_number: z.string().optional(),
  email: z.string().optional(),
  emergency_contact: z.string().optional(),
  special_requirements: z.string().optional(),
  registration_date: z.string(),
  pool_assignment: z.string().nullable(),
});

export type Participant = z.infer<typeof ParticipantSchema>;

const GenerateBalancedPoolsInputSchema = z.object({
  participants: z.array(ParticipantSchema).describe('List of participants to be assigned to pools.'),
  competition_rules: z.string().optional().describe('Any competition specific rules that need to be adhered to when creating pools.'),
});

export type GenerateBalancedPoolsInput = z.infer<
  typeof GenerateBalancedPoolsInputSchema
>;

const GenerateBalancedPoolsOutputSchema = z.object({
  pools: z
    .array(z.array(z.string()))
    .describe('A list of pools, where each pool is a list of participant IDs assigned to that pool.'),
});

export type GenerateBalancedPoolsOutput = z.infer<
  typeof GenerateBalancedPoolsOutputSchema
>;

export async function generateBalancedPools(
  input: GenerateBalancedPoolsInput
): Promise<GenerateBalancedPoolsOutput> {
  return generateBalancedPoolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBalancedPoolsPrompt',
  input: {
    schema: GenerateBalancedPoolsInputSchema,
  },
  output: {
    schema: GenerateBalancedPoolsOutputSchema,
  },
  prompt: `You are an expert competition organizer. Given a list of participants, you will create a set of balanced pools.

Each pool should contain an even number of participants wherever possible.
Participants from the same district should be preferentially grouped together to minimize cross-district splits within pools.
Ensure pool sizes are as equal as possible.

Adhere to the following competition specific rules: {{{competition_rules}}}

Participants: {{{JSON.stringify(participants)}}}

Return only a JSON array of arrays, where each inner array is a list of participant IDs assigned to that pool.
`,  
});

const generateBalancedPoolsFlow = ai.defineFlow(
  {
    name: 'generateBalancedPoolsFlow',
    inputSchema: GenerateBalancedPoolsInputSchema,
    outputSchema: GenerateBalancedPoolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
