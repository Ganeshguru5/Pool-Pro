export const CompetitionStatus = ["draft", "active", "registration_closed", "completed"] as const;
export type CompetitionStatusType = (typeof CompetitionStatus)[number];

export type AgeCategory = {
    id: string;
    name: string;
    description: string;
};

export type WeightCategory = {
    id: string;
    name: string;
    description: string;
};

export type Competition = {
  id: string;
  competition_name: string;
  competition_date: string;
  registration_deadline: string;
  address?: string;
  description?: string;
  age_categories: string[]; // Stores array of age category IDs
  status: CompetitionStatusType;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  competition_id: string;
  name: string;
  age: number;
  district: string;
  age_category: string; // Stores age category ID
  weight_category: string; // Stores weight category ID
  registration_date: string;
  pool_assignment: string | null;
};
