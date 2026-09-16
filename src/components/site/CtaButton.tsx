import Link from "next/link";
import { CTA_HREF, CTA_LABEL } from "@/lib/site";

const MONO = "font-mono uppercase";

/**
 * The ember action — the only filled element in the system, so it is always
 * the one thing to do on a page. Square, per SAGA's instrument-grade flat.
 */
export function CtaButton({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={CTA_HREF}
      className={`${MONO} sheen group inline-flex items-center gap-2.5 px-6 py-4 text-[12px] md:py-3.5 md:text-[11px] ${className}`}
      style={{
        background: "var(--ember)",
        color: "var(--navy-deep)",
        letterSpacing: "0.16em",
        transition: "opacity var(--dur-fast) var(--ease-out-quart)",
      }}
    >
      {label ?? CTA_LABEL}
      <span className="transition-transform group-hover:translate-x-1">▸</span>
    </Link>
  );
}

/** The quieter companion action. */
export function GhostLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${MONO} group inline-flex items-center gap-2 py-2.5 text-[11.5px] md:py-0 md:text-[10.5px]`}
      style={{
        letterSpacing: "0.16em",
        color: "var(--muted-fg)",
        transition: "color var(--dur-fast) var(--ease-out-quart)",
      }}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">▸</span>
    </Link>
  );
}
