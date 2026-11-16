"use server";

import { requireRole } from "@/lib/auth";
import { go } from "@/lib/flash";
import { decisionSchema, firstError } from "@/lib/validation";

export async function decideVacancy(formData: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/admin/verifikasi", "error", firstError(parsed.error));
  const { id, decision, note } = parsed.data;
  if (decision === "rejected" && !note) go("/admin/verifikasi", "error", "Catatan wajib diisi saat menolak.");
  const { error } = await supabase
    .from("job_vacancies")
    .update({ status: decision === "approved" ? "verified" : "rejected", review_note: note })
    .eq("id", id);
  if (error) go("/admin/verifikasi", "error", "Gagal memperbarui lowongan.");
  await supabase.from("verifications").insert({ target_type: "vacancy", target_id: id, admin_id: user.id, decision, note });
  go("/admin/verifikasi", "msg", decision === "approved" ? "Lowongan disetujui." : "Lowongan ditolak.");
}

export async function decideUmkm(formData: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/admin/verifikasi", "error", firstError(parsed.error));
  const { id, decision, note } = parsed.data;
  if (decision === "rejected" && !note) go("/admin/verifikasi", "error", "Catatan wajib diisi saat menolak.");
  const { error } = await supabase
    .from("umkm_profiles")
    .update({ verification_status: decision === "approved" ? "verified" : "rejected" })
    .eq("id", id);
  if (error) go("/admin/verifikasi", "error", "Gagal memperbarui usaha.");
  await supabase.from("verifications").insert({ target_type: "umkm", target_id: id, admin_id: user.id, decision, note });
  go("/admin/verifikasi", "msg", decision === "approved" ? "Usaha diverifikasi." : "Usaha ditolak.");
}

export async function resolveReport(formData: FormData) {
  const { supabase } = await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const vacancyId = String(formData.get("vacancy_id") ?? "");
  if (!["resolved", "dismissed"].includes(status)) go("/admin/verifikasi", "error", "Status laporan tidak valid.");
  if (status === "resolved" && vacancyId) {
    await supabase
      .from("job_vacancies")
      .update({ status: "rejected", review_note: "Dinonaktifkan setelah laporan pengguna." })
      .eq("id", vacancyId);
  }
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) go("/admin/verifikasi", "error", "Gagal memperbarui laporan.");
  go("/admin/verifikasi", "msg", status === "resolved" ? "Laporan ditindaklanjuti, lowongan dinonaktifkan." : "Laporan diabaikan.");
}

export async function toggleUserActive(formData: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (id === user.id) go("/admin/pengguna", "error", "Anda tidak dapat menonaktifkan akun sendiri.");
  const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", id);
  if (error) go("/admin/pengguna", "error", "Gagal mengubah status akun.");
  go("/admin/pengguna", "msg", active ? "Akun diaktifkan." : "Akun dinonaktifkan.");
}
