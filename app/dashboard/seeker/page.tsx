import Link from "next/link";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Flash from "@/components/Flash";
import StatCard from "@/components/StatCard";
import NotificationList from "@/components/NotificationList";
import { MatchBar, StatusBadge } from "@/components/Badge";
import { requireSeeker, seekerSkillIds, seekerSkillNames } from "@/lib/auth";
import { aggregateSkillGaps, rankByMatch } from "@/lib/matching";
import { profileCompleteness } from "@/lib/assistant";
import { loadVerifiedVacancies, vacancySkillIds } from "@/lib/queries";
import { WORK_TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AppRow {
  id: string;
  status: string;
  match_score: number | null;
  job_vacancies: { id: string; title: string; umkm_profiles: { business_name: string } | null } | null;
}

export default async function SeekerDashboard({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile, seeker } = await requireSeeker();
  const vacancies = await loadVerifiedVacancies(supabase);
  const me = { city: seeker.city, years_experience: seeker.years_experience, skill_ids: seekerSkillIds(seeker) };
  const ranked = rankByMatch(me, vacancies, (v) => ({ city: v.city, work_type: v.work_type, min_experience: v.min_experience, skill_ids: vacancySkillIds(v) }));
  const top = ranked.slice(0, 5);

  const nameById = new Map<number, string>();
  vacancies.forEach((v) => v.vacancy_skills?.forEach((s) => s.skills && nameById.set(s.skills.id, s.skills.name)));
  const gaps = aggregateSkillGaps(top.map((t) => t.match.missingSkillIds)).slice(0, 5);

  const [{ data: apps }, exp, port] = await Promise.all([
    supabase.from("job_applications").select("id, status, match_score, job_vacancies(id, title, umkm_profiles(business_name))").eq("seeker_id", seeker.id).order("created_at", { ascending: false }),
    supabase.from("seeker_experiences").select("id", { count: "exact", head: true }).eq("seeker_id", seeker.id),
    supabase.from("seeker_portfolios").select("id", { count: "exact", head: true }).eq("seeker_id", seeker.id),
  ]);
  const completeness = profileCompleteness({
    name: profile.full_name, headline: seeker.headline, bio: seeker.bio, city: seeker.city, education: seeker.education_level,
    years: seeker.years_experience, skills: seekerSkillNames(seeker),
    experiences: Array.from({ length: exp.count ?? 0 }, () => ({ title: "x", organization: null })), portfolioCount: port.count ?? 0,
  });
  const appRows = (apps as unknown as AppRow[] | null) ?? [];

  return (
    <Shell wide>
      <PageHeader title={`Halo, ${profile.full_name} 👋`} subtitle="Ringkasan peluang kerja dan perkembangan profilmu." />
      <Flash msg={sp.msg} error={sp.error} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="user" label="Kelengkapan profil" value={`${completeness.percent}%`} hint={`${completeness.done} dari ${completeness.total} bagian terisi`} />
        <StatCard icon="briefcase" label="Lowongan terverifikasi" value={vacancies.length} />
        <StatCard icon="check" label="Lamaran saya" value={appRows.length} />
      </div>
      {completeness.percent < 100 && (
        <p className="mt-3 text-sm">Lengkapi profil di <Link className="font-semibold text-brand-dark underline" href="/profil">halaman Profil</Link> atau minta saran di <Link className="font-semibold text-brand-dark underline" href="/asisten">Asisten Karier</Link>.</p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="rek">
          <h2 id="rek" className="h2 mb-3">Rekomendasi lowongan untukmu</h2>
          {top.length === 0 ? (
            <div className="card muted">Belum ada lowongan terverifikasi.</div>
          ) : (
            <ul className="space-y-3">
              {top.map(({ item, match }) => (
                <li key={item.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/lowongan/${item.id}`} className="font-semibold text-slate-900 hover:underline">{item.title}</Link>
                      <p className="muted">{item.umkm_profiles?.business_name} · {item.city ?? "Lokasi fleksibel"} · {WORK_TYPE_LABEL[item.work_type]}</p>
                    </div>
                    <div className="w-40"><MatchBar score={match.score} /></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="space-y-6">
          <section className="card" aria-labelledby="gap">
            <h2 id="gap" className="h2">Skill yang perlu ditingkatkan</h2>
            {gaps.length === 0 ? <p className="muted mt-2">Tidak ada kekurangan pada rekomendasi teratas.</p> : (
              <ul className="mt-2 space-y-1 text-sm">
                {gaps.map((g) => <li key={g.skillId}>{nameById.get(g.skillId) ?? `Skill #${g.skillId}`} <span className="text-slate-500">({g.count} lowongan)</span></li>)}
              </ul>
            )}
            <Link href="/skill" className="btn-outline btn-sm mt-3">Lihat materi belajar</Link>
          </section>
          <NotificationList supabase={supabase} back="/dashboard/seeker" />
        </div>
      </div>
      <section className="mt-6" aria-labelledby="lamaran">
        <h2 id="lamaran" className="h2 mb-3">Lamaran saya</h2>
        {appRows.length === 0 ? <div className="card muted">Belum ada lamaran.</div> : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-3">Lowongan</th><th className="p-3">Usaha</th><th className="p-3">Kecocokan</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {appRows.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="p-3"><Link className="hover:underline" href={`/lowongan/${a.job_vacancies?.id}`}>{a.job_vacancies?.title}</Link></td>
                    <td className="p-3">{a.job_vacancies?.umkm_profiles?.business_name}</td>
                    <td className="p-3">{a.match_score ?? "-"}%</td>
                    <td className="p-3"><StatusBadge status={a.status} kind="application" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}
