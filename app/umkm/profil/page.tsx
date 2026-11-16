import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import SubmitButton from "@/components/SubmitButton";
import { StatusBadge } from "@/components/Badge";
import { requireUmkm } from "@/lib/auth";
import { requestUmkmVerification, saveUmkmProfile } from "@/app/actions/umkm";

export const dynamic = "force-dynamic";

export default async function UmkmProfilePage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { umkm } = await requireUmkm();
  return (
    <Shell>
      <h1 className="h1">Profil UMKM</h1>
      <p className="muted mb-4">Status verifikasi: <StatusBadge status={umkm.verification_status} kind="umkm" /></p>
      <Flash msg={sp.msg} error={sp.error} />
      <form action={saveUmkmProfile} className="card space-y-4">
        <div><label htmlFor="business_name" className="label">Nama usaha</label><input id="business_name" name="business_name" required defaultValue={umkm.business_name} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="sector" className="label">Sektor usaha</label><input id="sector" name="sector" defaultValue={umkm.sector ?? ""} className="input" placeholder="Contoh: Kuliner, kerajinan, jasa" /></div>
          <div><label htmlFor="city" className="label">Kota</label><input id="city" name="city" defaultValue={umkm.city ?? ""} className="input" /></div>
        </div>
        <div><label htmlFor="description" className="label">Deskripsi usaha</label><textarea id="description" name="description" rows={5} maxLength={1000} defaultValue={umkm.description ?? ""} className="input" /></div>
        <SubmitButton>Simpan profil usaha</SubmitButton>
      </form>
      {umkm.verification_status !== "verified" && (
        <form action={requestUmkmVerification} className="card mt-4">
          <h2 className="h2">Verifikasi usaha</h2>
          <p className="muted mt-1">Lengkapi profil terlebih dahulu, lalu ajukan verifikasi ke administrator.</p>
          <div className="mt-3"><SubmitButton className="btn-outline" pendingText="Mengirim...">Ajukan verifikasi</SubmitButton></div>
        </form>
      )}
    </Shell>
  );
}
