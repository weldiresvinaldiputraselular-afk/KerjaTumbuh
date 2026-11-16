import Shell from "@/components/Shell";
import StatCard from "@/components/StatCard";
import ImpactChart from "@/components/ImpactChart";
import { requireRole } from "@/lib/auth";
import { loadImpactStats } from "@/lib/queries";
import { monthLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const { supabase } = await requireRole(["seeker", "umkm", "admin"]);
  const stats = await loadImpactStats(supabase);
  const chart = (stats?.monthly ?? []).map((m) => ({ label: monthLabel(m.month), Lamaran: Number(m.applications), Lowongan: Number(m.vacancies) }));
  return (
    <Shell wide>
      <h1 className="h1">Economic Impact Dashboard</h1>
      <p className="muted mb-4">Ringkasan aktivitas ekonomi platform, dihitung langsung dari basis data. Data contoh berlabel DEMO.</p>
      {!stats ? (
        <div className="card muted">Statistik belum dapat dimuat. Pastikan skema database (fungsi impact_stats) sudah dijalankan.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon="briefcase" label="Total lowongan" value={stats.vacancies} hint="Verified dan terisi" />
            <StatCard icon="user" label="Pencari kerja" value={stats.seekers} />
            <StatCard icon="store" label="UMKM" value={stats.umkm} />
            <StatCard icon="check" label="Total lamaran" value={stats.applications} />
            <StatCard icon="target" label="Lowongan terisi" value={stats.filled} />
          </div>
          <section className="card mt-6" aria-labelledby="grafik">
            <h2 id="grafik" className="h2 mb-3">Perkembangan 6 bulan terakhir</h2>
            <ImpactChart data={chart} />
          </section>
        </>
      )}
    </Shell>
  );
}
