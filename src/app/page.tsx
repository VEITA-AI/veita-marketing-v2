import Link from "next/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { CtaButton, GhostLink } from "@/components/site/CtaButton";
import { KyndredLoop } from "@/components/saga/KyndredLoop";
import {
  Bleed,
  FullBleed,
  DISPLAY,
  Eyebrow,
  Mark,
  SectionHead,
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
      <section className="atmos">
        <div className="mx-auto w-full max-w-[1240px] px-6 pb-28 pt-28 md:px-10 md:pb-36 md:pt-44">
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
        </div>

        {/* The anchoring artifact, lifted off the ground — the move Linear,
            Railway and Cursor all make with a product shot. */}
        <Reveal delay={240}>
          <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
            <div className="panel-lift sweep px-4 py-12 md:px-10 md:py-16">
              <div className="mb-10 flex flex-col gap-6 px-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <Eyebrow>what compounds</Eyebrow>
                  <h2
                    className="mt-5 max-w-[20ch] font-display"
                    style={{
                      ...DISPLAY,
                      fontSize: "clamp(1.75rem, 1rem + 1.9vw, 2.6rem)",
                    }}
                  >
                    Each one makes the next <Mark>cheaper</Mark> to build.
                  </h2>
                </div>
                <p
                  className="max-w-[32ch] text-[14px] leading-[1.6]"
                  style={{ color: "var(--body-fg)" }}
                >
                  Every Kyn contributes operational signal back to the platform.
                  It travels inward; shared capability travels back out.
                </p>
              </div>
              <KyndredLoop />
            </div>
          </div>
        </Reveal>
      </section>

      <Bleed className="pt-28 md:pt-36">
        <SectionHead eyebrow="the architecture" title="Four elements, one system" />
        <IndexList items={ELEMENTS} />
      </Bleed>

      <FullBleed className="mt-28 py-24 md:mt-36 md:py-32">
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
