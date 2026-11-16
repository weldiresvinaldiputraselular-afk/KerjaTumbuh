import Link from "next/link";
import Logo from "@/components/Logo";
import NavBar from "@/components/NavBar";
import { getSessionProfile } from "@/lib/auth";

export default async function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const { supabase, user, profile } = await getSessionProfile();
  let unread = 0;
  if (user && profile) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);
    unread = count ?? 0;
  }
  return (
    <>
      {profile ? (
        <NavBar profile={profile} unread={unread} />
      ) : (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
            <Logo />
            <nav aria-label="Navigasi utama" className="ml-4 hidden flex-1 gap-1 md:flex">
              <Link href="/lowongan" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-soft hover:text-brand-dark">Lowongan</Link>
              <a href="/#cara-kerja" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-soft hover:text-brand-dark">Cara kerja</a>
              <a href="/#fitur" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-soft hover:text-brand-dark">Fitur</a>
            </nav>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <Link href="/login" className="btn-outline btn-sm">Masuk</Link>
              <Link href="/register" className="btn btn-sm">Daftar</Link>
            </div>
          </div>
        </header>
      )}
      <main id="konten" className={`mx-auto px-4 py-6 ${profile ? "pb-28 md:pb-8" : "pb-10"} ${wide ? "max-w-6xl" : "max-w-5xl"}`}>
        {children}
      </main>
      <footer className={`border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-500 ${profile ? "pb-24 md:pb-6" : ""}`}>
        <p className="font-semibold text-slate-600">KerjaTumbuh · Kerja yang cocok, usaha lokal yang tumbuh</p>
        <p className="mt-1">SEVENT X Software Development 2026 · SDG 8 · Seluruh data contoh berlabel DEMO</p>
      </footer>
    </>
  );
}
