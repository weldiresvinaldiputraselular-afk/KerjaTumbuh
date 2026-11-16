import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import { requireRole } from "@/lib/auth";
import { toggleUserActive } from "@/app/actions/admin";
import { ROLE_LABEL, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Row { id: string; full_name: string; email: string | null; role: string; is_active: boolean; is_demo: boolean; created_at: string }

export default async function UserManagement({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string; peran?: string }> }) {
  const sp = await searchParams;
  const { supabase, user } = await requireRole(["admin"]);
  let q = supabase.from("profiles").select("id, full_name, email, role, is_active, is_demo, created_at").order("created_at", { ascending: false }).limit(200);
  if (sp.peran && ["seeker", "umkm", "admin"].includes(sp.peran)) q = q.eq("role", sp.peran);
  const { data } = await q;
  const rows = (data as Row[] | null) ?? [];
  return (
    <Shell wide>
      <h1 className="h1">Manajemen Pengguna</h1>
      <Flash msg={sp.msg} error={sp.error} />
      <form method="get" className="card mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="peran" className="label">Filter peran</label>
          <select id="peran" name="peran" defaultValue={sp.peran ?? ""} className="input">
            <option value="">Semua</option>
            {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">Terapkan</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Peran</th><th className="p-3">Bergabung</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3">{r.full_name}{r.is_demo && <span className="badge ml-2 bg-amber-100 text-amber-800">DEMO</span>}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{ROLE_LABEL[r.role]}</td>
                <td className="p-3">{fmtDate(r.created_at)}</td>
                <td className="p-3">{r.is_active ? <span className="badge bg-green-100 text-green-800">Aktif</span> : <span className="badge bg-red-100 text-red-800">Nonaktif</span>}</td>
                <td className="p-3">
                  {r.id !== user.id && (
                    <form action={toggleUserActive}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="active" value={String(!r.is_active)} />
                      <button className={r.is_active ? "btn-danger btn-sm" : "btn btn-sm"} type="submit">{r.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
