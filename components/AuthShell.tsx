import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

const POINTS = [
  "Skor kecocokan 0-100% dengan keterampilanmu",
  "Lowongan UMKM yang sudah diverifikasi admin",
  "Rekomendasi skill dan materi belajar",
];

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen md:grid md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-dark via-teal-700 to-brand p-10 text-white md:flex md:flex-col md:justify-between">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-accent/25 blur-2xl" />
        <div className="relative rounded-2xl bg-white/95 px-4 py-2 shadow-lift self-start"><Logo /></div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Kerja yang cocok,<br />usaha lokal yang tumbuh.</h2>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-emerald-50">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20"><Icon name="check" className="h-4 w-4" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-emerald-100">SEVENT X Software Development 2026 · SDG 8</p>
      </section>
      <section className="flex flex-col px-4 py-6 md:px-10 md:py-10">
        <div className="mb-6 flex items-center justify-between md:hidden"><Logo /><Link href="/" className="text-sm font-semibold text-brand-dark">Beranda</Link></div>
        <div className="mx-auto w-full max-w-md flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mb-6 mt-1 text-slate-600">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
