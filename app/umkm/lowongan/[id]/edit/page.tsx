import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import VacancyForm from "@/components/VacancyForm";
import { requireUmkm } from "@/lib/auth";
import { loadSkills } from "@/lib/queries";
import { updateVacancy } from "@/app/actions/umkm";
import type { Vacancy } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditVacancy({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, umkm } = await requireUmkm();
  const { data } = await supabase.from("job_vacancies").select("*, vacancy_skills(skill_id)").eq("id", id).eq("umkm_id", umkm.id).single();
  if (!data) notFound();
  const v = data as Vacancy;
  const skills = await loadSkills(supabase);
  return (
    <Shell>
      <h1 className="h1 mb-2">Ubah Lowongan</h1>
      {v.status === "verified" && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Lowongan ini berstatus Verified. Mengubah judul, deskripsi, kota, atau jenis kerja akan mengembalikannya ke antrean verifikasi.</p>}
      <Flash msg={sp.msg} error={sp.error} />
      <VacancyForm action={updateVacancy} skills={skills} submitLabel="Simpan perubahan"
        defaults={{ id: v.id, title: v.title, description: v.description, city: v.city, work_type: v.work_type, min_experience: v.min_experience, positions: v.positions, salary_note: v.salary_note, skillIds: (v.vacancy_skills ?? []).map((s) => s.skill_id), status: v.status }} />
    </Shell>
  );
}
