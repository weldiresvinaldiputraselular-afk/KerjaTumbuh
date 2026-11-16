// Skrip seed data DEMO. Jalankan: npm run seed
// Memerlukan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local.
// Kunci service role HANYA dipakai di komputer Anda untuk skrip ini. Jangan taruh di Vercel.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local terlebih dahulu.");
  process.exit(1);
}
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const PASSWORD = "DemoPass123!";

async function ensureUser({ email, full_name, role, business_name }) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
    user_metadata: { full_name, role: role === "admin" ? "seeker" : role, business_name },
  });
  let id = data?.user?.id;
  if (error) {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    id = list?.users?.find((u) => u.email === email)?.id;
    if (!id) throw new Error(`Gagal membuat ${email}: ${error.message}`);
  }
  if (role === "admin") {
    await admin.from("profiles").update({ role: "admin" }).eq("id", id);
    await admin.from("job_seekers").delete().eq("profile_id", id);
  }
  await admin.from("profiles").update({ is_demo: true, full_name }).eq("id", id);
  return id;
}

async function main() {
  const { data: skillRows, error: sErr } = await admin.from("skills").select("id, name");
  if (sErr || !skillRows?.length) throw new Error("Tabel skills kosong. Jalankan database/seed_skills.sql lebih dulu.");
  const sk = Object.fromEntries(skillRows.map((s) => [s.name, s.id]));
  const ids = (names) => names.map((n) => { if (!sk[n]) throw new Error("Skill tidak ada: " + n); return sk[n]; });

  const adminId = await ensureUser({ email: "demo.admin@kerjatumbuh.test", full_name: "Admin Demo (DEMO)", role: "admin" });

  const umkmDefs = [
    { email: "demo.umkm1@kerjatumbuh.test", name: "Toko Contoh A (DEMO)", sector: "Perdagangan", city: "Pontianak", desc: "[DEMO] Toko perlengkapan rumah tangga dengan penjualan toko dan marketplace.", verified: true },
    { email: "demo.umkm2@kerjatumbuh.test", name: "Kedai Contoh B (DEMO)", sector: "Kuliner", city: "Singkawang", desc: "[DEMO] Kedai minuman dan makanan ringan.", verified: true },
    { email: "demo.umkm3@kerjatumbuh.test", name: "Kerajinan Contoh C (DEMO)", sector: "Kerajinan", city: "Bengkayang", desc: "[DEMO] Usaha kerajinan tangan lokal.", verified: false },
  ];
  const umkmIds = [];
  for (const u of umkmDefs) {
    const pid = await ensureUser({ email: u.email, full_name: "Pemilik " + u.name, role: "umkm", business_name: u.name });
    const { data } = await admin.from("umkm_profiles")
      .update({ business_name: u.name, sector: u.sector, city: u.city, description: u.desc, is_demo: true, verification_status: u.verified ? "verified" : "pending" })
      .eq("profile_id", pid).select("id").single();
    umkmIds.push(data.id);
  }

  const seekerDefs = [
    { email: "demo.seeker1@kerjatumbuh.test", name: "Pencari Demo 1", city: "Pontianak", edu: "S1", years: 1, headline: "Lulusan baru, minat media sosial dan desain", bio: "[DEMO] Lulusan baru yang terbiasa membuat konten dan melayani pelanggan dengan ramah dan teliti.", skills: ["Canva", "Media Sosial", "Komunikasi Efektif", "Microsoft Word"] },
    { email: "demo.seeker2@kerjatumbuh.test", name: "Pencari Demo 2", city: "Singkawang", edu: "SMA/SMK", years: 2, headline: "Berpengalaman kasir dan layanan pelanggan", bio: "[DEMO] Pernah bekerja sebagai kasir toko dan terbiasa mengelola stok harian.", skills: ["Kasir dan POS", "Pelayanan Pelanggan", "Manajemen Stok"] },
    { email: "demo.seeker3@kerjatumbuh.test", name: "Pencari Demo 3", city: "Bengkayang", edu: "D3", years: 0, headline: "", bio: "", skills: ["Dasar Komputer"] },
  ];
  const seekerIds = [];
  for (const s of seekerDefs) {
    const pid = await ensureUser({ email: s.email, full_name: s.name, role: "seeker" });
    const { data } = await admin.from("job_seekers")
      .update({ city: s.city, education_level: s.edu, years_experience: s.years, headline: s.headline || null, bio: s.bio || null })
      .eq("profile_id", pid).select("id").single();
    await admin.from("seeker_skills").delete().eq("seeker_id", data.id);
    await admin.from("seeker_skills").insert(ids(s.skills).map((skill_id) => ({ seeker_id: data.id, skill_id, level: 3 })));
    seekerIds.push(data.id);
  }
  await admin.from("seeker_experiences").delete().eq("seeker_id", seekerIds[1]);
  await admin.from("seeker_experiences").insert({ seeker_id: seekerIds[1], title: "Kasir (DEMO)", organization: "Toko Contoh A (DEMO)", description: "Melayani transaksi dan mencatat stok harian." });

  const { count } = await admin.from("job_vacancies").select("id", { count: "exact", head: true }).eq("is_demo", true);
  if ((count ?? 0) === 0) {
    const vacDefs = [
      { u: 0, title: "Admin Media Sosial (DEMO)", city: "Pontianak", type: "part_time", exp: 0, pos: 1, status: "verified", skills: ["Media Sosial", "Canva", "Copywriting"], desc: "[DEMO] Mengelola konten media sosial toko, membalas pesan pelanggan, dan membuat materi promosi sederhana." },
      { u: 0, title: "Staf Gudang dan Pengiriman (DEMO)", city: "Pontianak", type: "full_time", exp: 1, pos: 2, status: "verified", skills: ["Manajemen Stok", "Pengemasan dan Pengiriman"], desc: "[DEMO] Menyiapkan pesanan, mengemas barang, dan mencatat stok keluar masuk." },
      { u: 1, title: "Kasir dan Pelayan (DEMO)", city: "Singkawang", type: "full_time", exp: 1, pos: 1, status: "verified", skills: ["Kasir dan POS", "Pelayanan Pelanggan", "Komunikasi Efektif"], desc: "[DEMO] Melayani pelanggan, mengoperasikan kasir, dan menjaga kebersihan kedai." },
      { u: 1, title: "Pembuat Konten Kuliner (DEMO)", city: "Singkawang", type: "freelance", exp: 0, pos: 1, status: "verified", skills: ["Fotografi Produk", "Edit Video", "Media Sosial"], desc: "[DEMO] Membuat foto dan video pendek menu kedai untuk media sosial." },
      { u: 2, title: "Desainer Kemasan (DEMO)", city: "Bengkayang", type: "magang", exp: 0, pos: 1, status: "pending", skills: ["Desain Kemasan", "Desain Grafis"], desc: "[DEMO] Membantu merancang kemasan produk kerajinan. Lowongan ini menunggu verifikasi admin." },
      { u: 0, title: "Admin Pembukuan Paruh Waktu (DEMO)", city: "Pontianak", type: "part_time", exp: 1, pos: 1, status: "filled", skills: ["Pembukuan Sederhana", "Microsoft Excel"], desc: "[DEMO] Mencatat transaksi harian dan menyusun laporan sederhana. Posisi sudah terisi." },
    ];
    const created = [];
    for (const v of vacDefs) {
      const { data, error } = await admin.from("job_vacancies").insert({
        umkm_id: umkmIds[v.u], title: v.title, description: v.desc, city: v.city, work_type: v.type,
        min_experience: v.exp, positions: v.pos, status: v.status, is_demo: true, salary_note: "Sesuai kesepakatan (DEMO)",
      }).select("id").single();
      if (error) throw error;
      await admin.from("vacancy_skills").insert(ids(v.skills).map((skill_id) => ({ vacancy_id: data.id, skill_id })));
      created.push(data.id);
    }
    const apps = [
      { v: 0, s: 0, status: "interview", score: 100, note: "[DEMO] Saya tertarik mengelola media sosial toko." },
      { v: 2, s: 1, status: "reviewed", score: 90, note: "[DEMO] Saya berpengalaman sebagai kasir." },
      { v: 1, s: 2, status: "submitted", score: 15, note: "[DEMO] Saya siap belajar." },
      { v: 5, s: 1, status: "accepted", score: 30, note: "[DEMO] Saya bisa membantu pembukuan." },
    ];
    for (const a of apps) {
      await admin.from("job_applications").insert({ vacancy_id: created[a.v], seeker_id: seekerIds[a.s], status: a.status, match_score: a.score, cover_note: a.note });
    }
    const { data: sp } = await admin.from("job_seekers").select("profile_id").eq("id", seekerIds[2]).single();
    await admin.from("reports").insert({ vacancy_id: created[3], reporter_id: sp.profile_id, reason: "[DEMO] Contoh laporan: mohon periksa kejelasan alamat usaha." });
  } else {
    console.log("Data lowongan demo sudah ada, dilewati.");
  }
  console.log("Seed selesai. Admin id:", adminId);
  console.log("Kata sandi semua akun demo:", PASSWORD);
}

main().catch((e) => { console.error(e); process.exit(1); });
