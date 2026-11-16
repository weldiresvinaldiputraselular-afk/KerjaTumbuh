export const WORK_TYPE_LABEL: Record<string, string> = {
  full_time: "Penuh waktu",
  part_time: "Paruh waktu",
  magang: "Magang",
  freelance: "Freelance",
  remote: "Jarak jauh",
};

export const VACANCY_STATUS_LABEL: Record<string, string> = {
  draft: "Draf",
  pending: "Menunggu verifikasi",
  verified: "Verified",
  rejected: "Ditolak",
  filled: "Terisi",
};

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  submitted: "Terkirim",
  reviewed: "Ditinjau",
  interview: "Wawancara",
  accepted: "Diterima",
  rejected: "Ditolak",
};

export const UMKM_STATUS_LABEL: Record<string, string> = {
  unverified: "Belum diverifikasi",
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

export const ROLE_LABEL: Record<string, string> = {
  seeker: "Pencari kerja",
  umkm: "UMKM",
  admin: "Administrator",
};

export const EDUCATION_LEVELS = ["SMA/SMK", "D3", "S1", "S2", "Lainnya"];

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "short" });
}
