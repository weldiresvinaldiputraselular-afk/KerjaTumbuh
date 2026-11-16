import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import Flash from "@/components/Flash";
import SubmitButton from "@/components/SubmitButton";
import { login } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell title="Selamat datang kembali" subtitle="Masuk untuk melanjutkan ke dashboard Anda.">
      <Flash msg={sp.msg} error={sp.error} />
      <form action={login} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="nama@email.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Kata sandi</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="Kata sandi" />
        </div>
        <SubmitButton className="btn w-full">Masuk</SubmitButton>
        <p className="muted text-center">Belum punya akun? <Link href="/register" className="font-bold text-brand-dark underline">Daftar</Link></p>
      </form>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">Akun demo (DEMO)</p>
        <p className="mt-0.5 text-xs">Tersedia setelah menjalankan <code>npm run seed</code>. Kata sandi ada di README.</p>
        <ul className="mt-2 space-y-1">
          <li><span className="font-semibold">Pencari kerja:</span> demo.seeker1@kerjatumbuh.test</li>
          <li><span className="font-semibold">UMKM:</span> demo.umkm1@kerjatumbuh.test</li>
          <li><span className="font-semibold">Admin:</span> demo.admin@kerjatumbuh.test</li>
        </ul>
      </div>
    </AuthShell>
  );
}
