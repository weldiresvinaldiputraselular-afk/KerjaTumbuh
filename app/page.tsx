import Link from "next/link";
import Shell from "@/components/Shell";
import Icon, { type IconName } from "@/components/Icon";
import { getSessionProfile } from "@/lib/auth";
import { loadImpactStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "Buat profil", d: "Isi keterampilan, pengalaman, dan portofolio. UMKM mengisi profil usaha dan memasang lowongan." },
  { n: "2", t: "Temukan yang cocok", d: "Sistem menghitung skor kecocokan dan menampilkan lowongan terbaik beserta skill yang perlu ditingkatkan." },
  { n: "3", t: "Lamar dan tumbuh", d: "Kirim lamaran, pantau statusnya, dan pelajari materi untuk menambah peluang diterima." },
];

const FEATURES: { icon: IconName; t: string; d: string }[] = [
  { icon: "target", t: "Smart Job Matching", d: "Skor kecocokan 0-100% dari keterampilan, lokasi, dan pengalaman. Aturannya transparan." },
  { icon: "store", t: "UMKM Connect", d: "UMKM membuat profil usaha, memasang lowongan, dan mengelola pelamar di satu tempat." },
  { icon: "shield", t: "Verified Job", d: "Setiap lowongan diperiksa admin sebelum tayang. Lowongan mencurigakan dapat dilaporkan." },
  { icon: "book", t: "Skill Development", d: "Daftar keterampilan yang paling dicari dan materi belajar untuk mengejarnya." },
  { icon: "sparkles", t: "AI Career Assistant", d: "Bantuan menyusun ringkasan CV dan saran karier. Jalan lokal tanpa API berbayar." },
  { icon: "chart", t: "Economic Impact", d: "Pantau lowongan, pelamar, UMKM, dan lowongan terisi dalam grafik yang mudah dibaca." },
];

const SEEKER_POINTS = ["Rekomendasi lowongan sesuai keterampilan", "Tahu skill apa yang perlu dipelajari", "Portofolio dan profil karier dalam satu tempat"];
const UMKM_POINTS = ["Pasang lowongan dengan lencana Verified", "Pelamar diurutkan berdasarkan kecocokan", "Pantau lowongan terisi dan dampak usaha"];

