import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { CtaButton } from "@/components/site/CtaButton";
import {
  Bleed,
  PageHero,
  SectionHead,
  IndexList,
  Panel,
  ClosingSection,
} from "@/components/site/Sections";

export const metadata: Metadata = {
  title: "Transform — Rebuild an established company around agentic operations",
  description:
    "Transform is for established businesses undergoing deep AI integration. AI-first wherever the work can be done that way.",
};

const SERVICE_SURFACE = [
  {
    name: "Operating diagnostic",
    body: "Where the drag actually sits — revenue, delivery, finance, support.",
    spec: "find the drag",
  },
  {
    name: "Agentic go-to-market",
    body: "Pipeline generation, qualification and follow-through run by agents, supervised by your team.",
    spec: "agents, supervised",
  },
  {
    name: "Finance and reporting",
    body: "Close, forecast and board reporting reduced from a monthly project to a continuous state.",
    spec: "monthly → continuous",
  },
  {
    name: "Delivery and support",
    body: "Frontline workflows rebuilt so the human handles the exception, not the queue.",
    spec: "exception, not queue",
  },
  {
    name: "Data and systems",
    body: "Existing tools connected into one operating surface instead of another migration.",
    spec: "connect, don't migrate",
  },
  {
    name: "Team enablement",
    body: "Your people trained to run the agentic layer, not replaced by it.",
    spec: "trained, not replaced",
  },
];

export default function TransformPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="transform"
        title="Your company already works. This changes how it operates."
        mark="operates"
        lede="Transform is for established businesses undergoing deep AI integration. Broader service surface than Origin — but AI-first wherever the work can be done that way."
        cta
      />

      <Bleed className="pb-20 pt-14 md:pb-24 md:pt-16">
        <SectionHead
          eyebrow="the differentiator"
          title="The onboarding agent is the proof"
        />
        <Reveal>
          <div className="pt-8">
            <Panel>
              <p className="max-w-2xl text-[16px] leading-[1.65]">
                Most firms tell you they use AI. Ours starts working the moment
                you arrive. The onboarding agent reads your material, asks what a
                good operator would ask, and maps where the drag actually sits in
                your business — live, with you, in one conversation.
              </p>
              <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.6] text-[var(--body-fg)]">
                That&apos;s the same standard we hold the engagement to. If a
                step can be run by an agent and supervised by a human, it is.
              </p>
              <div className="mt-8">
                <CtaButton />
              </div>
            </Panel>
          </div>
        </Reveal>
      </Bleed>

      <Bleed className="py-20 md:py-24">
        <SectionHead eyebrow="service surface" title="Where we work" />
        <IndexList items={SERVICE_SURFACE} />
      </Bleed>

      <ClosingSection
        title="Show the agent your business. Leave with a sequence, not a proposal."
        mark="sequence"
      />
    </SiteLayout>
  );
}
