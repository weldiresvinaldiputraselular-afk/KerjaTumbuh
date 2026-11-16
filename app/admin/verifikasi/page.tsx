import Link from "next/link";
import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import { requireRole } from "@/lib/auth";
import { decideUmkm, decideVacancy, resolveReport } from "@/app/actions/admin";
import { WORK_TYPE_LABEL, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface VacRow { id: string; title: string; description: string; city: string | null; work_type: string; created_at: string; umkm_profiles: { business_name: string; verification_status: string } | null }
interface UmkmRow { id: string; business_name: string; sector: string | null; city: string | null; description: string | null }
interface ReportRow { id: string; reason: string; created_at: string; vacancy_id: string; job_vacancies: { title: string; umkm_profiles: { business_name: string } | null } | null }

function DecisionForm({ id, action }: { id: string; action: (f: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="min-w-[200px] flex-1">
        <label htmlFor={`note-${id}`} className="label">Catatan (wajib bila menolak)</label>
        <input id={`note-${id}`} name="note" maxLength={300} className="input" />
      </div>
      <button name="decision" value="approved" className="btn btn-sm" type="submit">Setujui</button>
      <button name="decision" value="rejected" className="btn-danger btn-sm" type="submit">Tolak</button>
    </form>
  );
}

export default async function VerificationQueue({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin"]);
  const [v, u, r] = await Promise.all([
    supabase.from("job_vacancies").select("id, title, description, city, work_type, created_at, umkm_profiles(business_name, verification_status)").eq("status", "pending").order("created_at"),
    supabase.from("umkm_profiles").select("id, business_name, sector, city, description").eq("verification_status", "pending"),
    supabase.from("reports").select("id, reason, created_at, vacancy_id, job_vacancies(title, umkm_profiles(business_name))").eq("status", "open").order("created_at"),
  ]);
  const vacs = (v.data as unknown as VacRow[] | null) ?? [];
  const umkms = (u.data as UmkmRow[] | null) ?? [];
  const reports = (r.data as unknown as ReportRow[] | null) ?? [];
  return (
    <Shell wide>
      <h1 className="h1">Verifikasi dan Laporan</h1>
      <p className="muted mb-4">Periksa kelengkapan, kewajaran isi, dan tanda mencurigakan sebelum menyetujui.</p>
      <Flash msg={sp.msg} error={sp.error} />

      <section aria-labelledby="v1" className="mb-8">
        <h2 id="v1" className="h2 mb-3">Lowongan menunggu ({vacs.length})</h2>
        {vacs.length === 0 ? <div className="card muted">Tidak ada lowongan yang menunggu.</div> : (
          <ul className="space-y-3">
            {vacs.map((x) => (
              <li key={x.id} className="card">
                <p className="text-lg font-semibold">{x.title}</p>
                <p className="muted">{x.umkm_profiles?.business_name} (usaha: {x.umkm_profiles?.verification_status}) · {x.city ?? "-"} · {WORK_TYPE_LABEL[x.work_type]} · {fmtDate(x.created_at)}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{x.description}</p>
                <DecisionForm id={x.id} action={decideVacancy} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="v2" className="mb-8">
        <h2 id="v2" className="h2 mb-3">UMKM menunggu ({umkms.length})</h2>
        {umkms.length === 0 ? <div className="card muted">Tidak ada pengajuan verifikasi usaha.</div> : (
          <ul className="space-y-3">
            {umkms.map((x) => (
              <li key={x.id} className="card">
                <p className="text-lg font-semibold">{x.business_name}</p>
                <p className="muted">{x.sector ?? "Sektor belum diisi"} · {x.city ?? "Kota belum diisi"}</p>
                <p className="mt-2 text-sm text-slate-700">{x.description ?? "Deskripsi belum diisi."}</p>
                <DecisionForm id={x.id} action={decideUmkm} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="v3">
        <h2 id="v3" className="h2 mb-3">Laporan terbuka ({reports.length})</h2>
        {reports.length === 0 ? <div className="card muted">Tidak ada laporan terbuka.</div> : (
          <ul className="space-y-3">
            {reports.map((x) => (
              <li key={x.id} className="card">
                <p className="font-semibold">{x.job_vacancies?.title} <span className="font-normal text-slate-600">· {x.job_vacancies?.umkm_profiles?.business_name}</span></p>
                <p className="mt-1 text-sm text-slate-700">Alasan: {x.reason}</p>
                <p className="text-xs text-slate-500">Dilaporkan {fmtDate(x.created_at)} · <Link className="underline" href={`/lowongan/${x.vacancy_id}`}>lihat lowongan</Link></p>
                <form action={resolveReport} className="mt-3 flex gap-2">
                  <input type="hidden" name="id" value={x.id} />
                  <input type="hidden" name="vacancy_id" value={x.vacancy_id} />
                  <button name="status" value="resolved" className="btn-danger btn-sm" type="submit">Nonaktifkan lowongan</button>
                  <button name="status" value="dismissed" className="btn-outline btn-sm" type="submit">Abaikan laporan</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
