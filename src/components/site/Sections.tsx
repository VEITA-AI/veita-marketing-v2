import { Fragment } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { CtaButton, GhostLink } from "./CtaButton";
import { AGENT_BLURB } from "@/lib/site";

/**
 * Veita's page grammar, following SAGA's design system
 * (`SAGA/packages/frontend/src/theme.ts`) on Veita's own palette.
 *
 * Structure comes from two rule weights and space — never shadows or fills.
 * Per SAGA's don't-list, this system has no card grids, no glassmorphism, no
 * gradient text, no icons above headings and no border-left accent stripes.
 */

const MONO = "font-mono uppercase";
const SHELL = "mx-auto w-full max-w-[1240px] px-6 md:px-10";
const RULE_SOFT = "1px solid var(--rule-soft)";
const RULE_STRONG = "1px solid var(--rule-strong)";

/** Tight grotesque at negative tracking — SAGA's display treatment. */
export const DISPLAY = {
  fontWeight: 500,
  letterSpacing: "-0.042em",
  lineHeight: 1.1,
} as const;

export function Bleed({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className={SHELL}>{children}</div>
    </section>
  );
}

/** A ground shift, bounded by hairlines. Used sparingly for page architecture. */
export function Band({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--surface)",
        borderTop: RULE_SOFT,
        borderBottom: RULE_SOFT,
      }}
    >
      <div className={SHELL}>{children}</div>
    </section>
  );
}

/** A band that runs edge to edge, ignoring the measure. */
export function FullBleed({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--surface)",
        borderTop: RULE_SOFT,
        borderBottom: RULE_SOFT,
      }}
    >
      {children}
    </section>
  );
}

/** SAGA's eyebrow: a section mark, then wide-tracked mono. */
export function Eyebrow({
  children,
  accent = false,
}: {
  children: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`${MONO} text-[11px]`}
      style={{
        letterSpacing: "0.22em",
        color: accent ? "var(--ember)" : "var(--muted-fg)",
      }}
    >
      <span style={{ opacity: 0.55 }}>§ </span>
      {children}
    </div>
  );
}

