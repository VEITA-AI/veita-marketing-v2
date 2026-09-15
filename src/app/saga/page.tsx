import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { OperatingRecord } from "@/components/site/OperatingRecord";
import {
  Bleed,
  PageHero,
  SectionHead,
  IndexList,
  Plate,
  ClosingSection,
} from "@/components/site/Sections";
import { KyndredLoop } from "@/components/saga/KyndredLoop";

export const metadata: Metadata = {
  title: "Saga — The agentic operating platform",
  description:
    "Saga is the agentic platform every Kyn runs on — the CEO layer. Not a dashboard. An operating layer that acts.",
};

const FUNCTIONS = [
  {
    name: "Finance",
    body: "Cash, runway and reporting maintained continuously.",
    spec: "continuous close",
  },
  {
    name: "Pipeline and CRM",
    body: "Opportunities progressed, not just recorded.",
    spec: "progressed, not logged",
  },
  {
    name: "Board and investor comms",
    body: "Drafted from the operating record, ready for review.",
    spec: "drafted from record",
  },
  {
    name: "Content and sales",
    body: "Produced against strategy, not against a content calendar.",
    spec: "against strategy",
  },
];

export default function SagaPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="saga"
        title="Not a dashboard. An operating layer that acts."
        mark="acts"
        lede="Saga is the agentic platform every Kyn runs on — the CEO layer. It doesn't wait to be asked. Work moves forward between the meetings, not because of them."
        aside={
          <Reveal delay={260}>
            <OperatingRecord caption="A dashboard would have shown you these as charts, after the fact. Saga had already done them." />
          </Reveal>
        }
      />

      <Bleed className="py-20 md:py-24">
        <SectionHead eyebrow="the ceo layer" title="What Saga runs" />
        <IndexList items={FUNCTIONS} />
      </Bleed>

      <Bleed className="py-20 md:py-24">
        <SectionHead
          eyebrow="the kyndred model"
          title="Every company learns. The studio compounds."
        />
        <Reveal>
          <div className="pt-12">
            <Plate>
              <KyndredLoop />
            </Plate>
          </div>
        </Reveal>
      </Bleed>

      <Bleed className="pb-20 md:pb-24">
        <Reveal>
          <p className="mx-auto max-w-3xl text-center font-display text-[26px] leading-snug md:text-[36px]">
            A dashboard tells you what happened. Saga has already done something
            about it.
          </p>
        </Reveal>
      </Bleed>

      <ClosingSection
        title="See how it would run your company."
        mark="run"
      />
    </SiteLayout>
  );
}
