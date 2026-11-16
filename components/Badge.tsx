import { VACANCY_STATUS_LABEL, APPLICATION_STATUS_LABEL, UMKM_STATUS_LABEL } from "@/lib/format";

const TONE: Record<string, string> = {
  verified: "bg-green-100 text-green-800",
  accepted: "bg-green-100 text-green-800",
  filled: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  submitted: "bg-slate-100 text-slate-700",
  reviewed: "bg-sky-100 text-sky-800",
  interview: "bg-sky-100 text-sky-800",
  draft: "bg-slate-100 text-slate-700",
  unverified: "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, kind }: { status: string; kind: "vacancy" | "application" | "umkm" }) {
  const label = (kind === "vacancy" ? VACANCY_STATUS_LABEL : kind === "application" ? APPLICATION_STATUS_LABEL : UMKM_STATUS_LABEL)[status] ?? status;
  return <span className={`badge ${TONE[status] ?? "bg-slate-100 text-slate-700"}`}>{label}</span>;
}

export function VerifiedBadge() {
  return (
    <span className="badge bg-green-100 text-green-800">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
      Verified
    </span>
  );
}

export function MatchBar({ score }: { score: number }) {
  const tone = score >= 75 ? { bar: "from-green-500 to-emerald-600", text: "text-green-700", note: "Sangat cocok" }
    : score >= 50 ? { bar: "from-amber-400 to-amber-500", text: "text-amber-700", note: "Cukup cocok" }
    : { bar: "from-slate-400 to-slate-500", text: "text-slate-600", note: "Perlu ditingkatkan" };
  return (
    <div className="w-full">
      <div className="mb-1 flex items-end justify-between text-xs text-slate-600">
        <span>{tone.note}</span>
        <span className={`text-base font-extrabold ${tone.text}`}>{score}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Kecocokan ${score} persen`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
