"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { go } from "@/lib/flash";
import { firstError, loginSchema, registerSchema } from "@/lib/validation";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/login", "error", firstError(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) go("/login", "error", "Email atau kata sandi salah.");
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) go("/register", "error", firstError(parsed.error));
  const { email, password, full_name, role, business_name } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role, business_name: business_name ?? "" } },
  });
  if (error) go("/register", "error", "Registrasi gagal: " + error.message);
  if (data.session) redirect("/dashboard");
  go("/login", "msg", "Registrasi berhasil. Cek email Anda untuk konfirmasi, lalu masuk.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
