export const CompetitionStatus = ["draft", "active", "registration_closed", "completed"] as const;
export type CompetitionStatusType = (typeof CompetitionStatus)[number];

export type Competition = {
  id: string;
  competition_name: string;
  competition_type: string;
  competition_date: string;
  registration_deadline: string;
  venue?: string;
  description?: string;
  max_participants?: number;
  min_age?: number;
  max_age?: number;
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
  phone_number?: string;
  email?: string;
  emergency_contact?: string;
  special_requirements?: string;
  registration_date: string;
  pool_assignment: string | null;
};
