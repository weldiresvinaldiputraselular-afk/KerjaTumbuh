import Shell from "@/components/Shell";
import { requireSeeker, seekerSkillIds } from "@/lib/auth";
import { aggregateSkillGaps, rankByMatch } from "@/lib/matching";
import { loadVerifiedVacancies, vacancySkillIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface Res { skill_id: number; title: string; url: string; level: string; provider: string | null }

export default async function SkillDevelopment() {
  const { supabase, seeker } = await requireSeeker();
  const vacancies = await loadVerifiedVacancies(supabase);
  const owned = seekerSkillIds(seeker);
  const me = { city: seeker.city, years_experience: seeker.years_experience, skill_ids: owned };
  const ranked = rankByMatch(me, vacancies, (v) => ({ city: v.city, work_type: v.work_type, min_experience: v.min_experience, skill_ids: vacancySkillIds(v) }));
  const gaps = aggregateSkillGaps(ranked.map((r) => r.match.missingSkillIds)).slice(0, 8);

  const names = new Map<number, string>();
  vacancies.forEach((v) => v.vacancy_skills?.forEach((s) => s.skills && names.set(s.skills.id, s.skills.name)));
  const ids = gaps.map((g) => g.skillId);
  const { data: res } = ids.length ? await supabase.from("learning_resources").select("skill_id, title, url, level, provider").in("skill_id", ids) : { data: [] };
  const resources = (res as Res[] | null) ?? [];

  const topTitles = ranked.slice(0, 3).filter((r) => r.match.missingSkillIds.length > 0);

  return (
    <Shell>
      <h1 className="h1">Skill Development</h1>
      <p className="muted mb-4">Keterampilan yang paling sering dibutuhkan lowongan terverifikasi namun belum ada di profilmu.</p>
      {gaps.length === 0 ? (
        <div className="card muted">Tidak ada kekurangan keterampilan terdeteksi, atau belum ada lowongan terverifikasi. Pastikan keterampilanmu sudah diisi di halaman Profil.</div>
      ) : (
        <ol className="space-y-3">
          {gaps.map((g, i) => (
            <li key={g.skillId} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold">{i + 1}. {names.get(g.skillId) ?? `Skill #${g.skillId}`}</p>
                <span className="badge bg-amber-100 text-amber-800">Dibutuhkan di {g.count} lowongan</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {resources.filter((r) => r.skill_id === g.skillId).map((r) => (
                  <li key={r.url + r.title}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline">{r.title}</a>
                    <span className="text-slate-500"> · {r.provider ?? "Sumber belajar"} · {r.level}</span>
                  </li>
                ))}
                {resources.filter((r) => r.skill_id === g.skillId).length === 0 && <li className="muted">Belum ada materi untuk keterampilan ini.</li>}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {topTitles.length > 0 && (
        <section className="card mt-6" aria-labelledby="target">
          <h2 id="target" className="h2">Target lowongan teratas dan kekurangannya</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {topTitles.map((r) => (
              <li key={r.item.id}><strong>{r.item.title}</strong> ({r.match.score}%): perlu {r.match.missingSkillIds.map((id) => names.get(id) ?? `#${id}`).join(", ")}</li>
            ))}
          </ul>
        </section>
      )}
      <p className="muted mt-4">Materi belajar adalah kurasi awal (DEMO) yang mengarah ke situs penyedia. Periksa tautan sebelum dipakai.</p>
    </Shell>
  );
}
