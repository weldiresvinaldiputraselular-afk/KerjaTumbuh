# Keputusan desain (acuan proposal dan kode; harus konsisten)
- Peran: seeker, umkm, admin. Tabel: profiles, job_seekers, umkm_profiles, skills, seeker_skills, job_vacancies, vacancy_skills, job_applications, learning_resources, verifications, reports, notifications, seeker_experiences, seeker_portfolios.
- Status lowongan: draft, pending, verified, rejected, filled. Status lamaran: submitted, reviewed, interview, accepted, rejected.
- Smart Job Matching: skor 0-100 = 70% kecocokan keterampilan (skill lowongan yang dimiliki / total skill lowongan) + 15% lokasi (kota sama atau remote) + 15% pengalaman (min(tahun pengalaman / minimal pengalaman, 1); jika minimal 0 maka penuh).
- AI Career Assistant: mode lokal berbasis aturan/templat (default, tanpa API); mode API eksternal opsional bila kunci di server (env) tersedia.
- Teknologi: Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Auth, PostgreSQL, RLS), Recharts, Zod, Vercel, GitHub, VS Code.
- Notifikasi hanya di dalam aplikasi (tanpa email). Semua data contoh berlabel DEMO.
