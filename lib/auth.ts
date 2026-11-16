import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role, SeekerRow } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as Profile | null };
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_active")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile: (data as Profile | null) ?? null };
}

export async function requireRole(roles: Role[]) {
  const s = await getSessionProfile();
  if (!s.user || !s.profile) redirect("/login");
  if (!s.profile.is_active) redirect("/login?error=" + encodeURIComponent("Akun Anda dinonaktifkan oleh administrator."));
  if (!roles.includes(s.profile.role)) redirect("/dashboard");
  return { supabase: s.supabase, user: s.user, profile: s.profile };
}

export async function requireSeeker() {
  const ctx = await requireRole(["seeker"]);
  const seeker = await loadSeeker(ctx.supabase, ctx.user.id);
  if (!seeker) redirect("/login?error=" + encodeURIComponent("Data pencari kerja tidak ditemukan."));
  return { ...ctx, seeker };
}

export async function requireUmkm() {
  const ctx = await requireRole(["umkm"]);
  const { data } = await ctx.supabase.from("umkm_profiles").select("*").eq("profile_id", ctx.user.id).single();
  if (!data) redirect("/login?error=" + encodeURIComponent("Data UMKM tidak ditemukan."));
  return { ...ctx, umkm: data as {
    id: string; business_name: string; sector: string | null; city: string | null;
    description: string | null; verification_status: string;
  } };
}

export async function loadSeeker(supabase: SupabaseClient, profileId: string): Promise<SeekerRow | null> {
  const { data } = await supabase
    .from("job_seekers")
    .select("*, seeker_skills(skill_id, level, skills(name))")
    .eq("profile_id", profileId)
    .single();
  return (data as SeekerRow | null) ?? null;
}

export function seekerSkillIds(seeker: SeekerRow): number[] {
  return (seeker.seeker_skills ?? []).map((s) => s.skill_id);
}

export function seekerSkillNames(seeker: SeekerRow): string[] {
  return (seeker.seeker_skills ?? []).map((s) => s.skills?.name ?? "").filter(Boolean);
}
