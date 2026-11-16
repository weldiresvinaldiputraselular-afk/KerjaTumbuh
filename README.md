# KerjaTumbuh

**Platform Pemberdayaan Kerja dan UMKM Lokal** — karya tim NEXORA untuk SEVENT X Software Development 2026 (kategori Website, subtema SDG 8: Decent Work and Economic Growth).

KerjaTumbuh mempertemukan pencari kerja, pemuda yang mengembangkan keterampilan, dan UMKM dalam satu aplikasi web dengan lowongan yang diverifikasi administrator.

## Fitur

| Fitur | Keterangan |
|---|---|
| Smart Job Matching | Skor 0–100% = 70% keterampilan + 15% lokasi + 15% pengalaman (`lib/matching.ts`) |
| UMKM Connect | Profil usaha, kelola lowongan, kelola pelamar (ubah status) |
| Skill Development | Keterampilan yang paling dibutuhkan tetapi belum dimiliki + materi belajar |
| Career Portfolio | Profil, pendidikan, pengalaman, keterampilan, portofolio |
| Verified Job | Lowongan tayang setelah disetujui admin, pelaporan lowongan, status verifikasi usaha |
| AI Career Assistant | Mode lokal berbasis aturan (tanpa API). Mode API eksternal bersifat opsional |
| Economic Impact Dashboard | Total lowongan, pencari kerja, UMKM, lamaran, lowongan terisi, grafik 6 bulan |

Peran: **pencari kerja**, **UMKM**, **admin**. Hak akses dibatasi dengan Row Level Security (RLS) di basis data.

## Tampilan

Desain responsif dengan pendekatan ponsel lebih dulu: di layar kecil (Android/iOS) navigasi berupa bar bawah ala aplikasi, di desktop berupa menu atas. Situs juga dapat dipasang ke layar utama Android (Chrome → menu → Tambahkan ke layar utama) berkat `app/manifest.ts`. Font Plus Jakarta Sans dimuat lewat `next/font` (butuh internet saat build; Vercel tidak masalah).

## Teknologi

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + PostgreSQL + RLS) · Recharts · Zod · Vercel · GitHub

## Struktur folder

```
KERJATUMBUH/
├── app/            halaman (App Router) dan server actions (app/actions)
├── components/     komponen UI
├── lib/            logika inti: matching, asisten, validasi, klien Supabase
├── database/       schema.sql (tabel, RLS, trigger) dan seed_skills.sql
├── scripts/        seed-demo.mjs (data demo)
├── tests/          tes otomatis logika matching dan asisten
├── public/logo/    logo KerjaTumbuh (SVG/PNG)
├── assets/         salinan aset logo
├── docs/           catatan desain dan daftar uji manual
├── .env.example    contoh variabel lingkungan
└── package.json
```

## Menjalankan di komputer sendiri (Visual Studio Code)

Prasyarat: **Node.js 20 atau lebih baru**, akun **Supabase** (gratis), dan VS Code.

1. **Ekstrak** `KERJATUMBUH_SEVENT_X_2026.zip`, lalu **buka foldernya** di VS Code (File → Open Folder).
2. Buka terminal VS Code (Terminal → New Terminal), lalu instal dependensi:
   ```bash
   npm install
   ```
3. **Buat proyek Supabase** di https://supabase.com (New project). Tunggu sampai siap.
4. **Atur autentikasi**: Supabase → Authentication → Providers → Email → matikan **Confirm email** (agar registrasi langsung bisa masuk saat demo).
5. **Jalankan skema database**: Supabase → SQL Editor → New query → tempel seluruh isi `database/schema.sql` → Run. Lalu buat query baru, tempel isi `database/seed_skills.sql` → Run.
6. **Konfigurasi environment**: salin `.env.example` menjadi `.env.local`, lalu isi:
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari Supabase → Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` (hanya untuk langkah seed di bawah; **jangan dibagikan**).
7. **Isi data demo** (akun demo + lowongan contoh berlabel DEMO):
   ```bash
   npm run seed
   ```
8. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```
9. Buka **http://localhost:3000**.
10. Uji fitur memakai daftar di `docs/uji-manual.md`.

### Akun demo (setelah `npm run seed`)

Kata sandi semua akun demo: `DemoPass123!`

| Peran | Email |
|---|---|
| Administrator | demo.admin@kerjatumbuh.test |
| UMKM | demo.umkm1@kerjatumbuh.test (juga umkm2, umkm3) |
| Pencari kerja | demo.seeker1@kerjatumbuh.test (juga seeker2, seeker3) |

Akun dan data ini hanya untuk demonstrasi, bukan hasil penelitian lapangan. Hapus atau nonaktifkan setelah lomba.

## Menjalankan tes otomatis

```bash
npm run test        # logika Smart Job Matching dan asisten lokal
npm run typecheck   # pemeriksaan tipe TypeScript
```

## Deployment ke Vercel

1. Unggah proyek ke repository **GitHub publik** (tanpa `.env.local`; sudah ada di `.gitignore`).
2. Buat akun di https://vercel.com (boleh masuk dengan GitHub).
3. **Add New → Project**, pilih repository KerjaTumbuh, framework akan terdeteksi sebagai Next.js.
4. Di **Environment Variables** isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. (Opsional: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.) **Jangan** mengisi `SUPABASE_SERVICE_ROLE_KEY` di Vercel.
5. Klik **Deploy**. Setelah selesai, buka URL `*.vercel.app`.
6. Di Supabase → Authentication → URL Configuration, tambahkan URL Vercel sebagai **Site URL**.
7. **Periksa** halaman beranda, daftar lowongan, login tiap peran, dan dasbor. Pastikan tautan dapat dibuka tanpa login untuk halaman publik, sebelum dikirim ke juri.

Data demo di Supabase yang sama akan terbaca oleh versi Vercel.

## Keamanan

- Kata sandi dikelola Supabase Auth (ter-hash); tidak disimpan di tabel aplikasi.
- RLS aktif pada seluruh tabel; peran `admin` tidak bisa dipilih saat registrasi (dijaga trigger).
- Status `verified` pada lowongan/usaha hanya bisa diubah admin (trigger penjaga). Mengubah isi lowongan Verified mengembalikannya ke antrean.
- Validasi input dengan Zod di server; kunci service role tidak dipakai di kode aplikasi, hanya di skrip seed lokal.
- Kunci API AI (opsional) hanya dibaca di server.

## AI Career Assistant

Default: mode **lokal** berbasis aturan dan templat (`lib/assistant.ts`), tidak butuh API. Jika `ANTHROPIC_API_KEY` diisi di server, asisten mencoba memakai API; bila gagal, otomatis kembali ke mode lokal.

## Catatan batasan

- Verifikasi bersifat manual oleh administrator, bukan verifikasi legalitas resmi.
- Notifikasi hanya di dalam aplikasi (tanpa email).
- Materi belajar adalah kurasi awal (DEMO) berupa tautan ke situs penyedia; periksa sebelum demonstrasi.
- Versi paket pada `package.json` memakai rentang versi; jalankan `npm install` untuk mengunci versi pada `package-lock.json`, lalu sertakan file tersebut di repository.
