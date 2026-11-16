// AI Career Assistant - mode lokal berbasis aturan dan templat (tanpa API).

export interface AssistantProfile {
  name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  education: string | null;
  years: number;
  skills: string[];
  experiences: { title: string; organization: string | null }[];
  portfolioCount: number;
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " dan " + items[items.length - 1];
}

export function generateCvSummary(p: AssistantProfile, targetRole?: string): string {
  const parts: string[] = [];
  const edu = p.education ? `lulusan ${p.education}` : "pencari kerja";
  const exp = p.years > 0 ? `dengan pengalaman ${p.years} tahun` : "yang siap belajar dan berkembang";
  const target = targetRole ? ` dan tertarik pada posisi ${targetRole}` : "";
  parts.push(`${p.name} adalah ${edu} ${exp}${target}${p.city ? `, berdomisili di ${p.city}` : ""}.`);
  if (p.skills.length > 0) {
    parts.push(`Memiliki keterampilan ${joinList(p.skills.slice(0, 5))}.`);
  }
  if (p.experiences.length > 0) {
    const e = p.experiences[0];
    parts.push(`Pernah berperan sebagai ${e.title}${e.organization ? ` di ${e.organization}` : ""}.`);
  }
  parts.push(
    "Bekerja dengan teliti, mau belajar hal baru, dan siap berkontribusi pada pertumbuhan usaha tempatnya bekerja.",
  );
  return parts.join(" ");
}

export interface CareerSuggestion {
  title: string;
  score: number;
}

export function careerRecommendations(p: AssistantProfile, top: CareerSuggestion[], gapNames: string[]): string[] {
  const out: string[] = [];
  if (top.length > 0) {
    out.push(
      `Lowongan yang paling cocok saat ini: ${joinList(top.slice(0, 3).map((t) => `${t.title} (${t.score}%)`))}.`,
    );
  } else {
    out.push("Belum ada lowongan terverifikasi yang bisa dicocokkan. Lengkapi keterampilan agar rekomendasi muncul.");
  }
  if (gapNames.length > 0) {
    out.push(`Keterampilan yang paling sering dibutuhkan namun belum Anda miliki: ${joinList(gapNames.slice(0, 3))}.`);
  }
  if (p.years === 0) {
    out.push("Pertimbangkan posisi magang atau paruh waktu untuk membangun pengalaman awal.");
  } else {
    out.push("Manfaatkan pengalaman Anda untuk melamar posisi yang menuntut tanggung jawab lebih besar.");
  }
  return out;
}

export interface ProfileTip {
  priority: "tinggi" | "sedang";
  text: string;
}

export function profileTips(p: AssistantProfile): ProfileTip[] {
  const tips: ProfileTip[] = [];
  if (!p.headline) tips.push({ priority: "tinggi", text: "Tambahkan headline singkat, misalnya posisi yang Anda incar." });
  if (!p.bio || p.bio.length < 80) tips.push({ priority: "tinggi", text: "Perpanjang ringkasan diri menjadi minimal 2-3 kalimat." });
  if (p.skills.length < 3) tips.push({ priority: "tinggi", text: "Tambahkan minimal 3 keterampilan agar pencocokan lebih akurat." });
  if (p.experiences.length === 0) tips.push({ priority: "sedang", text: "Tambahkan pengalaman, termasuk organisasi atau kerja paruh waktu." });
  if (p.portfolioCount === 0) tips.push({ priority: "sedang", text: "Tambahkan minimal satu portofolio atau contoh karya." });
  if (!p.city) tips.push({ priority: "sedang", text: "Isi kota domisili agar lowongan terdekat diprioritaskan." });
  if (tips.length === 0) tips.push({ priority: "sedang", text: "Profil Anda sudah lengkap. Perbarui secara berkala." });
  return tips;
}

export function profileCompleteness(p: AssistantProfile): { percent: number; done: number; total: number } {
  const checks = [
    !!p.headline,
    !!p.bio && p.bio.length >= 80,
    !!p.city,
    !!p.education,
    p.skills.length >= 3,
    p.experiences.length > 0,
    p.portfolioCount > 0,
  ];
  const done = checks.filter(Boolean).length;
  return { percent: Math.round((done / checks.length) * 100), done, total: checks.length };
}
