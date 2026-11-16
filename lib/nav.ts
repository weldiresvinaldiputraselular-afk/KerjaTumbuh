import type { Role } from "@/lib/types";
import type { IconName } from "@/components/Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  mobile?: boolean; // tampil di bar navigasi bawah (ponsel)
}

export const NAV: Record<Role, NavItem[]> = {
  seeker: [
    { href: "/dashboard/seeker", label: "Beranda", icon: "home", mobile: true },
    { href: "/lowongan", label: "Lowongan", icon: "briefcase", mobile: true },
    { href: "/asisten", label: "Asisten", icon: "sparkles", mobile: true },
    { href: "/skill", label: "Skill", icon: "book", mobile: true },
    { href: "/profil", label: "Profil", icon: "user", mobile: true },
    { href: "/dampak", label: "Dampak", icon: "chart" },
  ],
  umkm: [
    { href: "/dashboard/umkm", label: "Beranda", icon: "home", mobile: true },
    { href: "/umkm/lowongan", label: "Lowongan", icon: "briefcase", mobile: true },
    { href: "/umkm/profil", label: "Usaha", icon: "store", mobile: true },
    { href: "/dampak", label: "Dampak", icon: "chart", mobile: true },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Beranda", icon: "home", mobile: true },
    { href: "/admin/verifikasi", label: "Verifikasi", icon: "shield", mobile: true },
    { href: "/admin/pengguna", label: "Pengguna", icon: "users", mobile: true },
    { href: "/dampak", label: "Dampak", icon: "chart", mobile: true },
  ],
};
