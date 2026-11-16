"use server";

import { requireSeeker, seekerSkillIds } from "@/lib/auth";
import { go } from "@/lib/flash";
import { computeMatch } from "@/lib/matching";
import { applicationSchema, firstError, reportSchema } from "@/lib/validation";

export async function applyToVacancy(formData: FormData) {
  const { supabase, seeker } = await requireSeeker();
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/lowongan", "error", firstError(parsed.error));
  const { vacancy_id, cover_note } = parsed.data;
  const back = `/lowongan/${vacancy_id}`;

  const { data: vac } = await supabase
    .from("job_vacancies")
    .select("id, city, work_type, min_experience, status, vacancy_skills(skill_id)")
    .eq("id", vacancy_id)
    .single();
  if (!vac || vac.status !== "verified") go("/lowongan", "error", "Lowongan tidak tersedia.");

  const match = computeMatch(
    { city: seeker.city, years_experience: seeker.years_experience, skill_ids: seekerSkillIds(seeker) },
    {
      city: vac.city,
      work_type: vac.work_type,
      min_experience: vac.min_experience,
      skill_ids: (vac.vacancy_skills ?? []).map((v: { skill_id: number }) => v.skill_id),
    },
  );

  const { error } = await supabase
    .from("job_applications")
    .insert({ vacancy_id, seeker_id: seeker.id, cover_note, match_score: match.score });
  if (error) {
    if (error.code === "23505") go(back, "error", "Anda sudah melamar lowongan ini.");
    go(back, "error", "Lamaran gagal dikirim.");
  }
  go(back, "msg", "Lamaran berhasil dikirim.");
}

export async function reportVacancy(formData: FormData) {
  const { supabase, user } = await requireSeeker();
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/lowongan", "error", firstError(parsed.error));
  const { vacancy_id, reason } = parsed.data;
  const back = `/lowongan/${vacancy_id}`;
  const { error } = await supabase.from("reports").insert({ vacancy_id, reporter_id: user.id, reason });
  if (error) {
    if (error.code === "23505") go(back, "error", "Anda sudah melaporkan lowongan ini.");
    go(back, "error", "Laporan gagal dikirim.");
  }
  go(back, "msg", "Laporan terkirim. Administrator akan memeriksanya.");
}
