import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImpactStats, Skill, Vacancy } from "@/lib/types";

export async function loadSkills(supabase: SupabaseClient): Promise<Skill[]> {
  const { data } = await supabase.from("skills").select("id, name, category").order("category").order("name");
  return (data as Skill[] | null) ?? [];
}

export async function loadVerifiedVacancies(supabase: SupabaseClient): Promise<Vacancy[]> {
  const { data } = await supabase
    .from("job_vacancies")
    .select("*, umkm_profiles(id, business_name, city, verification_status), vacancy_skills(skill_id, skills(id, name))")
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Vacancy[] | null) ?? [];
}

export function vacancySkillIds(v: Vacancy): number[] {
  return (v.vacancy_skills ?? []).map((s) => s.skill_id);
}

export async function loadImpactStats(supabase: SupabaseClient): Promise<ImpactStats | null> {
  const { data, error } = await supabase.rpc("impact_stats");
  if (error || !data) return null;
  return data as ImpactStats;
}
