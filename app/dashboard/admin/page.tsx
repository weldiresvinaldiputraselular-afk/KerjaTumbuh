import Link from "next/link";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Flash from "@/components/Flash";
import StatCard from "@/components/StatCard";
import NotificationList from "@/components/NotificationList";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function count(supabase: Awaited<ReturnType<typeof requireRole>>["supabase"], table: string, col?: string, val?: string) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (col && val) q = q.eq(col, val);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireRole(["admin"]);
  const [pendingVac, pendingUmkm, openReports, users] = await Promise.all([
    count(supabase, "job_vacancies", "status", "pending"),
    count(supabase, "umkm_profiles", "verification_status", "pending"),
    count(supabase, "reports", "status", "open"),
    count(supabase, "profiles"),
  ]);
  return (
    <Shell wide>
      <PageHeader title="Dashboard Administrator" subtitle="Antrean verifikasi dan ringkasan platform." />
      <Flash msg={sp.msg} error={sp.error} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon="briefcase" label="Lowongan menunggu verifikasi" value={pendingVac} />
        <StatCard icon="store" label="UMKM menunggu verifikasi" value={pendingUmkm} />
        <StatCard icon="shield" label="Laporan terbuka" value={openReports} />
        <StatCard icon="users" label="Total pengguna" value={users} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/verifikasi" className="btn">Buka antrean verifikasi</Link>
        <Link href="/admin/pengguna" className="btn-outline">Kelola pengguna</Link>
        <Link href="/dampak" className="btn-outline">Economic Impact Dashboard</Link>
      </div>
      <div className="mt-6 max-w-xl"><NotificationList supabase={supabase} back="/dashboard/admin" /></div>
    </Shell>
  );
}
