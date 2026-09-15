"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { VeitaLogo } from "./VeitaLogo";
import { CtaButton } from "./CtaButton";
import { CTA_HREF, FOOTER_BLURB, NAV_ITEMS } from "@/lib/site";

const MONO = "font-mono uppercase";
const SHELL = "mx-auto w-full max-w-[1240px] px-6 md:px-10";
const RULE_SOFT = "1px solid var(--rule-soft)";

const META: React.CSSProperties = {
  letterSpacing: "0.18em",
  color: "var(--muted-fg)",
};

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-40"
        style={{
          background: scrolled ? "rgba(11,26,51,0.92)" : "var(--background)",
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          borderBottom: RULE_SOFT,
          transition: "background var(--dur-base) var(--ease-out-quart)",
        }}
      >
        <nav className={`${SHELL} flex items-center gap-6 py-5`}>
          <Link href="/" aria-label="Veita home" className="leading-none">
            <VeitaLogo size={19} />
          </Link>
          <span className={`${MONO} text-[10px] max-sm:hidden`} style={META}>
            company studio · est. 2026
          </span>

          <div
            className={`${MONO} ml-auto flex items-center gap-6 text-[10.5px]`}
            style={{ letterSpacing: "0.16em" }}
          >
            {[...NAV_ITEMS, { href: "/contact", label: "Contact" }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="max-lg:hidden"
                  style={{
                    color: "var(--muted-fg)",
                    transition: "color var(--dur-fast) var(--ease-out-quart)",
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
            <CtaButton className="max-md:hidden" />
            <button
              className="lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            className={`${SHELL} bg-background py-4 lg:hidden`}
            style={{ borderTop: RULE_SOFT }}
          >
            <div className="flex flex-col">
              {[...NAV_ITEMS, { href: "/contact", label: "Contact" }].map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`${MONO} py-3 text-[11px]`}
                    style={{
                      letterSpacing: "0.16em",
                      color: "var(--muted-fg)",
                      borderBottom: RULE_SOFT,
                    }}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-5">
                <CtaButton />
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer style={{ borderTop: RULE_SOFT }}>
        <div className={`${SHELL} py-16`}>
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <VeitaLogo size={22} />
              <p
                className="mt-5 text-[14px] leading-[1.6]"
                style={{ color: "var(--body-fg)" }}
              >
                {FOOTER_BLURB}
              </p>
              <div className="mt-8">
                <CtaButton />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-3.5">
              {[
                ...NAV_ITEMS,
                { href: "/contact", label: "Contact" },
                { href: CTA_HREF, label: "Onboarding agent" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${MONO} text-[10px]`}
                  style={{
                    letterSpacing: "0.16em",
                    color: "var(--muted-fg)",
                    transition: "color var(--dur-fast) var(--ease-out-quart)",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className={`${MONO} mt-16 flex items-center justify-between gap-4 pt-6 text-[10px]`}
            style={{ ...META, borderTop: RULE_SOFT }}
          >
            <span>© 2026 Veita</span>
            <Link href="/admin">Admin login</Link>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed bottom-5 right-5 z-40 md:hidden">
        <div className="pointer-events-auto">
          <CtaButton />
        </div>
      </div>
    </div>
  );
}
