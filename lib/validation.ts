import { z } from "zod";

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} minimal ${min} karakter`).max(max, `${label} maksimal ${max} karakter`);
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter`).optional().transform((v) => (v ? v : null));
const intField = (min: number, max: number, label: string) =>
  z.coerce.number({ invalid_type_error: `${label} harus berupa angka` }).int(`${label} harus bilangan bulat`).min(min, `${label} minimal ${min}`).max(max, `${label} maksimal ${max}`);

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const registerSchema = z
  .object({
    full_name: text(2, 80, "Nama lengkap"),
    email: z.string().trim().email("Email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(72, "Kata sandi maksimal 72 karakter"),
    role: z.enum(["seeker", "umkm"], { errorMap: () => ({ message: "Peran tidak valid" }) }),
    business_name: optionalText(100, "Nama usaha"),
  })
  .refine((v) => v.role !== "umkm" || (v.business_name && v.business_name.length >= 2), {
    message: "Nama usaha wajib diisi untuk peran UMKM",
    path: ["business_name"],
  });

export const seekerProfileSchema = z.object({
  full_name: text(2, 80, "Nama lengkap"),
  headline: optionalText(120, "Headline"),
  bio: optionalText(1000, "Ringkasan diri"),
  city: optionalText(80, "Kota"),
  education_level: optionalText(40, "Pendidikan"),
  years_experience: intField(0, 60, "Pengalaman"),
});

export const experienceSchema = z.object({
  title: text(2, 100, "Jabatan"),
  organization: optionalText(100, "Organisasi"),
  description: optionalText(500, "Deskripsi"),
});

export const portfolioSchema = z.object({
  title: text(2, 100, "Judul portofolio"),
  description: optionalText(500, "Deskripsi"),
  url: z
    .string()
    .trim()
    .max(300, "Tautan terlalu panjang")
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\//i.test(v), { message: "Tautan harus diawali http:// atau https://" }),
});

export const umkmProfileSchema = z.object({
  business_name: text(2, 100, "Nama usaha"),
  sector: optionalText(80, "Sektor"),
  city: optionalText(80, "Kota"),
  description: optionalText(1000, "Deskripsi usaha"),
});

export const vacancySchema = z.object({
  title: text(3, 120, "Judul lowongan"),
  description: text(20, 3000, "Deskripsi"),
  city: optionalText(80, "Kota"),
  work_type: z.enum(["full_time", "part_time", "magang", "freelance", "remote"], {
    errorMap: () => ({ message: "Jenis pekerjaan tidak valid" }),
  }),
  min_experience: intField(0, 40, "Pengalaman minimal"),
  positions: intField(1, 1000, "Jumlah posisi"),
  salary_note: optionalText(120, "Catatan gaji"),
});

export const applicationSchema = z.object({
  vacancy_id: z.string().uuid("ID lowongan tidak valid"),
  cover_note: optionalText(1000, "Catatan lamaran"),
});

export const reportSchema = z.object({
  vacancy_id: z.string().uuid("ID lowongan tidak valid"),
  reason: text(10, 500, "Alasan laporan"),
});

export const decisionSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  decision: z.enum(["approved", "rejected"]),
  note: optionalText(300, "Catatan"),
});

export const applicationStatusSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  vacancy_id: z.string().uuid("ID lowongan tidak valid"),
  status: z.enum(["submitted", "reviewed", "interview", "accepted", "rejected"]),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid";
}

export function parseIdList(values: FormDataEntryValue[]): number[] {
  return Array.from(
    new Set(values.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0 && n < 100000)),
  );
}
