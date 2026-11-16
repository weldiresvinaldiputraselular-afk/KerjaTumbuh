export default function Flash({ msg, error }: { msg?: string; error?: string }) {
  if (!msg && !error) return null;
  return (
    <div role={error ? "alert" : "status"} aria-live="polite" className={`mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
      <span aria-hidden="true" className="mt-0.5">{error ? "⚠️" : "✅"}</span>
      <span>{error ?? msg}</span>
    </div>
  );
}
