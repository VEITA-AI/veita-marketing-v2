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
  title: "Kyndred — The model trained on operating reality",
  description:
    "Kyndred is trained on the operational record of the companies Veita builds — decisions, outcomes, financials.",
};

const DIFFERENTIATORS = [
  {
    name: "Trained on operating reality",
    body: "Not scraped text. Real decisions, real outcomes and real financials from companies the studio builds and runs.",
    spec: "not scraped text",
  },
  {
    name: "It gets better with every Kyn",
    body: "Each company adds signal. The advantage compounds in one direction and it isn't easily copied.",
    spec: "one-way compounding",
  },
  {
    name: "Judgment where it matters",
    body: "Kyndred is used where the stakes are highest — positioning, pricing, sequencing and capital decisions.",
    spec: "highest-stakes calls",
  },
];

export default function KyndredPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="kyndred"
        title="A model that has actually run companies."
        mark="actually"
        lede="Kyndred is trained on the operational record of the companies Veita builds — decisions, outcomes, financials. It's the reason a new Kyn starts with judgment instead of assumptions."
      />

      <Bleed className="py-20 md:py-24">
        <SectionHead eyebrow="what makes it different" />
        <IndexList items={DIFFERENTIATORS} />
      </Bleed>

      <ClosingSection
        title="Kyndred is who you'll be speaking with."
        mark="speaking"
      />
    </SiteLayout>
  );
}
