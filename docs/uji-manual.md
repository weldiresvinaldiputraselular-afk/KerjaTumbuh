# Daftar uji manual KerjaTumbuh

Jalankan setelah `npm run dev` dan `npm run seed`. Catat hasil PASS/FAIL aktual pada Laporan Pengujian.

| ID | Area | Langkah | Hasil yang diharapkan |
|---|---|---|---|
| T01 | Registrasi | Daftar sebagai pencari kerja dengan email baru | Akun dibuat, masuk ke dashboard pencari kerja |
| T02 | Registrasi | Daftar UMKM tanpa nama usaha | Muncul pesan galat validasi |
| T03 | Registrasi | Daftar dengan kata sandi < 8 karakter | Ditolak dengan pesan galat |
| T04 | Login | Login dengan kata sandi salah | Pesan "Email atau kata sandi salah" |
| T05 | Login | Login tiap peran demo | Diarahkan ke dashboard sesuai peran |
| T06 | Profil | Ubah profil, centang keterampilan, simpan | Data tersimpan dan tampil ulang |
| T07 | Profil | Tambah dan hapus pengalaman/portofolio | Daftar ikut berubah |
| T08 | Lowongan UMKM | Buat lowongan dan kirim verifikasi | Status "Menunggu verifikasi" |
| T09 | Verifikasi | Admin menyetujui lowongan T08 | Status Verified, notifikasi ke UMKM |
| T10 | Verifikasi | Admin menolak tanpa catatan | Ditolak sistem (catatan wajib) |
| T11 | Pencarian | Cari kata kunci, kota, jenis kerja | Daftar terfilter benar |
| T12 | Matching | Login pencari kerja, buka daftar lowongan | Persentase kecocokan tampil dan terurut |
| T13 | Matching | Buka detail lowongan | Rincian skor dan skill gap tampil |
| T14 | Lamaran | Kirim lamaran | Muncul di "Lamaran saya" dan di pelamar UMKM |
| T15 | Lamaran | Lamar lowongan yang sama dua kali | Pesan "sudah melamar" |
| T16 | Pelamar | UMKM ubah status pelamar jadi Diterima sampai kuota penuh | Lowongan menjadi Terisi |
| T17 | Laporan | Pencari kerja melaporkan lowongan; admin menindaklanjuti | Lowongan dinonaktifkan |
| T18 | Dashboard | Buka Economic Impact Dashboard | Angka dan grafik sesuai basis data |
| T19 | Asisten | Jalankan tiga tugas Career Assistant | Hasil tampil (mode lokal) |
| T20 | Keamanan | Pencari kerja membuka /admin/verifikasi | Dialihkan ke dashboard |
| T21 | Keamanan | UMKM membuka /profil | Dialihkan ke dashboard |
| T22 | Keamanan | Tanpa login buka /dashboard | Dialihkan ke /login |
| T23 | Keamanan | UMKM A membuka pelamar lowongan UMKM B (ubah ID di URL) | Halaman tidak ditemukan |
| T24 | Responsivitas | Buka di lebar 375px, 768px, 1280px | Tata letak tidak rusak, tidak ada scroll horizontal pada halaman |
| T25 | Pengguna | Admin menonaktifkan akun, akun itu mencoba masuk | Ditolak/dialihkan dengan pesan dinonaktifkan |
