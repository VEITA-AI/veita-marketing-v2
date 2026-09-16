"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The compounding loop, told as a scroll sequence.
 *
 * A tall track with a sticky stage; scroll position drives five beats that
 * build the system up rather than presenting it finished:
 *
 *   1. Kyndred alone
 *   2. Four Kyn appear, in different spaces
 *   3. Each connects to the shared layer
 *   4. Their operating signal travels inward
 *   5. What one Kyn learned comes back out as another's play
 *
 * Driven by a scroll handler rather than `animation-timeline`, because this
 * needs to scrub deterministically in every browser — Firefox still gates
 * scroll-driven animations behind a flag.
 */

const CX = 500;
const CY = 360;
const ORBIT = 232;
const CORE_R = 86;
const NODE_R = 52;

type Kyn = { name: string; domain: string; okr: string; okrAfter?: string };

const KYNS: Kyn[] = [
  { name: "Kyn 1", domain: "Sales", okr: "Funnel +25%" },
  {
    name: "Kyn 2",
    domain: "Finance",
    okr: "AR >60d under 10%",
    okrAfter: "Play applied · deposit terms",
  },
  { name: "Kyn 3", domain: "R&D", okr: "Spec-to-merge −30%" },
  { name: "Kyn 4", domain: "Marketing", okr: "Qualified leads +40%" },
];

const BEATS = [
  {
    label: "the shared layer",
    title: "It starts with one model.",
    body: "Kyndred is trained on the operational record of the companies Veita builds — decisions, outcomes, financials. Not scraped text.",
  },
  {
    label: "the companies",
    title: "Four companies, four different spaces.",
    body: "Sales, finance, R&D, marketing. Each Kyn runs its own business with its own targets, set at onboarding — its agent proposes, a human confirms.",
  },
  {
    label: "one architecture",
    title: "Every Kyn runs on the same layer.",
    body: "That is what makes it a Kyn rather than a portfolio company. The operating layer is common, and the learning flows both ways.",
  },
  {
    label: "signal inward",
    title: "Operating reality travels in.",
    body: "Every decision a Kyn makes and every outcome it gets is read back into the shared record. Four companies of real evidence, not one.",
  },
  {
    label: "capability back out",
    title: "What one Kyn learns, the next one starts with.",
    body: "Sales finds a collections cadence that gets invoices paid faster. Kyndred carries it across — and Finance starts its quarter with the play already in hand.",
  },
];

/** Smoothstep — eases both ends so nothing starts or stops abruptly. */
const ease = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
};

/** Maps global progress onto a [from,to] window, eased. */
const span = (p: number, from: number, to: number) =>
  ease((p - from) / (to - from));

