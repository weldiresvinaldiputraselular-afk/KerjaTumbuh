export type Role = "seeker" | "umkm" | "admin";
export type WorkType = "full_time" | "part_time" | "magang" | "freelance" | "remote";
export type VacancyStatus = "draft" | "pending" | "verified" | "rejected" | "filled";
export type ApplicationStatus = "submitted" | "reviewed" | "interview" | "accepted" | "rejected";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string | null;
  is_active: boolean;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface UmkmInfo {
  id?: string;
  business_name: string;
  city: string | null;
  verification_status: string;
  description?: string | null;
}

export interface Vacancy {
  id: string;
  umkm_id: string;
  title: string;
  description: string;
  city: string | null;
  work_type: WorkType;
  min_experience: number;
  positions: number;
  salary_note: string | null;
  status: VacancyStatus;
  review_note: string | null;
  created_at: string;
  umkm_profiles?: UmkmInfo | null;
  vacancy_skills?: { skill_id: number; skills?: { id: number; name: string } | null }[];
}

export interface SeekerRow {
  id: string;
  profile_id: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  education_level: string | null;
  years_experience: number;
  seeker_skills?: { skill_id: number; level: number; skills?: { name: string } | null }[];
}

export interface ImpactStats {
  vacancies: number;
  seekers: number;
  umkm: number;
  applications: number;
  filled: number;
  monthly: { month: string; applications: number; vacancies: number }[];
}
