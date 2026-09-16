import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Bleed, PageHero, SectionHead } from "@/components/site/Sections";

export const metadata: Metadata = {
  title: "Contact — Veita",
  description:
    "The onboarding agent is the real front door. Email is here if you'd rather.",
};

const MONO = "font-mono uppercase tracking-[0.16em]";

export default function ContactPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="get started"
        title="The best way to reach us is to start talking."
        mark="talking"
        lede="The onboarding agent is the real front door — it's live, collaborative, and you'll get something useful out of the first conversation. Email is here if you'd rather."
        cta
      />

      <Bleed className="pb-14 pt-10 md:pb-24 md:pt-16">
        <SectionHead eyebrow="the other way" />
        <Reveal>
          <a
            href="mailto:hello@veita.com"
            className="group flex flex-col gap-3 py-7 transition-colors hover:bg-[rgba(54,123,192,0.05)] md:flex-row md:items-baseline md:justify-between md:gap-6 md:py-8"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="font-display text-[26px] md:text-[38px]">
              hello@veita.com
            </span>
            <span
              className={`${MONO} shrink-0 text-[10.5px] transition-all group-hover:translate-x-1 md:text-[9.5px]`}
              style={{ color: "var(--ember)" }}
            >
              email us →
            </span>
          </a>
        </Reveal>
      </Bleed>
    </SiteLayout>
  );
}
