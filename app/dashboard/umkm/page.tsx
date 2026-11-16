import Link from "next/link";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Flash from "@/components/Flash";
import StatCard from "@/components/StatCard";
import NotificationList from "@/components/NotificationList";
import { StatusBadge } from "@/components/Badge";
import { requireUmkm } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AppRow {
  id: string; status: string; match_score: number | null; created_at: string;
  job_vacancies: { id: string; title: string } | null;
  job_seekers: { profiles: { full_name: string } | null } | null;
}

export default async function UmkmDashboard({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, umkm } = await requireUmkm();
  const { data: vacs } = await supabase.from("job_vacancies").select("id, status").eq("umkm_id", umkm.id);
  const vacIds = (vacs ?? []).map((v: { id: string }) => v.id);
  const active = (vacs ?? []).filter((v: { status: string }) => v.status === "verified").length;
  const filled = (vacs ?? []).filter((v: { status: string }) => v.status === "filled").length;

  let apps: AppRow[] = [];
  if (vacIds.length > 0) {
    const { data } = await supabase
      .from("job_applications")
      .select("id, status, match_score, created_at, job_vacancies(id, title), job_seekers(profiles(full_name))")
      .in("vacancy_id", vacIds)
      .order("created_at", { ascending: false })
      .limit(50);
    apps = (data as unknown as AppRow[] | null) ?? [];
  }
  const interviews = apps.filter((a) => a.status === "interview").length;

  return (
    <Shell wide>
      <PageHeader title={umkm.business_name} subtitle="Kelola lowongan dan pelamar usahamu.">
        <StatusBadge status={umkm.verification_status} kind="umkm" />
      </PageHeader>
      <Flash msg={sp.msg} error={sp.error} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon="briefcase" label="Lowongan aktif" value={active} />
        <StatCard icon="check" label="Lowongan terisi" value={filled} />
        <StatCard icon="users" label="Total pelamar" value={apps.length} />
        <StatCard icon="sparkles" label="Tahap wawancara" value={interviews} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/umkm/lowongan/baru" className="btn">+ Buat lowongan</Link>
        <Link href="/umkm/lowongan" className="btn-outline">Kelola lowongan</Link>
        {umkm.verification_status !== "verified" && <Link href="/umkm/profil" className="btn-outline">Ajukan verifikasi usaha</Link>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="pel">
          <h2 id="pel" className="h2 mb-3">Pelamar terbaru</h2>
          {apps.length === 0 ? <div className="card muted">Belum ada pelamar.</div> : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-3">Nama</th><th className="p-3">Lowongan</th><th className="p-3">Kecocokan</th><th className="p-3">Status</th><th className="p-3">Tanggal</th></tr></thead>
                <tbody>
                  {apps.slice(0, 10).map((a) => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="p-3">{a.job_seekers?.profiles?.full_name ?? "-"}</td>
                      <td className="p-3"><Link className="hover:underline" href={`/umkm/lowongan/${a.job_vacancies?.id}/pelamar`}>{a.job_vacancies?.title}</Link></td>
                      <td className="p-3">{a.match_score ?? "-"}%</td>
                      <td className="p-3"><StatusBadge status={a.status} kind="application" /></td>
                      <td className="p-3">{fmtDate(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <NotificationList supabase={supabase} back="/dashboard/umkm" />
      </div>
    </Shell>
  );
}