export function CompoundingSequence() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setP(1);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return setP(1);
      setP(Math.min(Math.max(-rect.top / scrollable, 0), 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const nodes = KYNS.map((k, i) => {
    const angle = ((-90 + i * 90) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      ...k,
      i,
      x: CX + ORBIT * cos,
      y: CY + ORBIT * sin,
      fromX: CX + (CORE_R + 10) * cos,
      fromY: CY + (CORE_R + 10) * sin,
      toX: CX + ORBIT * cos - (NODE_R + 10) * cos,
      toY: CY + ORBIT * sin - (NODE_R + 10) * sin,
    };
  });

  // Beat windows.
  const core = span(p, 0.0, 0.055);
  const kynIn = span(p, 0.14, 0.32);
  const linkIn = span(p, 0.34, 0.5);
  const inward = span(p, 0.52, 0.68);
  const outward = span(p, 0.74, 0.92);

  const beat =
    p < 0.14 ? 0 : p < 0.34 ? 1 : p < 0.52 ? 2 : p < 0.72 ? 3 : 4;

  // Beat 5 routes Sales' learning through the core and out to Finance.
  const source = nodes[0];
  const target = nodes[1];
  const legIn = Math.min(outward / 0.45, 1);
  const legOut = Math.max((outward - 0.5) / 0.5, 0);

  const packetIn = {
    x: source.x + (CX - source.x) * ease(legIn),
    y: source.y + (CY - source.y) * ease(legIn),
  };
  const packetOut = {
    x: CX + (target.x - CX) * ease(legOut),
    y: CY + (target.y - CY) * ease(legOut),
  };

  return (
    <div ref={trackRef} className="relative h-[320vh] md:h-[440vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Narration */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                {BEATS.map((_, i) => (
                  <span
                    key={i}
                    className="h-[2px] flex-1 rounded-full transition-all"
                    style={{
                      background:
                        i <= beat ? "var(--ember)" : "var(--rule-soft)",
                      opacity: i <= beat ? 1 : 0.6,
                      transition:
                        "background var(--dur-base) var(--ease-out-quart)",
                    }}
                  />
                ))}
              </div>

              <div className="relative mt-8 min-h-[280px]">
                {BEATS.map((b, i) => (
                  <div
                    key={b.title}
                    className="absolute inset-0"
                    style={{
                      opacity: i === beat ? 1 : 0,
                      transform:
                        i === beat ? "none" : "translateY(10px)",
                      pointerEvents: i === beat ? undefined : "none",
                      transition:
                        "opacity var(--dur-medium) var(--ease-out-quart), transform var(--dur-medium) var(--ease-out-quart)",
                    }}
                  >
                    <div
                      className="font-mono text-[11px] uppercase"
                      style={{
                        letterSpacing: "0.22em",
                        color: "var(--ember)",
                      }}
                    >
                      <span style={{ opacity: 0.55 }}>§ </span>
                      {b.label}
                    </div>
                    <h3
                      className="mt-5 font-display"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "-0.035em",
                        lineHeight: 1.1,
                        fontSize: "clamp(1.6rem, 1rem + 1.5vw, 2.4rem)",
                      }}
                    >
                      {b.title}
                    </h3>
                    <p
                      className="mt-5 max-w-[42ch] text-[14.5px] leading-[1.6]"
                      style={{ color: "var(--body-fg)" }}
                    >
                      {b.body}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-2 font-mono text-[10px] uppercase tabular-nums"
                style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
              >
                {String(beat + 1).padStart(2, "0")} / 0{BEATS.length}
              </div>
            </div>

            {/* Stage */}
            <div className="kl-root lg:col-span-8">
              <svg
                viewBox="0 0 1000 720"
                className="block h-full w-full"
                role="img"
                aria-label="A scroll sequence: Kyndred, then four Kyn, then each connecting to the shared layer, their operating signal travelling inward, and shared capability travelling back out."
              >
                <defs>
                  <radialGradient
                    id="cs-spoke"
                    gradientUnits="userSpaceOnUse"
                    cx={CX}
                    cy={CY}
                    r={ORBIT}
                  >
                    <stop offset="0%" stopColor="#8fc0ea" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#367bc0" stopOpacity="0.3" />
                  </radialGradient>
                  <radialGradient id="cs-disc" cx="36%" cy="28%" r="84%">
                    <stop offset="0%" stopColor="#1e3a5c" />
                    <stop offset="100%" stopColor="#111f36" />
                  </radialGradient>
                  <radialGradient id="cs-core" cx="38%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#17304f" />
                    <stop offset="100%" stopColor="#0a1730" />
                  </radialGradient>
                  <radialGradient id="cs-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3aaccc" stopOpacity="0.45" />
                    <stop offset="55%" stopColor="#367bc0" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#367bc0" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Core glow, intensifying as signal arrives */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={CORE_R * 2.5}
                  fill="url(#cs-glow)"
                  opacity={0.35 + core * 0.3 + inward * 0.45}
                />

                {/* Spokes draw outward from the core */}
                {nodes.map((n) => {
                  const len = Math.hypot(n.toX - n.fromX, n.toY - n.fromY);
                  return (
                    <line
                      key={`l-${n.i}`}
                      x1={n.fromX}
                      y1={n.fromY}
                      x2={n.toX}
                      y2={n.toY}
                      stroke="url(#cs-spoke)"
                      strokeWidth={1.5}
                      strokeDasharray={len}
                      strokeDashoffset={len * (1 - linkIn)}
                      opacity={linkIn}
                    />
                  );
                })}

                {/* Beat 4 — every Kyn's signal travels inward */}
                {nodes.map((n) => {
                  const t = ease(
                    Math.min(Math.max(inward * 1.6 - n.i * 0.12, 0), 1)
                  );
                  return (
                    <circle
                      key={`in-${n.i}`}
                      r={5}
                      cx={n.toX + (n.fromX - n.toX) * t}
                      cy={n.toY + (n.fromY - n.toY) * t}
                      fill="var(--success)"
                      opacity={inward > 0.02 && outward < 0.05 ? 1 : 0}
                      style={{ filter: "drop-shadow(0 0 6px rgba(58,172,204,0.9))" }}
                    />
                  );
                })}

                {/* Beat 5 — one Kyn's learning routes out as another's play */}
                {outward > 0.01 && (
                  <>
                    <circle
                      r={6}
                      cx={packetIn.x}
                      cy={packetIn.y}
                      fill="var(--success)"
                      opacity={legIn < 1 ? 1 : 0}
                      style={{ filter: "drop-shadow(0 0 8px rgba(58,172,204,1))" }}
                    />
                    <circle
                      r={6}
                      cx={packetOut.x}
                      cy={packetOut.y}
                      fill="var(--sky)"
                      opacity={legOut > 0 ? 1 : 0}
                      style={{ filter: "drop-shadow(0 0 8px rgba(143,192,234,1))" }}
                    />
                  </>
                )}

                {/* Kyn nodes */}
                {nodes.map((n) => {
                  const appear = ease(
                    Math.min(Math.max(kynIn * 1.5 - n.i * 0.14, 0), 1)
                  );
                  const isSource = outward > 0.01 && n.i === 0;
                  const isTarget = legOut > 0.15 && n.i === 1;
                  return (
                    <g
                      key={`n-${n.i}`}
                      opacity={appear}
                      style={{
                        transform: `translate(${(1 - appear) * (CX - n.x) * 0.25}px, ${(1 - appear) * (CY - n.y) * 0.25}px) scale(${0.85 + appear * 0.15})`,
                        transformOrigin: `${n.x}px ${n.y}px`,
                      }}
                    >
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={NODE_R + 7}
                        className="kl-ring"
                        style={{
                          stroke:
                            isSource || isTarget
                              ? "var(--sky)"
                              : undefined,
                        }}
                      />
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={NODE_R}
                        fill="url(#cs-disc)"
                        stroke={
                          isTarget
                            ? "rgba(58,172,204,0.8)"
                            : "rgba(143,192,234,0.24)"
                        }
                      />
                      <text
                        x={n.x}
                        y={n.y - 5}
                        className="kl-label"
                        fontSize={15}
                      >
                        {n.name}
                      </text>
                      <text
                        x={n.x}
                        y={n.y + 14}
                        className="kl-sub"
                        fontSize={8.5}
                      >
                        {n.domain}
                      </text>

                      {/* OKR chip — the target's updates when the play lands */}
                      <text
                        x={n.x}
                        y={n.y + NODE_R + 24}
                        className="kl-sub"
                        fontSize={8.5}
                        style={{
                          fill: isTarget ? "var(--success)" : undefined,
                          opacity: linkIn,
                        }}
                      >
                        {isTarget && n.okrAfter ? n.okrAfter : n.okr}
                      </text>
                    </g>
                  );
                })}

                {/* Kyndred */}
                <g
                  opacity={core}
                  style={{
                    transform: `scale(${0.9 + core * 0.1})`,
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                >
                  <circle
                    cx={CX}
                    cy={CY}
                    r={CORE_R + 10}
                    className="kl-ring kl-ring-core"
                  />
                  <circle
                    cx={CX}
                    cy={CY}
                    r={CORE_R}
                    fill="url(#cs-core)"
                    stroke="rgba(58,172,204,0.45)"
                  />
                  <text x={CX} y={CY - 6} className="kl-label" fontSize={23}>
                    Kyndred
                  </text>
                  <text x={CX} y={CY + 19} className="kl-sub" fontSize={9.5}>
                    shared intelligence
                  </text>
                </g>
              </svg>

              {still && (
                <p
                  className="mt-4 text-center font-mono text-[10px] uppercase"
                  style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
                >
                  motion reduced — showing the complete system
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
