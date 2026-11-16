export default function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-teal-700 to-brand p-6 text-white shadow-lift sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-brand-accent/25 blur-xl" />
      <div className="relative">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-emerald-50 sm:text-base">{subtitle}</p>}
        {children && <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
