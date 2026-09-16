import Link from "next/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { CtaButton, GhostLink } from "@/components/site/CtaButton";
import { CompoundingSequence } from "@/components/saga/CompoundingSequence";
import { Stat } from "@/components/site/Stat";
import { OperatingRecord } from "@/components/site/OperatingRecord";
import {
  Bleed,
  FullBleed,
  DISPLAY,
  Eyebrow,
  Mark,
  Headline,
  SectionHead,
  Thread,
  IndexList,
  SplitPair,
  ClosingSection,
} from "@/components/site/Sections";

const ELEMENTS = [
  {
    name: "Studio",
    href: "/studio",
    body: "The company studio. Where every Kyn is conceived, funded and built.",
    spec: "conceives · capitalises · builds",
  },
  {
    name: "Kyn",
    href: "/kyn",
    body: "A company built inside Veita. Two kinds, one architecture.",
    spec: "origin · transformation",
  },
  {
    name: "Kyndred",
    href: "/kyndred",
    body: "The model trained on operational reality across the portfolio.",
    spec: "decisions · outcomes · financials",
  },
  {
    name: "Saga",
    href: "/saga",
    body: "The agentic operating platform every Kyn runs on.",
    spec: "the ceo layer",
  },
];

const PROOF = [
  {
    name: "PreCognise",
    note: "verification-first talent marketplace · in pilot",
  },
];

const RUNS = [
  { name: "Finance", body: "Cash, runway and reporting maintained continuously." },
  { name: "Pipeline", body: "Opportunities progressed, not just recorded." },
  { name: "Board comms", body: "Drafted from the operating record, ready for review." },
  { name: "Content", body: "Produced against strategy, not a content calendar." },
];

const DOORS = [
  {
    name: "Origin",
    href: "/origin",
    eyebrow: "building something new",
    body: "Start from zero on Saga and Kyndred, with the studio behind you from day one.",
    cta: "Enter through Origin",
  },
  {
    name: "Transform",
    href: "/transform",
    eyebrow: "already operating",
    body: "Rebuild an established company around agentic operations, function by function.",
    cta: "Enter through Transform",
  },
];

