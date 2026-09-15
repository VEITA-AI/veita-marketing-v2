"use client";

import { ArrowRight, Briefcase, Sparkles, UserPlus } from "lucide-react";
import { DIMENSIONS, PROFILE, scoreStyle } from "./data";

/** Dimension Scores tab — one card per scored dimension. */
export function Dimensions() {
  return (
    <div className="scrollbar-thin h-full overflow-y-auto px-8 py-8 max-md:px-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 font-display text-[26px]">Dimension scores</h1>
        <p className="mb-8 text-[13px] text-[var(--muted-fg)]">
          Where the plan stands right now, and what would move each one.
        </p>

        <div className="flex flex-col gap-3">
          {DIMENSIONS.map((dimension) => (
            <div
              key={dimension.id}
              className="p-6"
              style={{
                background: "var(--surface)",
                border: dimension.isGate
                  ? "1px solid var(--border-active)"
                  : "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-medium">{dimension.name}</div>
                  <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--muted-fg)]">
                    {dimension.weight}
                  </div>
                </div>
                <span
                  className="whitespace-nowrap px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider"
                  style={scoreStyle(dimension.score)}
                >
                  {dimension.score}
                </span>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--muted-fg)]">
                {dimension.summary}
              </p>

              {dimension.offer && (
                <button
                  className="group mt-5 inline-flex items-center gap-2 text-[13px] font-medium"
                  style={{ color: "var(--sky)" }}
                >
                  {dimension.offer}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const NEED_ICONS = [UserPlus, Sparkles, Briefcase];

/** Founder profile tab — the working portrait Kyndred assembles. */
export function FounderProfile() {
  return (
    <div className="scrollbar-thin h-full overflow-y-auto px-8 py-8 max-md:px-5">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 font-display text-[26px]">Founder profile</h1>
        <p className="mb-8 text-[13px] text-[var(--muted-fg)]">
          A working portrait of where you stand and what to do next.
        </p>

        <Block label="where your plan is strongest">
          <Card>
            <p className="text-[13.5px] leading-relaxed text-[var(--foreground)]">
              {PROFILE.strength}
            </p>
          </Card>
        </Block>

        <Block label="where to focus your energy">
          <div className="flex flex-col gap-3">
            {PROFILE.focus.map((item) => (
              <Card key={item.label}>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted-fg)]">
                  {item.label}
                </div>
                <p className="text-[13.5px] leading-relaxed text-[var(--foreground)]">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Block>

        <Block label="support structure">
          <div
            className="p-6"
            style={{
              background: "rgba(58, 172, 204, 0.04)",
              border: "1px solid rgba(58, 172, 204, 0.30)",
            }}
          >
            <div
              className="mb-2 font-display text-[16px]"
              style={{ color: "var(--success)" }}
            >
              {PROFILE.support.title}
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-[var(--foreground)]">
              {PROFILE.support.body}
            </p>
            <div className="mb-3 text-[11px] text-[var(--muted-fg)]">
              You&apos;re most likely to need:
            </div>
            <div className="flex flex-wrap gap-2">
              {PROFILE.support.needs.map((need, i) => {
                const Icon = NEED_ICONS[i] ?? UserPlus;
                return (
                  <span
                    key={need.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium"
                    style={{
                      background: need.bg,
                      border: `1px solid ${need.border}`,
                      color: need.color,
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {need.label}
                  </span>
                );
              })}
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted-fg)]">
        {label}
      </div>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

/** The "Veita team available" nudge that appears a few turns into the interview. */
export function TeamNudge({
  onAccept,
  onDismiss,
}: {
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[260px] p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ background: "var(--surface)", border: "1px solid var(--primary)" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="pulse-dot h-2 w-2 rounded-full"
          style={{ background: "var(--primary)" }}
        />
        <span className="flex-1 text-[13px] font-medium text-[var(--foreground)]">
          Veita team available
        </span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-[var(--muted-fg)] hover:text-[var(--foreground)]"
        >
          ×
        </button>
      </div>
      <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--muted-fg)]">
        A member of the Veita team has been watching your session and would like
        to connect. Would you like to chat live?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          Yes, connect me
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 py-1.5 text-[12px] font-medium text-[var(--muted-fg)] transition-colors hover:text-[var(--foreground)]"
          style={{ border: "1px solid var(--border)" }}
        >
          Not right now
        </button>
      </div>
    </div>
  );
}
