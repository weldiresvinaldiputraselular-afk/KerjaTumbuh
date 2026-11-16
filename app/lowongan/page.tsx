import Link from "next/link";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { MatchBar, VerifiedBadge } from "@/components/Badge";
import { getSessionProfile, loadSeeker, seekerSkillIds } from "@/lib/auth";
import { rankByMatch } from "@/lib/matching";
import { loadVerifiedVacancies, vacancySkillIds } from "@/lib/queries";
import { WORK_TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VacancyList({ searchParams }: { searchParams: Promise<{ q?: string; kota?: string; tipe?: string; urut?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getSessionProfile();
  let vacancies = await loadVerifiedVacancies(supabase);

  const q = (sp.q ?? "").trim().toLowerCase();
  const kota = (sp.kota ?? "").trim().toLowerCase();
  if (q) {
    vacancies = vacancies.filter((v) =>
      [v.title, v.description, v.umkm_profiles?.business_name ?? "", ...(v.vacancy_skills ?? []).map((s) => s.skills?.name ?? "")]
        .join(" ").toLowerCase().includes(q));
  }
  if (kota) vacancies = vacancies.filter((v) => (v.city ?? "").toLowerCase().includes(kota));
  if (sp.tipe) vacancies = vacancies.filter((v) => v.work_type === sp.tipe);

  let rows = vacancies.map((v) => ({ v, score: null as number | null }));
  const seeker = user && profile?.role === "seeker" ? await loadSeeker(supabase, user.id) : null;
  if (seeker) {
    const me = { city: seeker.city, years_experience: seeker.years_experience, skill_ids: seekerSkillIds(seeker) };
    const ranked = rankByMatch(me, vacancies, (v) => ({ city: v.city, work_type: v.work_type, min_experience: v.min_experience, skill_ids: vacancySkillIds(v) }));
    rows = ranked.map((r) => ({ v: r.item, score: r.match.score }));
    if (sp.urut === "terbaru") rows.sort((a, b) => b.v.created_at.localeCompare(a.v.created_at));
  }

  return (
    <Shell wide>
      <PageHeader title="Daftar Lowongan" subtitle={`Hanya lowongan yang sudah diverifikasi administrator yang tampil di sini.${!seeker ? " Masuk sebagai pencari kerja untuk melihat persentase kecocokan." : ""}`} />
      <form method="get" className="card mb-4 grid gap-3 sm:grid-cols-5" role="search">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="label">Kata kunci</label>
          <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Posisi, usaha, atau keterampilan" className="input" />
        </div>
        <div>
          <label htmlFor="kota" className="label">Kota</label>
          <input id="kota" name="kota" defaultValue={sp.kota ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="tipe" className="label">Jenis kerja</label>
          <select id="tipe" name="tipe" defaultValue={sp.tipe ?? ""} className="input">
            <option value="">Semua</option>
            {Object.entries(WORK_TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button className="btn" type="submit">Cari</button>
          <Link href="/lowongan" className="btn-outline">Reset</Link>
        </div>
      </form>
      <p className="muted mb-3" aria-live="polite">{rows.length} lowongan ditemukan.</p>
      {rows.length === 0 ? (
        <div className="card muted">Tidak ada lowongan yang cocok dengan filter.</div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ v, score }) => (
            <li key={v.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/lowongan/${v.id}`} className="text-lg font-semibold hover:underline">{v.title}</Link>
                  <p className="muted">{v.umkm_profiles?.business_name} · {v.city ?? "Lokasi fleksibel"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <VerifiedBadge />
                    <span className="badge bg-amber-100 text-amber-800">{WORK_TYPE_LABEL[v.work_type]}</span>
                    {(v.vacancy_skills ?? []).slice(0, 4).map((s) => <span key={s.skill_id} className="badge bg-slate-100 text-slate-700">{s.skills?.name}</span>)}
                  </div>
                </div>
                <div className="w-44">{score !== null && <MatchBar score={score} />}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
