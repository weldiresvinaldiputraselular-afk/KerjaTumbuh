import Shell from "@/components/Shell";
import { requireSeeker, seekerSkillIds, seekerSkillNames } from "@/lib/auth";
import { askExternalAi, externalAiEnabled } from "@/lib/aiExternal";
import { careerRecommendations, generateCvSummary, profileCompleteness, profileTips, type AssistantProfile } from "@/lib/assistant";
import { aggregateSkillGaps, rankByMatch } from "@/lib/matching";
import { loadVerifiedVacancies, vacancySkillIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

const TASKS: Record<string, string> = {
  cv: "Buat ringkasan CV",
  karier: "Rekomendasi karier",
  profil: "Tingkatkan kualitas profil",
};

export default async function CareerAssistant({ searchParams }: { searchParams: Promise<{ tugas?: string; target?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile, seeker } = await requireSeeker();
  const [exp, port] = await Promise.all([
    supabase.from("seeker_experiences").select("title, organization").eq("seeker_id", seeker.id),
    supabase.from("seeker_portfolios").select("id", { count: "exact", head: true }).eq("seeker_id", seeker.id),
  ]);
  const p: AssistantProfile = {
    name: profile.full_name, headline: seeker.headline, bio: seeker.bio, city: seeker.city, education: seeker.education_level,
    years: seeker.years_experience, skills: seekerSkillNames(seeker),
    experiences: (exp.data as { title: string; organization: string | null }[] | null) ?? [], portfolioCount: port.count ?? 0,
  };
  const task = sp.tugas && TASKS[sp.tugas] ? sp.tugas : "";
  const target = (sp.target ?? "").trim().slice(0, 80);
  const apiMode = externalAiEnabled();

  let local: string[] = [];
  if (task === "cv") local = [generateCvSummary(p, target || undefined)];
  if (task === "profil") local = profileTips(p).map((t) => `[${t.priority}] ${t.text}`);
  if (task === "karier") {
    const vacancies = await loadVerifiedVacancies(supabase);
    const me = { city: seeker.city, years_experience: seeker.years_experience, skill_ids: seekerSkillIds(seeker) };
    const ranked = rankByMatch(me, vacancies, (v) => ({ city: v.city, work_type: v.work_type, min_experience: v.min_experience, skill_ids: vacancySkillIds(v) }));
    const names = new Map<number, string>();
    vacancies.forEach((v) => v.vacancy_skills?.forEach((s) => s.skills && names.set(s.skills.id, s.skills.name)));
    const gaps = aggregateSkillGaps(ranked.slice(0, 5).map((r) => r.match.missingSkillIds)).map((g) => names.get(g.skillId) ?? "");
    local = careerRecommendations(p, ranked.slice(0, 3).map((r) => ({ title: r.item.title, score: r.match.score })), gaps.filter(Boolean));
  }

  let api: string | null = null;
  if (task && apiMode) {
    const context = `Nama: ${p.name}. Pendidikan: ${p.education ?? "-"}. Pengalaman: ${p.years} tahun. Kota: ${p.city ?? "-"}. Keterampilan: ${p.skills.join(", ") || "-"}. Target posisi: ${target || "-"}.`;
    api = await askExternalAi(`Anda asisten karier untuk pencari kerja di Indonesia. Tugas: ${TASKS[task]}. Jawab singkat dalam Bahasa Indonesia, maksimal 120 kata, tanpa data pribadi tambahan.\n${context}`);
  }
  const completeness = profileCompleteness(p);

  return (
    <Shell>
      <h1 className="h1">AI Career Assistant</h1>
      <p className="muted mb-1">Mode: <strong>{api ? "API eksternal (opsional)" : "Lokal berbasis aturan (tanpa API)"}</strong>. Kelengkapan profil Anda: {completeness.percent}%.</p>
      <p className="muted mb-4">Saran bersifat bantuan awal, bukan pengganti penilaian Anda sendiri.</p>
      <form method="get" className="card grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="tugas" className="label">Apa yang ingin dibantu?</label>
          <select id="tugas" name="tugas" defaultValue={task} className="input" required>
            <option value="" disabled>Pilih tugas</option>
            {Object.entries(TASKS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="target" className="label">Target posisi (opsional)</label>
          <input id="target" name="target" defaultValue={target} maxLength={80} className="input" placeholder="Contoh: Admin media sosial" />
        </div>
        <div className="flex items-end"><button className="btn" type="submit">Buat saran</button></div>
      </form>
      {task && (
        <section className="card mt-4" aria-live="polite" aria-labelledby="hasil">
          <h2 id="hasil" className="h2">{TASKS[task]}</h2>
          {api ? <p className="mt-2 whitespace-pre-line text-slate-800">{api}</p> : (
            <ul className="mt-2 space-y-2 text-slate-800">{local.map((t, i) => <li key={i} className="rounded-lg bg-slate-50 p-3">{t}</li>)}</ul>
          )}
        </section>
      )}
    </Shell>
  );
}
