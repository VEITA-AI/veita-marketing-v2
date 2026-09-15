"use client";

import Link from "next/link";
import { Check, Circle, ExternalLink, FileText, MessageSquare, Upload, User } from "lucide-react";
import { VeitaLogo } from "@/components/site/VeitaLogo";
import { DIMENSIONS, INTAKE_STEPS, scoreStyle } from "./data";

export type Panel = "get-started" | "interview" | "dimensions" | "profile";

const STEP_ICONS = {
  opening: MessageSquare,
  docs: Upload,
  interview: FileText,
} as const;

/** Top bar: logo, phase progress dots, live-session indicator. */
export function AppHeader({
  phase,
  activeIndex,
  total = 4,
}: {
  phase: string;
  activeIndex: number;
  total?: number;
}) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center border-b border-[var(--border)] bg-background px-6">
      <div className="flex w-[232px] items-center gap-3">
        <Link href="/" aria-label="Veita home" className="leading-none">
          <VeitaLogo size={17} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--muted-fg)] transition-colors hover:text-[var(--foreground)]"
        >
          <ExternalLink className="h-3 w-3" />
          site
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === activeIndex ? 18 : 10,
                background:
                  i < activeIndex
                    ? "var(--success)"
                    : i === activeIndex
                      ? "var(--primary)"
                      : "var(--border)",
              }}
            />
          ))}
        </div>
        <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted-fg)]">
          {phase}
        </span>
      </div>

      <div className="flex w-[232px] items-center justify-end gap-2">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--muted-fg)]">
          live session
        </span>
      </div>
    </header>
  );
}

/** Left rail: intake progress, dimension scores, and the profile output. */
export function Sidebar({
  active,
  onNavigate,
}: {
  active: Panel;
  onNavigate: (panel: Panel) => void;
}) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-background max-lg:hidden">
      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-6">
        <div className="mb-7">
          <div className="mb-3 px-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted-fg)]">
            intake
          </div>
          <div className="flex flex-col gap-1">
            {INTAKE_STEPS.map((step) => {
              const Icon = STEP_ICONS[step.key];
              const isActive = step.status === "active" && active === "interview";
              const isComplete = step.status === "complete";
              return (
                <button
                  key={step.key}
                  onClick={() =>
                    step.status === "active" && onNavigate("interview")
                  }
                  className="relative flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(54,123,192,0.06)]"
                  style={
                    isActive
                      ? {
                          background: "rgba(54, 123, 192, 0.10)",
                          boxShadow: "inset 2px 0 0 0 var(--primary)",
                        }
                      : undefined
                  }
                >
                  {isComplete ? (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: "rgba(58, 172, 204, 0.18)" }}
                    >
                      <Check
                        className="h-2.5 w-2.5"
                        style={{ color: "var(--success)" }}
                      />
                    </span>
                  ) : (
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{
                        color: isActive ? "var(--primary)" : "var(--muted-fg)",
                      }}
                    />
                  )}
                  <span
                    className="text-[13px]"
                    style={{
                      color: isComplete
                        ? "var(--success)"
                        : isActive
                          ? "var(--foreground)"
                          : "var(--muted-fg)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-7">
          <div className="mb-3 px-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted-fg)]">
            dimensions
          </div>
          <div className="flex flex-col gap-1">
            {DIMENSIONS.map((dimension) => (
              <button
                key={dimension.id}
                onClick={() => onNavigate("dimensions")}
                className="flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(54,123,192,0.06)]"
                style={
                  active === "dimensions"
                    ? { background: "rgba(54, 123, 192, 0.06)" }
                    : undefined
                }
              >
                <span className="pr-1 text-[12.5px] leading-tight text-[var(--foreground)]">
                  {dimension.name}
                </span>
                <span
                  className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  style={scoreStyle(dimension.score)}
                >
                  {dimension.score}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-5 py-5">
        <div className="mb-3 px-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted-fg)]">
          output
        </div>
        <button
          onClick={() => onNavigate("profile")}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(54,123,192,0.06)]"
          style={
            active === "profile"
              ? {
                  background: "rgba(54, 123, 192, 0.10)",
                  boxShadow: "inset 2px 0 0 0 var(--primary)",
                }
              : { opacity: 0.55 }
          }
        >
          {active === "profile" ? (
            <User className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
          ) : (
            <Circle className="h-3.5 w-3.5 text-[var(--muted-fg)]" />
          )}
          <span
            className="text-[13px]"
            style={{
              color:
                active === "profile" ? "var(--foreground)" : "var(--muted-fg)",
              fontWeight: active === "profile" ? 500 : 400,
            }}
          >
            Founder profile
          </span>
        </button>
      </div>
    </aside>
  );
}