/** The signature move: one word carries a thick accent rule beneath it. */
export function Mark({ children }: { children: string }) {
  return (
    <span
      style={{
        textDecorationLine: "underline",
        textDecorationColor: "var(--ember)",
        textDecorationThickness: "0.075em",
        textUnderlineOffset: "0.13em",
        textDecorationSkipInk: "none",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Splits a headline into words so they can arrive on a stagger. The marked word
 * keeps its accent rule. Rendered as one text node per word, so the full string
 * still reads normally to screen readers and to text extraction.
 */
export function Headline({
  text,
  mark,
  className = "",
  style,
}: {
  text: string;
  mark?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span className={`word-rise ${className}`} style={style}>
      {words.map((word, i) => {
        const isMark =
          !!mark && word.replace(/[^A-Za-z-]/g, "") === mark.replace(/[^A-Za-z-]/g, "");
        return (
          <Fragment key={`${word}-${i}`}>
            <span style={{ "--i": i } as React.CSSProperties}>
              {isMark ? <Mark>{word}</Mark> : word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </span>
  );
}

/** A section-to-section thread with a signal travelling down it. */
export function Thread() {
  return (
    <div aria-hidden="true" className="py-2">
      <div className="thread" />
    </div>
  );
}

/** A dark figure plate — for self-contained artefacts like the Kyndred loop. */
export function Plate({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-7 md:px-10 md:py-10"
      style={{ background: "var(--navy-deep)", border: RULE_SOFT }}
    >
      {children}
    </div>
  );
}

/** Section head: display title left, § label right, strong rule beneath. */
export function SectionHead({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title?: string;
}) {
  return (
    <Reveal>
      <div className="md:pl-[2.5rem]">
        <div
          className={`flex flex-col items-start gap-2.5 pb-5 md:flex-row md:items-baseline md:gap-6 ${
            title ? "md:justify-between" : ""
          }`}
        >
          {title && (
            <h2
              className="font-display"
              style={{ ...DISPLAY, fontSize: "clamp(1.9rem, 1rem + 2.2vw, 3rem)" }}
            >
              {title}
            </h2>
          )}
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <div className="rule-fade rule-draw" />
      </div>
    </Reveal>
  );
}

/**
 * Sub-page hero. Reveal delays follow MOTION.md's hierarchy stagger —
 * eyebrow 0, headline 80, body 160, cta 240.
 */
export function PageHero({
  eyebrow,
  title,
  mark,
  lede,
  cta = false,
  aside,
}: {
  eyebrow: string;
  title: string;
  /** A single word in `title` to carry the accent rule. */
  mark?: string;
  lede: string;
  cta?: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <section className="atmos dot-grid">
      <div className="mx-auto w-full max-w-[1240px] px-6 pb-12 pt-20 md:px-10 md:pb-16 md:pt-32">
      <div className={aside ? "grid gap-10 lg:grid-cols-12 lg:gap-14" : ""}>
        <div className={aside ? "lg:col-span-7" : ""}>
          <Reveal>
            <Eyebrow accent>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="text-fade mt-6 max-w-[17ch] font-display md:mt-8"
              style={{
                ...DISPLAY,
                fontSize: "clamp(2.25rem, 1rem + 4.2vw, 4.25rem)",
              }}
            >
              <Headline text={title} mark={mark} />
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 pt-6 md:mt-10 md:pt-7" style={{ borderTop: RULE_STRONG }}>
              <p
                className="max-w-[58ch] text-[16px] leading-[1.62] md:text-[16.5px] md:leading-[1.6]"
                style={{ color: "var(--body-fg)", letterSpacing: "-0.005em" }}
              >
                {lede}
              </p>
            </div>
          </Reveal>
          {cta && (
            <Reveal delay={240}>
              <div className="mt-9">
                <CtaButton />
              </div>
            </Reveal>
          )}
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export type IndexItem = {
  name: string;
  body: string;
  spec?: string;
  href?: string;
};

/** The editorial index — numbered rows on hairlines, at a fixed measure. */
export function IndexList({ items }: { items: IndexItem[] }) {
  return (
    <div>
      {items.map((item, i) => {
        const inner = (
          <>
            <span
              className={`${MONO} text-[11px] tabular-nums`}
              style={{ letterSpacing: "0.14em", color: "var(--muted-fg)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="font-display text-[26px]"
              style={{ fontWeight: 500, letterSpacing: "-0.03em" }}
            >
              {item.name}
            </span>
            <span
              className="min-w-0 text-[15px] leading-[1.55]"
              style={{ color: "var(--body-fg)", letterSpacing: "-0.004em" }}
            >
              {item.body}
            </span>
            {item.spec && (
              <span
                className={`${MONO} w-[168px] text-[9.5px] leading-relaxed max-lg:hidden`}
                style={{ letterSpacing: "0.14em", color: "var(--sky)" }}
              >
                {item.spec}
              </span>
            )}
            <span
              className="w-4 text-right transition-transform group-hover:translate-x-1 max-md:hidden"
              style={{
                color: "var(--muted-fg)",
                opacity: item.href ? 1 : 0,
              }}
            >
              ▸
            </span>
          </>
        );

        const rowClass =
          "row-sweep underline-draw group grid grid-cols-1 items-baseline gap-x-8 gap-y-2.5 px-3 py-7 -mx-3 md:grid-cols-[2.5rem_15rem_1fr_1rem] md:gap-y-3 md:py-8 lg:grid-cols-[2.5rem_15rem_1fr_10rem_1rem]";

        return (
          <Reveal key={item.name} delay={i * 50}>
            {item.href ? (
              <Link
                href={item.href}
                className={rowClass}
                style={{ borderBottom: RULE_SOFT }}
              >
                {inner}
              </Link>
            ) : (
              <div className={rowClass} style={{ borderBottom: RULE_SOFT }}>
                {inner}
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

/** Two-up split divided by a vertical hairline. */
export function SplitPair({
  items,
}: {
  items: {
    name: string;
    eyebrow: string;
    body: string;
    cta: string;
    href: string;
  }[];
}) {
  return (
    <div className="grid md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.href} delay={i * 80}>
          <Link
            href={item.href}
            className={`group flex h-full flex-col py-10 transition-transform hover:-translate-y-1 md:py-14 ${
              i === 0 ? "md:pr-14" : "md:pl-14 md:pt-32"
            } max-md:border-b`}
            style={{
              borderColor: "var(--rule-soft)",
              ...(i === 0 ? { borderRight: RULE_SOFT } : {}),
            }}
          >
            <Eyebrow>{item.eyebrow}</Eyebrow>
            <div
              className="mt-5 font-display"
              style={{
                ...DISPLAY,
                fontSize: "clamp(2.25rem, 1rem + 3vw, 3.5rem)",
              }}
            >
              {item.name}
            </div>
            <p
              className="mt-6 max-w-[40ch] flex-1 text-[15px] leading-[1.55]"
              style={{ color: "var(--body-fg)" }}
            >
              {item.body}
            </p>
            <span
              className={`${MONO} mt-8 text-[11.5px] transition-transform group-hover:translate-x-1 md:mt-9 md:text-[10.5px]`}
              style={{ letterSpacing: "0.16em", color: "var(--ember)" }}
            >
              {item.cta} ▸
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** A weighted block. Bounded by a hairline — never a border-left stripe. */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-6 md:p-10"
      style={{ background: "var(--surface)", border: RULE_SOFT }}
    >
      {children}
    </div>
  );
}

/** The closing action, on its own ground so the page ends on weight. */
export function ClosingSection({
  title,
  mark,
}: {
  title: string;
  mark?: string;
}) {
  return (
    <Band className="riser sweep py-16 md:py-32">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7">
          <h2
            className="font-display"
            style={{
              ...DISPLAY,
              fontSize: "clamp(2rem, 1rem + 2.6vw, 3.25rem)",
            }}
          >
            <Headline text={title} mark={mark} />
          </h2>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-5">
          <div>
            <Eyebrow>the front door</Eyebrow>
            <p
              className="mt-5 max-w-[46ch] text-[15px] leading-[1.6]"
              style={{ color: "var(--body-fg)" }}
            >
              {AGENT_BLURB}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5 md:mt-9">
              <CtaButton />
              <GhostLink href="/contact">or email us</GhostLink>
            </div>
          </div>
        </Reveal>
      </div>
    </Band>
  );
}
