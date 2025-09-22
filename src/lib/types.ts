
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
  address: string;
  organized_by: string;
  age_category: string; 
  weight_category: string;
  status: CompetitionStatusType;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  competition_id: string;
  name: string;
  district: string;
  registration_date: string;
  pool_assignment: string | null;
};
