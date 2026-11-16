import Icon, { type IconName } from "@/components/Icon";

export default function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon?: IconName }) {
  return (
    <div className="card card-hover relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-soft" />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand-dark">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-dark"><Icon name={icon} /></span>}
      </div>
    </div>
  );
}
