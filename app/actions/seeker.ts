"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSeeker } from "@/lib/auth";
import { go } from "@/lib/flash";
import { experienceSchema, firstError, parseIdList, portfolioSchema, seekerProfileSchema } from "@/lib/validation";

export async function saveSeekerProfile(formData: FormData) {
  const { supabase, user, seeker } = await requireSeeker();
  const parsed = seekerProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/profil", "error", firstError(parsed.error));
  const { full_name, ...fields } = parsed.data;

  const p = await supabase.from("profiles").update({ full_name }).eq("id", user.id);
  if (p.error) go("/profil", "error", "Gagal menyimpan nama.");
  const s = await supabase.from("job_seekers").update(fields).eq("id", seeker.id);
  if (s.error) go("/profil", "error", "Gagal menyimpan profil.");

  const skillIds = parseIdList(formData.getAll("skills"));
  const del = await supabase.from("seeker_skills").delete().eq("seeker_id", seeker.id);
  if (del.error) go("/profil", "error", "Gagal memperbarui keterampilan.");
  if (skillIds.length > 0) {
    const ins = await supabase
      .from("seeker_skills")
      .insert(skillIds.map((skill_id) => ({ seeker_id: seeker.id, skill_id, level: 3 })));
    if (ins.error) go("/profil", "error", "Gagal menyimpan keterampilan.");
  }
  revalidatePath("/", "layout");
  go("/profil", "msg", "Profil berhasil disimpan.");
}

export async function addExperience(formData: FormData) {
  const { supabase, seeker } = await requireSeeker();
  const parsed = experienceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/profil", "error", firstError(parsed.error));
  const { error } = await supabase.from("seeker_experiences").insert({ ...parsed.data, seeker_id: seeker.id });
  if (error) go("/profil", "error", "Gagal menambah pengalaman.");
  go("/profil", "msg", "Pengalaman ditambahkan.");
}

export async function deleteExperience(formData: FormData) {
  const { supabase, seeker } = await requireSeeker();
  const id = String(formData.get("id") ?? "");
  await supabase.from("seeker_experiences").delete().eq("id", id).eq("seeker_id", seeker.id);
  go("/profil", "msg", "Pengalaman dihapus.");
}

export async function addPortfolio(formData: FormData) {
  const { supabase, seeker } = await requireSeeker();
  const parsed = portfolioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/profil", "error", firstError(parsed.error));
  const { error } = await supabase.from("seeker_portfolios").insert({ ...parsed.data, seeker_id: seeker.id });
  if (error) go("/profil", "error", "Gagal menambah portofolio.");
  go("/profil", "msg", "Portofolio ditambahkan.");
}

export async function deletePortfolio(formData: FormData) {
  const { supabase, seeker } = await requireSeeker();
  const id = String(formData.get("id") ?? "");
  await supabase.from("seeker_portfolios").delete().eq("id", id).eq("seeker_id", seeker.id);
  go("/profil", "msg", "Portofolio dihapus.");
}

export async function markNotificationsRead(formData: FormData) {
  const { supabase, user } = await requireRole(["seeker", "umkm", "admin"]);
  await supabase.from("notifications").update({ is_read: true }).eq("profile_id", user.id).eq("is_read", false);
  const back = String(formData.get("back") ?? "/dashboard");
  revalidatePath("/", "layout");
  go(back.startsWith("/") ? back : "/dashboard", "msg", "Notifikasi ditandai sudah dibaca.");
}
