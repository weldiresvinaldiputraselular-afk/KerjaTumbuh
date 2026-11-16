import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import SubmitButton from "@/components/SubmitButton";
import { MatchBar, StatusBadge, VerifiedBadge } from "@/components/Badge";
import { getSessionProfile, loadSeeker, seekerSkillIds } from "@/lib/auth";
import { computeMatch } from "@/lib/matching";
import { applyToVacancy, reportVacancy } from "@/app/actions/jobs";
import { UMKM_STATUS_LABEL, WORK_TYPE_LABEL, fmtDate } from "@/lib/format";
import type { Vacancy } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VacancyDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, user, profile } = await getSessionProfile();
  const { data } = await supabase
    .from("job_vacancies")
    .select("*, umkm_profiles(id, business_name, city, description, verification_status), vacancy_skills(skill_id, skills(id, name))")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const v = data as Vacancy;

  const seeker = user && profile?.role === "seeker" ? await loadSeeker(supabase, user.id) : null;
  let match = null as ReturnType<typeof computeMatch> | null;
  let applied: { status: string } | null = null;
  const resources: Record<number, { title: string; url: string; provider: string | null }[]> = {};
  if (seeker) {
    match = computeMatch(
      { city: seeker.city, years_experience: seeker.years_experience, skill_ids: seekerSkillIds(seeker) },
      { city: v.city, work_type: v.work_type, min_experience: v.min_experience, skill_ids: (v.vacancy_skills ?? []).map((s) => s.skill_id) },
    );
    const { data: a } = await supabase.from("job_applications").select("status").eq("vacancy_id", v.id).eq("seeker_id", seeker.id).maybeSingle();
    applied = a as { status: string } | null;
    if (match.missingSkillIds.length > 0) {
      const { data: res } = await supabase.from("learning_resources").select("skill_id, title, url, provider").in("skill_id", match.missingSkillIds);
      for (const r of (res ?? []) as { skill_id: number; title: string; url: string; provider: string | null }[]) {
        (resources[r.skill_id] ??= []).push(r);
      }
    }
  }
  const skillName = (sid: number) => (v.vacancy_skills ?? []).find((s) => s.skill_id === sid)?.skills?.name ?? `Skill #${sid}`;

  return (
    <Shell>
      <Link href="/lowongan" className="text-sm text-brand-dark underline">← Kembali ke daftar</Link>
      <Flash msg={sp.msg} error={sp.error} />
      <article className="card mt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="h1">{v.title}</h1>
            <p className="muted">{v.umkm_profiles?.business_name} · {v.city ?? "Lokasi fleksibel"} · {WORK_TYPE_LABEL[v.work_type]}</p>
          </div>
          <div className="flex gap-2">
            {v.status === "verified" ? <VerifiedBadge /> : <StatusBadge status={v.status} kind="vacancy" />}
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
          <div><dt className="text-slate-500">Pengalaman minimal</dt><dd className="font-semibold">{v.min_experience} tahun</dd></div>
          <div><dt className="text-slate-500">Jumlah posisi</dt><dd className="font-semibold">{v.positions}</dd></div>
          <div><dt className="text-slate-500">Gaji</dt><dd className="font-semibold">{v.salary_note ?? "Tidak dicantumkan"}</dd></div>
          <div><dt className="text-slate-500">Diposting</dt><dd className="font-semibold">{fmtDate(v.created_at)}</dd></div>
        </dl>
        <h2 className="h2 mt-5">Deskripsi</h2>
        <p className="mt-1 whitespace-pre-line text-slate-700">{v.description}</p>
        <h2 className="h2 mt-5">Keterampilan yang dibutuhkan</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(v.vacancy_skills ?? []).length === 0 ? <span className="muted">Tidak ada keterampilan khusus.</span> :
            (v.vacancy_skills ?? []).map((s) => <span key={s.skill_id} className="badge bg-slate-100 text-slate-700">{s.skills?.name}</span>)}
        </div>
        <h2 className="h2 mt-5">Tentang usaha</h2>
        <p className="text-sm text-slate-700">
          <strong>{v.umkm_profiles?.business_name}</strong> - status: {UMKM_STATUS_LABEL[v.umkm_profiles?.verification_status ?? "unverified"]}
        </p>
        {v.umkm_profiles?.description && <p className="mt-1 text-sm text-slate-700">{v.umkm_profiles.description}</p>}
      </article>

      {match && (
        <section className="card mt-4" aria-labelledby="cocok">
          <h2 id="cocok" className="h2">Kecocokan dengan profilmu</h2>
          <div className="mt-2 max-w-sm"><MatchBar score={match.score} /></div>
          <ul className="mt-3 text-sm text-slate-700">
            <li>Keterampilan: {match.matchedSkillIds.length} dari {match.matchedSkillIds.length + match.missingSkillIds.length} terpenuhi (bobot 70%)</li>
            <li>Lokasi: {match.locationScore === 1 ? "sesuai" : "berbeda"} (bobot 15%)</li>
            <li>Pengalaman: {Math.round(match.experienceScore * 100)}% terpenuhi (bobot 15%)</li>
          </ul>
          {match.missingSkillIds.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold">Skill yang perlu ditingkatkan</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {match.missingSkillIds.map((sid) => (
                  <li key={sid}>
                    {skillName(sid)}
                    {(resources[sid] ?? []).slice(0, 1).map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-dark underline">{r.title}{r.provider ? ` (${r.provider})` : ""}</a>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {seeker && v.status === "verified" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="card" aria-labelledby="lamar">
            <h2 id="lamar" className="h2">Lamar pekerjaan ini</h2>
            {applied ? (
              <p className="mt-2 text-sm">Anda sudah melamar. Status: <StatusBadge status={applied.status} kind="application" /></p>
            ) : (
              <form action={applyToVacancy} className="mt-2 space-y-3">
                <input type="hidden" name="vacancy_id" value={v.id} />
                <div>
                  <label htmlFor="cover_note" className="label">Catatan untuk pemberi kerja (opsional)</label>
                  <textarea id="cover_note" name="cover_note" rows={4} maxLength={1000} className="input" />
                </div>
                <SubmitButton>Kirim lamaran</SubmitButton>
              </form>
            )}
          </section>
          <section className="card" aria-labelledby="lapor">
            <h2 id="lapor" className="h2">Laporkan lowongan</h2>
            <p className="muted">Ada yang mencurigakan? Beri tahu administrator.</p>
            <form action={reportVacancy} className="mt-2 space-y-3">
              <input type="hidden" name="vacancy_id" value={v.id} />
              <div>
                <label htmlFor="reason" className="label">Alasan (minimal 10 karakter)</label>
                <textarea id="reason" name="reason" rows={3} minLength={10} maxLength={500} required className="input" />
              </div>
              <SubmitButton className="btn-outline">Kirim laporan</SubmitButton>
            </form>
          </section>
        </div>
      )}
      {!user && v.status === "verified" && (
        <p className="mt-4 text-sm">Untuk melamar, <Link href="/login" className="font-semibold text-brand-dark underline">masuk</Link> atau <Link href="/register" className="font-semibold text-brand-dark underline">daftar</Link> sebagai pencari kerja.</p>
      )}
    </Shell>
  );
}
