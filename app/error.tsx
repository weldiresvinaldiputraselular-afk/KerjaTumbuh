"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-slate-600">Coba muat ulang halaman. Jika berlanjut, periksa konfigurasi Supabase di .env.local.</p>
      <button onClick={reset} className="btn mt-4">Coba lagi</button>
    </main>
  );
}
