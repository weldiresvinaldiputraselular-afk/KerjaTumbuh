import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { markNotificationsRead } from "@/app/actions/seeker";
import { fmtDate } from "@/lib/format";

interface Row { id: string; message: string; link: string | null; is_read: boolean; created_at: string }

export default async function NotificationList({ supabase, back }: { supabase: SupabaseClient; back: string }) {
  const { data } = await supabase
    .from("notifications")
    .select("id, message, link, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const rows = (data as Row[] | null) ?? [];
  return (
    <section className="card" aria-labelledby="notif-title">
      <div className="flex items-center justify-between">
        <h2 id="notif-title" className="h2">Notifikasi</h2>
        {rows.some((r) => !r.is_read) && (
          <form action={markNotificationsRead}>
            <input type="hidden" name="back" value={back} />
            <button className="btn-outline btn-sm" type="submit">Tandai dibaca</button>
          </form>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="muted mt-2">Belum ada notifikasi.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.id} className={`rounded-lg px-3 py-2 text-sm ${r.is_read ? "bg-slate-50 text-slate-600" : "bg-amber-50 text-slate-900"}`}>
              {r.link ? <Link href={r.link} className="hover:underline">{r.message}</Link> : r.message}
              <span className="ml-2 text-xs text-slate-500">{fmtDate(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
