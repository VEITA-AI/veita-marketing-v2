import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Bleed,
  PageHero,
  SectionHead,
  IndexList,
  ClosingSection,
} from "@/components/site/Sections";

export const metadata: Metadata = {
  title: "Studio — Veita",
  description:
    "Veita conceives, capitalises and builds companies directly. The interesting part isn't any single company — it's what the studio learns from all of them.",
};

const REASONS = [
  {
    name: "One studio, many companies",
    body: "Veita conceives, capitalises and builds companies directly. Not advice, not a fund — operators building operating businesses.",
    spec: "operators, not advisors",
  },
  {
    name: "The compounding thesis",
    body: "Every Kyn contributes operational signal back to the platform. Each one makes the next smarter, faster and cheaper to build.",
    spec: "signal compounds",
  },
  {
    name: "Capital efficiency as architecture",
    body: "Shared infrastructure, shared intelligence and agentic execution mean a Kyn reaches proof with a fraction of the usual burn.",
    spec: "proof on less burn",
  },
];

export default function StudioPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="studio"
        title="A studio that gets better at building companies."
        mark="better"
        lede="Veita conceives, capitalises and builds companies directly. The interesting part isn't any single company — it's what the studio learns from all of them."
      />

      <Bleed className="pb-14 pt-10 md:pb-24 md:pt-16">
        <SectionHead eyebrow="the why" />
        <IndexList items={REASONS} />
      </Bleed>

      <ClosingSection
        title="Bring us the company you want to build — or the one you already run."
        mark="build"
      />
    </SiteLayout>
  );
}
