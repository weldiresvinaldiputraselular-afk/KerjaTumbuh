import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import Flash from "@/components/Flash";
import SubmitButton from "@/components/SubmitButton";
import { register } from "@/app/actions/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell title="Buat akun baru" subtitle="Bergabung sebagai pencari kerja atau pemilik UMKM.">
      <Flash msg={sp.msg} error={sp.error} />
      <form action={register} className="space-y-4">
        <fieldset>
          <legend className="label">Saya mendaftar sebagai</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold has-[:checked]:border-brand-dark has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="seeker" defaultChecked className="accent-green-600" /> Pencari kerja
            </label>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold has-[:checked]:border-brand-dark has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="umkm" className="accent-green-600" /> Pemilik UMKM
            </label>
          </div>
        </fieldset>
        <div>
          <label htmlFor="full_name" className="label">Nama lengkap</label>
          <input id="full_name" name="full_name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="business_name" className="label">Nama usaha (khusus UMKM)</label>
          <input id="business_name" name="business_name" maxLength={100} className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Kata sandi (minimal 8 karakter)</label>
          <input id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="input" />
        </div>
        <SubmitButton className="btn w-full">Buat akun</SubmitButton>
        <p className="muted text-center">Sudah punya akun? <Link href="/login" className="font-bold text-brand-dark underline">Masuk</Link></p>
      </form>
    </AuthShell>
  );
}
