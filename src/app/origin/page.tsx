import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import {
  Bleed,
  PageHero,
  SectionHead,
  IndexList,
  ClosingSection,
} from "@/components/site/Sections";

export const metadata: Metadata = {
  title: "Origin — Start from zero with the system already running",
  description:
    "Origin is for founders building something new inside Veita. The leverage is there on day one.",
};

const MEANING = [
  {
    name: "Built on Saga from day one",
    body: "No stack to assemble. Finance, CRM, pipeline and reporting are operating before the first customer conversation.",
    spec: "no stack to assemble",
  },
  {
    name: "Kyndred from the first decision",
    body: "The model has already watched other companies make the decision in front of you. You start informed, not guessing.",
    spec: "informed, not guessing",
  },
  {
    name: "Studio behind the founder",
    body: "Capital, build capacity and operating partners come with the Kyn, not after a raise.",
    spec: "capital + capacity",
  },
];

const PROOF = [
  {
    name: "PreCognise",
    status: "live",
    body: "Verification-first talent marketplace.",
    note: "In pilot — Work-Integrated Learning verification stream",
  },
  {
    name: "EasyAudit",
    status: "live",
    body: "Agentic compliance platform — SOC 2, ISO 27001/42001, HIPAA, GDPR.",
    note: "50+ customers",
  },
];

const MONO = "font-mono uppercase tracking-[0.16em]";

export default function OriginPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="origin"
        title="Start from zero with the system already running."
        mark="zero"
        lede="Origin is for founders building something new inside Veita. You don't assemble a company and then look for leverage — the leverage is there on day one."
        cta
      />

      <Bleed className="py-20 md:py-24">
        <SectionHead eyebrow="what it means" />
        <IndexList items={MEANING} />
      </Bleed>

      <Bleed className="py-20 md:py-24">
        <SectionHead eyebrow="proof points" title="Origin Kyn already operating" />
        <div className="grid md:grid-cols-2">
          {PROOF.map((point, i) => (
            <Reveal key={point.name} delay={i * 90}>
              <div
                className={`flex h-full flex-col py-10 ${
                  i === 0 ? "md:border-r md:pr-12" : "md:pl-12"
                } max-md:border-b`}
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-display text-[30px]">{point.name}</div>
                  <span
                    className={`${MONO} inline-flex shrink-0 items-center gap-1.5 text-[9px]`}
                    style={{ color: "var(--success)" }}
                  >
                    <span
                      className="pulse-dot h-1 w-1 rounded-full"
                      style={{ background: "var(--success)" }}
                    />
                    {point.status}
                  </span>
                </div>
                <p className="mt-4 flex-1 text-[14.5px] leading-[1.6] text-[var(--body-fg)]">
                  {point.body}
                </p>
                <div
                  className={`${MONO} mt-6 pt-4 text-[9.5px]`}
                  style={{
                    color: "var(--sky)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {point.note}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Bleed>

      <ClosingSection
        title="Bring the idea. The agent will pressure-test it with you."
        mark="pressure-test"
      />
    </SiteLayout>
  );
}