export default function Home() {
  return (
    <SiteLayout>
      {/* The first screen gets the room it needs — nothing competes with the claim. */}
      <section className="atmos dot-grid">
        <div aria-hidden="true" className="sculpt">
          <span />
          <span />
          <span />
        </div>
        <div className="mx-auto w-full max-w-[1240px] px-6 pb-28 pt-24 md:px-10 md:pb-36 md:pt-40">
          <Reveal>
            <Link
              href="/saga"
              className="pill inline-flex items-center gap-2.5 px-3.5 py-1.5 font-mono text-[10px] uppercase"
              style={{ letterSpacing: "0.16em", color: "var(--body-fg)" }}
            >
              <span
                className="pulse-dot h-1 w-1 rounded-full"
                style={{ background: "var(--success)" }}
              />
              Saga · the agentic operating layer
              <span style={{ color: "var(--muted-fg)" }}>▸</span>
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="text-fade mt-10 max-w-[21ch] font-display"
              style={{
                ...DISPLAY,
                fontSize: "clamp(2.5rem, 1rem + 3.7vw, 4.6rem)",
              }}
            >
              Veita builds capital-efficient companies on a platform that{" "}
              <Mark>learns</Mark> from every one of them.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-14 grid gap-10 md:grid-cols-12">
              <p
                className="text-[17px] leading-[1.62] md:col-span-5"
                style={{ color: "var(--body-fg)", letterSpacing: "-0.005em" }}
              >
                Start a live conversation with our onboarding agent. It works
                through your plan with you and shows you where the leverage is —
                before anyone forms a judgment.
              </p>
              <div className="flex flex-wrap items-start gap-7 md:col-span-6 md:col-start-7 md:justify-end">
                <CtaButton label="Talk to our onboarding agent" />
                <GhostLink href="/saga">Explore the platform</GhostLink>
              </div>
            </div>
          </Reveal>
          {/* Proof inside the first screen. Both Kyn are live today. */}
          <Reveal delay={240}>
            <div
              className="mt-20 flex flex-col gap-6 pt-8 md:flex-row md:items-center md:gap-14"
              style={{ borderTop: "1px solid var(--rule-soft)" }}
            >
              <span
                className="shrink-0 font-mono text-[9.5px] uppercase"
                style={{ letterSpacing: "0.2em", color: "var(--muted-fg)" }}
              >
                § operating today
              </span>
              <div className="flex flex-wrap items-center gap-x-12 gap-y-5">
                {PROOF.map((k) => (
                  <Link
                    key={k.name}
                    href="/origin"
                    className="group flex items-baseline gap-3"
                  >
                    <span
                      className="pulse-dot h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full"
                      style={{ background: "var(--success)" }}
                    />
                    <span
                      className="font-display text-[19px]"
                      style={{ fontWeight: 500, letterSpacing: "-0.03em" }}
                    >
                      {k.name}
                    </span>
                    <span
                      className="font-mono text-[9.5px] uppercase"
                      style={{ letterSpacing: "0.16em", color: "var(--muted-fg)" }}
                    >
                      {k.note}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

      </section>

      {/* The system, built up one beat at a time as you scroll. */}
      <section className="riser" style={{ background: "var(--surface)" }}>
        <CompoundingSequence />
      </section>

      {/* Real figures, counted up. Every one is sourced from a page below. */}
      <Bleed className="pt-24 md:pt-28">
        <Reveal>
          <div
            className="grid grid-cols-2 gap-x-10 gap-y-12 pt-10 md:grid-cols-3"
            style={{ borderTop: "1px solid var(--rule-strong)" }}
          >
            <Stat value={4} label="Elements, one system" />
            <Stat value={4} label="Functions Saga runs" />
            <Stat value={2} label="Ways in" />
          </div>
        </Reveal>
      </Bleed>

      {/* What the operating layer actually does, against the record. */}
      <FullBleed className="riser sweep mt-28 py-24 md:mt-32 md:py-32">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>the ceo layer</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="mt-5 max-w-[16ch] font-display"
                  style={{
                    ...DISPLAY,
                    fontSize: "clamp(1.9rem, 1rem + 2.4vw, 3.25rem)",
                  }}
                >
                  <Headline
                    text="Not a dashboard. An operating layer that acts."
                    mark="acts."
                  />
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-10 flex flex-col">
                  {RUNS.map((r, i) => (
                    <div
                      key={r.name}
                      className="flex items-baseline gap-6 py-4"
                      style={{ borderTop: i === 0 ? undefined : "1px solid var(--rule-soft)" }}
                    >
                      <span
                        className="w-[110px] shrink-0 font-display text-[17px]"
                        style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
                      >
                        {r.name}
                      </span>
                      <span
                        className="text-[14px] leading-[1.55]"
                        style={{ color: "var(--body-fg)" }}
                      >
                        {r.body}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-10">
                  <GhostLink href="/saga">See how Saga runs a company</GhostLink>
                </div>
              </Reveal>
            </div>

            <Reveal delay={160} className="lg:col-span-6">
              <OperatingRecord caption="A dashboard would have shown you these as charts, after the fact. Saga had already done them." />
            </Reveal>
          </div>
        </div>
      </FullBleed>

      <Bleed className="pt-20 md:pt-24">
        <Thread />
      </Bleed>

      <Bleed className="pt-10 md:pt-12">
        <SectionHead eyebrow="the architecture" title="Four elements, one system" />
        <IndexList items={ELEMENTS} />
      </Bleed>

      <FullBleed className="riser mt-28 py-24 md:mt-36 md:py-32">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <SectionHead eyebrow="two doors" title="One system. Two ways in." />
          <SplitPair items={DOORS} />
        </div>
      </FullBleed>

      <ClosingSection
        title="The fastest way to understand Veita is to talk to it."
        mark="talk"
      />
    </SiteLayout>
  );
}
