import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import { MatchBar, StatusBadge } from "@/components/Badge";
import { requireUmkm } from "@/lib/auth";
import { updateApplicationStatus } from "@/app/actions/umkm";
import { APPLICATION_STATUS_LABEL, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AppRow {
  id: string; status: string; match_score: number | null; cover_note: string | null; created_at: string;
  job_seekers: {
    headline: string | null; city: string | null; years_experience: number; education_level: string | null;
    profiles: { full_name: string } | null;
    seeker_skills: { skills: { name: string } | null }[];
  } | null;
}

export default async function Applicants({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, umkm } = await requireUmkm();
  const { data: vac } = await supabase.from("job_vacancies").select("id, title, positions, status").eq("id", id).eq("umkm_id", umkm.id).single();
  if (!vac) notFound();
  const { data } = await supabase
    .from("job_applications")
    .select("id, status, match_score, cover_note, created_at, job_seekers(headline, city, years_experience, education_level, profiles(full_name), seeker_skills(skills(name)))")
    .eq("vacancy_id", id)
    .order("match_score", { ascending: false });
  const rows = (data as unknown as AppRow[] | null) ?? [];
  return (
    <Shell wide>
      <Link href="/umkm/lowongan" className="text-sm text-brand-dark underline">← Lowongan saya</Link>
      <h1 className="h1 mt-2">Pelamar: {vac.title}</h1>
      <p className="muted mb-4">{rows.length} pelamar · {vac.positions} posisi · status lowongan: <StatusBadge status={vac.status} kind="vacancy" /></p>
      <Flash msg={sp.msg} error={sp.error} />
      {rows.length === 0 ? <div className="card muted">Belum ada pelamar.</div> : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{a.job_seekers?.profiles?.full_name ?? "Pelamar"}</p>
                  <p className="muted">{a.job_seekers?.headline ?? "-"} · {a.job_seekers?.city ?? "-"} · {a.job_seekers?.education_level ?? "-"} · {a.job_seekers?.years_experience ?? 0} tahun · melamar {fmtDate(a.created_at)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(a.job_seekers?.seeker_skills ?? []).map((s, i) => <span key={i} className="badge bg-slate-100 text-slate-700">{s.skills?.name}</span>)}
                  </div>
                  {a.cover_note && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">{a.cover_note}</p>}
                </div>
                <div className="w-44 space-y-2">
                  <MatchBar score={a.match_score ?? 0} />
                  <StatusBadge status={a.status} kind="application" />
                </div>
              </div>
              <form action={updateApplicationStatus} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="vacancy_id" value={id} />
                <div>
                  <label htmlFor={`st-${a.id}`} className="label">Ubah status</label>
                  <select id={`st-${a.id}`} name="status" defaultValue={a.status} className="input">
                    {Object.entries(APPLICATION_STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <button className="btn btn-sm" type="submit">Simpan</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
