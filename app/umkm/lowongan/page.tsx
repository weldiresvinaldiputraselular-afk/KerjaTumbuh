import Link from "next/link";
import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import { StatusBadge } from "@/components/Badge";
import { requireUmkm } from "@/lib/auth";
import { deleteVacancy, setVacancyStatus } from "@/app/actions/umkm";
import { WORK_TYPE_LABEL, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Row { id: string; title: string; city: string | null; work_type: string; status: string; review_note: string | null; created_at: string; positions: number }

export default async function MyVacancies({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, umkm } = await requireUmkm();
  const { data } = await supabase
    .from("job_vacancies")
    .select("id, title, city, work_type, status, review_note, created_at, positions")
    .eq("umkm_id", umkm.id)
    .order("created_at", { ascending: false });
  const rows = (data as Row[] | null) ?? [];
  return (
    <Shell wide>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Lowongan Saya</h1>
        <Link href="/umkm/lowongan/baru" className="btn">+ Buat lowongan</Link>
      </div>
      <div className="mt-4"><Flash msg={sp.msg} error={sp.error} /></div>
      {rows.length === 0 ? <div className="card muted">Belum ada lowongan.</div> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{r.title}</p>
                  <p className="muted">{r.city ?? "Lokasi fleksibel"} · {WORK_TYPE_LABEL[r.work_type]} · {r.positions} posisi · {fmtDate(r.created_at)}</p>
                  {r.review_note && r.status === "rejected" && <p className="mt-1 text-sm text-red-700">Catatan admin: {r.review_note}</p>}
                </div>
                <StatusBadge status={r.status} kind="vacancy" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/umkm/lowongan/${r.id}/pelamar`} className="btn btn-sm">Pelamar</Link>
                <Link href={`/umkm/lowongan/${r.id}/edit`} className="btn-outline btn-sm">Ubah</Link>
                {["draft", "rejected"].includes(r.status) && (
                  <form action={setVacancyStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="pending" /><button className="btn-outline btn-sm" type="submit">Kirim verifikasi</button></form>
                )}
                {r.status === "verified" && (
                  <form action={setVacancyStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="filled" /><button className="btn-outline btn-sm" type="submit">Tandai terisi</button></form>
                )}
                <form action={deleteVacancy}><input type="hidden" name="id" value={r.id} /><button className="btn-danger btn-sm" type="submit">Hapus</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
