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
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Past the first screen, and not while the footer — which carries its
      // own CTA — is on its way in.
      const remaining =
        document.documentElement.scrollHeight - (y + window.innerHeight);
      setShowBar(y > window.innerHeight * 0.85 && remaining > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 px-4 pt-4 md:px-6 md:pt-5">
        <nav
          className="mx-auto flex w-full max-w-[1240px] items-center gap-6 px-5 py-3 md:px-6"
          style={{
            borderRadius: 999,
            border: "1px solid var(--rule-soft)",
            background: scrolled
              ? "rgba(11,26,51,0.82)"
              : "rgba(22,34,48,0.55)",
            backdropFilter: "blur(14px)",
            boxShadow: scrolled
              ? "0 18px 40px -28px rgba(3,10,22,0.9)"
              : "none",
            transition:
              "background var(--dur-base) var(--ease-out-quart), box-shadow var(--dur-base) var(--ease-out-quart)",
          }}
        >
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
                  className="nav-link max-lg:hidden"
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
            className="mx-auto mt-3 w-full max-w-[1240px] px-6 py-4 lg:hidden"
            style={{
              borderRadius: 20,
              border: "1px solid var(--rule-soft)",
              background: "rgba(11,26,51,0.94)",
              backdropFilter: "blur(14px)",
            }}
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
        <div className={`${SHELL} py-12 md:py-16`}>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
            <div className="max-w-sm">
              <VeitaLogo size={22} />
              <p
                className="mt-5 text-[14.5px] leading-[1.6] md:text-[14px]"
                style={{ color: "var(--body-fg)" }}
              >
                {FOOTER_BLURB}
              </p>
              <div className="mt-8">
                <CtaButton />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1 md:gap-x-16 md:gap-y-3.5">
              {[
                ...NAV_ITEMS,
                { href: "/contact", label: "Contact" },
                { href: CTA_HREF, label: "Onboarding agent" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${MONO} py-3 text-[11px] md:py-0 md:text-[10px]`}
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
            className={`${MONO} mt-12 flex items-center justify-between gap-4 pt-6 text-[11px] md:mt-16 md:text-[10px]`}
            style={{ ...META, borderTop: RULE_SOFT }}
          >
            <span>© 2026 Veita</span>
            <Link href="/admin" className="py-3 md:py-0">
              Admin login
            </Link>
          </div>
        </div>
      </footer>

      {/* A bar rather than a floating chip: the page can reserve room for a
          bar, so nothing ends up permanently underneath it. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{
          borderTop: RULE_SOFT,
          background: "rgba(11,26,51,0.94)",
          backdropFilter: "blur(14px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          transform: showBar ? "translateY(0)" : "translateY(110%)",
          transition: "transform var(--dur-medium) var(--ease-out-quart)",
        }}
      >
        <div className="px-5 py-3">
          <CtaButton className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}
