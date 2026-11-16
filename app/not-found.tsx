import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="card text-center">
        <h1 className="h1">Halaman tidak ditemukan</h1>
        <p className="muted mt-2">Alamat yang Anda buka tidak tersedia atau Anda tidak memiliki akses.</p>
        <Link href="/" className="btn mt-4">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
