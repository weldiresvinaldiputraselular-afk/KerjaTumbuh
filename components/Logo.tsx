import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="KerjaTumbuh - beranda" className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/kerjatumbuh-logo.svg" alt="" width={36} height={36} />
      <span className="text-xl font-bold text-brand-dark">
        Kerja<span className="text-brand">Tumbuh</span>
      </span>
    </Link>
  );
}
