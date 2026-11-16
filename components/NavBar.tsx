import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import BottomNav from "@/components/BottomNav";
import { logout } from "@/app/actions/auth";
import { NAV } from "@/lib/nav";
import type { Profile } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/format";

export default function NavBar({ profile, unread = 0 }: { profile: Profile; unread?: number }) {
  const items = NAV[profile.role] ?? [];
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">Lewati ke konten</a>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <Logo href={`/dashboard/${profile.role}`} />
          <nav aria-label="Navigasi utama" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {items.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-soft hover:text-brand-dark">
                <Icon name={l.icon} className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href={`/dashboard/${profile.role}`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100" aria-label={unread > 0 ? `${unread} notifikasi belum dibaca` : "Notifikasi"}>
              <Icon name="bell" />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-slate-900">{unread}</span>}
            </Link>
            <div className="hidden text-right leading-tight lg:block">
              <p className="text-sm font-semibold text-slate-800">{profile.full_name}</p>
              <p className="text-xs text-slate-500">{ROLE_LABEL[profile.role]}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" aria-label="Keluar">
                <Icon name="logout" className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <BottomNav items={items.filter((i) => i.mobile)} />
    </>
  );
}
