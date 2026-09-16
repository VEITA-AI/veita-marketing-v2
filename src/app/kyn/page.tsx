import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Bleed,
  PageHero,
  SectionHead,
  SplitPair,
  ClosingSection,
} from "@/components/site/Sections";

export const metadata: Metadata = {
  title: "Kyn — A company that runs on the system",
  description:
    "Every Kyn operates on Saga and thinks with Kyndred. Two kinds, one architecture.",
};

const KINDS = [
  {
    name: "Origin",
    href: "/origin",
    eyebrow: "origin kyn",
    body: "Built from zero inside the studio. No legacy stack, no migration — the operating layer exists before the company does.",
    cta: "Go to Origin",
  },
  {
    name: "Transformation",
    href: "/transform",
    eyebrow: "transformation kyn",
    body: "An established business rebuilt around agentic operations. The revenue and the customers are already real; the operating model is what changes.",
    cta: "Go to Transform",
  },
];

export default function KynPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="kyn"
        title="A Kyn is a company that runs on the system."
        mark="system"
        lede="Every Kyn operates on Saga and thinks with Kyndred. That's what makes it a Kyn rather than a portfolio company — the architecture is shared, the operating layer is common, and the learning flows both ways."
      />

      <Bleed className="pb-14 pt-10 md:pb-24 md:pt-16">
        <SectionHead
          eyebrow="two kinds"
          title="Same architecture. Different starting point."
        />
        <SplitPair items={KINDS} />
      </Bleed>

      <ClosingSection
        title="Not sure which door is yours? The agent will work it out with you."
        mark="door"
      />
    </SiteLayout>
  );
}
