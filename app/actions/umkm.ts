"use server";

import { revalidatePath } from "next/cache";
import { requireUmkm } from "@/lib/auth";
import { go } from "@/lib/flash";
import { applicationStatusSchema, firstError, parseIdList, umkmProfileSchema, vacancySchema } from "@/lib/validation";

export async function saveUmkmProfile(formData: FormData) {
  const { supabase, umkm } = await requireUmkm();
  const parsed = umkmProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/umkm/profil", "error", firstError(parsed.error));
  const { error } = await supabase.from("umkm_profiles").update(parsed.data).eq("id", umkm.id);
  if (error) go("/umkm/profil", "error", "Gagal menyimpan profil usaha.");
  go("/umkm/profil", "msg", "Profil usaha disimpan.");
}

export async function requestUmkmVerification() {
  const { supabase, umkm } = await requireUmkm();
  if (umkm.verification_status === "verified") go("/umkm/profil", "msg", "Usaha sudah terverifikasi.");
  const { error } = await supabase.from("umkm_profiles").update({ verification_status: "pending" }).eq("id", umkm.id);
  if (error) go("/umkm/profil", "error", "Gagal mengajukan verifikasi.");
  go("/umkm/profil", "msg", "Pengajuan verifikasi dikirim ke administrator.");
}

async function syncVacancySkills(
  supabase: Awaited<ReturnType<typeof requireUmkm>>["supabase"],
  vacancyId: string,
  skillIds: number[],
) {
  await supabase.from("vacancy_skills").delete().eq("vacancy_id", vacancyId);
  if (skillIds.length > 0) {
    await supabase.from("vacancy_skills").insert(skillIds.map((skill_id) => ({ vacancy_id: vacancyId, skill_id })));
  }
}

export async function createVacancy(formData: FormData) {
  const { supabase, umkm } = await requireUmkm();
  const parsed = vacancySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/umkm/lowongan/baru", "error", firstError(parsed.error));
  const submit = formData.get("submit_for_review") === "on";
  const { data, error } = await supabase
    .from("job_vacancies")
    .insert({ ...parsed.data, umkm_id: umkm.id, status: submit ? "pending" : "draft" })
    .select("id")
    .single();
  if (error || !data) go("/umkm/lowongan/baru", "error", "Gagal membuat lowongan.");
  await syncVacancySkills(supabase, data.id, parseIdList(formData.getAll("skills")));
  go("/umkm/lowongan", "msg", submit ? "Lowongan dikirim untuk diverifikasi." : "Lowongan disimpan sebagai draf.");
}

export async function updateVacancy(formData: FormData) {
  const { supabase } = await requireUmkm();
  const id = String(formData.get("id") ?? "");
  const back = `/umkm/lowongan/${id}/edit`;
  const parsed = vacancySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go(back, "error", firstError(parsed.error));
  const { data: current } = await supabase.from("job_vacancies").select("status").eq("id", id).single();
  if (!current) go("/umkm/lowongan", "error", "Lowongan tidak ditemukan.");
  const submit = formData.get("submit_for_review") === "on";
  const status = submit && ["draft", "rejected"].includes(current.status) ? "pending" : current.status;
  const { error } = await supabase.from("job_vacancies").update({ ...parsed.data, status }).eq("id", id);
  if (error) go(back, "error", "Gagal menyimpan perubahan.");
  await syncVacancySkills(supabase, id, parseIdList(formData.getAll("skills")));
  go("/umkm/lowongan", "msg", "Lowongan diperbarui. Perubahan pada lowongan Verified perlu diverifikasi ulang.");
}

export async function setVacancyStatus(formData: FormData) {
  const { supabase } = await requireUmkm();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const { data: current } = await supabase.from("job_vacancies").select("status").eq("id", id).single();
  if (!current) go("/umkm/lowongan", "error", "Lowongan tidak ditemukan.");
  const allowed: Record<string, string[]> = {
    filled: ["verified"],
    pending: ["draft", "rejected"],
    draft: ["pending", "rejected"],
  };
  if (!allowed[status]?.includes(current.status)) go("/umkm/lowongan", "error", "Perubahan status tidak diizinkan.");
  const { error } = await supabase.from("job_vacancies").update({ status }).eq("id", id);
  if (error) go("/umkm/lowongan", "error", "Gagal mengubah status.");
  go("/umkm/lowongan", "msg", "Status lowongan diperbarui.");
}

export async function deleteVacancy(formData: FormData) {
  const { supabase } = await requireUmkm();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("job_vacancies").delete().eq("id", id);
  if (error) go("/umkm/lowongan", "error", "Gagal menghapus lowongan.");
  go("/umkm/lowongan", "msg", "Lowongan dihapus.");
}

export async function updateApplicationStatus(formData: FormData) {
  const { supabase } = await requireUmkm();
  const parsed = applicationStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/umkm/lowongan", "error", firstError(parsed.error));
  const { id, vacancy_id, status } = parsed.data;
  const back = `/umkm/lowongan/${vacancy_id}/pelamar`;
  const { error } = await supabase.from("job_applications").update({ status }).eq("id", id).eq("vacancy_id", vacancy_id);
  if (error) go(back, "error", "Gagal mengubah status pelamar.");

  if (status === "accepted") {
    const { data: vac } = await supabase.from("job_vacancies").select("positions, status").eq("id", vacancy_id).single();
    const { count } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("vacancy_id", vacancy_id)
      .eq("status", "accepted");
    if (vac && vac.status === "verified" && (count ?? 0) >= vac.positions) {
      await supabase.from("job_vacancies").update({ status: "filled" }).eq("id", vacancy_id);
      revalidatePath("/", "layout");
      go(back, "msg", "Status diperbarui. Semua posisi terisi, lowongan ditandai Terisi.");
    }
  }
  go(back, "msg", "Status pelamar diperbarui.");
}