export default async function Home() {
  const { supabase, profile } = await getSessionProfile().catch(() => ({ supabase: null, profile: null }));
  const stats = supabase ? await loadImpactStats(supabase).catch(() => null) : null;
  return (
    <Shell wide>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-teal-700 to-brand px-5 py-10 text-white shadow-lift sm:px-10 sm:py-14 lg:py-16">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-brand-accent/25 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-brand-accent" /> SDG 8 · Pekerjaan Layak dan Pertumbuhan Ekonomi
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Kerja yang cocok, usaha lokal yang <span className="text-brand-accent">tumbuh</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-emerald-50 sm:text-lg">
              KerjaTumbuh mempertemukan pencari kerja, pemuda yang sedang mengembangkan keterampilan, dan UMKM lokal dengan lowongan yang terverifikasi.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/lowongan" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-brand-dark shadow-lift transition hover:bg-emerald-50 active:scale-[0.98]">
                <Icon name="search" /> Cari Lowongan
              </Link>
              {profile ? (
                <Link href="/dashboard" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-6 text-base font-bold text-white transition hover:bg-white/10">Ke Dashboard</Link>
              ) : (
                <Link href="/register" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-6 text-base font-bold text-white transition hover:bg-white/10"><Icon name="store" /> Daftarkan UMKM</Link>
              )}
            </div>
          </div>

          {/* Kartu contoh */}
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="animate-float rounded-2xl bg-white p-5 text-slate-900 shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Rekomendasi untukmu</p>
                  <p className="mt-1 text-lg font-extrabold">Admin Media Sosial</p>
                  <p className="text-sm text-slate-600">Toko Contoh A · Pontianak</p>
                </div>
                <span className="badge bg-green-100 text-green-800">✔ Verified</span>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-end justify-between text-xs text-slate-600"><span>Sangat cocok</span><span className="text-xl font-extrabold text-green-700">86%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[86%] rounded-full bg-gradient-to-r from-green-500 to-emerald-600" /></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="badge bg-slate-100 text-slate-700">Canva</span>
                <span className="badge bg-slate-100 text-slate-700">Media Sosial</span>
                <span className="badge bg-amber-100 text-amber-800">Perlu: Copywriting</span>
              </div>
            </div>
            <div className="animate-float-slow absolute -bottom-8 -left-4 w-52 rounded-2xl bg-white p-4 text-slate-900 shadow-lift sm:-left-10">
              <p className="text-xs text-slate-500">Lamaran diterima</p>
              <p className="text-2xl font-extrabold text-brand-dark">+12</p>
              <p className="text-xs text-slate-500">bulan ini (contoh)</p>
            </div>
            <p className="mt-12 text-center text-xs text-emerald-100">Contoh tampilan · data DEMO</p>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      {stats && (
        <section aria-label="Dampak platform" className="-mt-6 px-2 sm:px-8">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lift sm:grid-cols-4 sm:p-6">
            {[
              { l: "Lowongan", v: stats.vacancies },
              { l: "Pencari kerja", v: stats.seekers },
              { l: "UMKM", v: stats.umkm },
              { l: "Lowongan terisi", v: stats.filled },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-3xl font-extrabold text-brand-dark sm:text-4xl">{s.v}</p>
                <p className="text-xs font-medium text-slate-600 sm:text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CARA KERJA */}
      <section id="cara-kerja" aria-labelledby="ck" className="scroll-mt-24 pt-14">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Cara kerja</p>
        <h2 id="ck" className="section-title mt-1">Tiga langkah menuju kerja yang cocok</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card card-hover">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-lg font-extrabold text-white">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="muted mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" aria-labelledby="ft" className="scroll-mt-24 pt-14">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Fitur unggulan</p>
        <h2 id="ft" className="section-title mt-1">Dirancang agar kerja dan usaha sama-sama tumbuh</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="card card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><Icon name={f.icon} className="h-6 w-6" /></span>
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="muted mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DUA SISI */}
      <section aria-label="Untuk siapa" className="grid gap-4 pt-14 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-white p-6 ring-1 ring-amber-200 sm:p-8">
          <span className="badge bg-amber-100 text-amber-800">Untuk pencari kerja</span>
          <h3 className="mt-3 text-2xl font-extrabold">Temukan peluang yang sesuai kemampuanmu</h3>
          <ul className="mt-4 space-y-2.5">
            {SEEKER_POINTS.map((p) => <li key={p} className="flex items-start gap-2.5 text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900"><Icon name="check" className="h-3.5 w-3.5" /></span>{p}</li>)}
          </ul>
          <Link href="/register" className="btn mt-6">Daftar sebagai pencari kerja <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-brand-soft to-white p-6 ring-1 ring-green-200 sm:p-8">
          <span className="badge bg-green-100 text-green-800">Untuk UMKM</span>
          <h3 className="mt-3 text-2xl font-extrabold">Rekrut tenaga kerja lokal dengan lebih mudah</h3>
          <ul className="mt-4 space-y-2.5">
            {UMKM_POINTS.map((p) => <li key={p} className="flex items-start gap-2.5 text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-900"><Icon name="check" className="h-3.5 w-3.5" /></span>{p}</li>)}
          </ul>
          <Link href="/register" className="btn mt-6">Daftarkan usahamu <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-center text-white sm:py-14">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Mulai tumbuh bersama KerjaTumbuh</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-300">Gratis untuk dicoba. Jelajahi lowongan terverifikasi tanpa perlu masuk.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/lowongan" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand px-6 font-bold text-white transition hover:brightness-110">Lihat Lowongan</Link>
          <Link href="/login" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-white/40 px-6 font-bold text-white transition hover:bg-white/10">Masuk</Link>
        </div>
      </section>
    </Shell>
  );
}
