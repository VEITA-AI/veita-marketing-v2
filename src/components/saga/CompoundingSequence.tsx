"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Headline } from "@/components/site/Sections";
import { CtaButton } from "@/components/site/CtaButton";

/** Client-only and lazily loaded — three.js must not sit in the initial bundle. */
const KyndredScene = dynamic(() => import("./scene/KyndredScene"), {
  ssr: false,
  loading: () => null,
});

/**
 * The compounding loop, told as a continuous scroll sequence.
 *
 * Two motion systems run at once, which is what keeps it from reading as a
 * slideshow:
 *
 *   - Ambient. CSS and SMIL animations that never stop — the orbit turns, the
 *     core breathes, signal keeps moving down every connected spoke. These are
 *     independent of scroll position, so the system is always alive even when
 *     the reader is still.
 *   - Narrative. Scroll drives a camera (an interpolated viewBox), the build-up
 *     of each element, and the metadata transfer at the end. Beat windows
 *     deliberately overlap so nothing snaps between states.
 *
 * Scroll-driven rather than `animation-timeline` because it must scrub
 * deterministically everywhere; Firefox still gates that behind a flag.
 */

const CX = 500;
const CY = 360;
const ORBIT = 300;
const CORE_R = 86;
const NODE_R = 52;

/**
 * The orbit is a circle seen at an angle, not a flat ring. TILT squashes it
 * vertically; depth is taken from the sine of the orbital angle, and used for
 * scale, opacity and draw order. That perspective — plus occlusion behind the
 * core — is what gives the scene volume without a 3D renderer.
 */
const TILT = 0.56;
const DEPTH_SCALE = 0.26;

type Kyn = { name: string; domain: string; okr: string; okrAfter?: string };

const KYNS: Kyn[] = [
  { name: "Kyn 1", domain: "Sales", okr: "Funnel +25%" },
  {
    name: "Kyn 2",
    domain: "Finance",
    okr: "AR >60d under 10%",
    okrAfter: "+ play · call after 2 ignored emails",
  },
  { name: "Kyn 3", domain: "R&D", okr: "Spec-to-merge −30%" },
  { name: "Kyn 4", domain: "Marketing", okr: "Qualified leads +40%" },
];

const BEATS = [
  {
    label: "the shared layer",
    title: "One model, trained on what actually happened.",
    body: "Kyndred learns from the operating record of every company Veita builds — the decisions, the outcomes, the financials. Not scraped text about business. Business.",
  },
  {
    label: "four companies",
    title: "Four companies. Four different problems.",
    body: "Sales chasing a funnel. Finance chasing invoices. R&D chasing cycle time. Marketing chasing qualified leads. Each with its own OKRs, set at onboarding.",
  },
  {
    label: "one architecture",
    title: "They all run on the same layer.",
    body: "This is what makes them Kyn rather than a portfolio. One operating layer, one shared model, every company wired into both from day one.",
  },
  {
    label: "the metadata",
    title: "Every action leaves metadata.",
    body: "Not the customer's data — the shape of the work. Which cadence closed the invoice. How many touches it took. What the agent tried before it worked. That metadata is the training signal.",
  },
  {
    label: "the transfer",
    title: "Finance starts the quarter with Sales' answer.",
    body: "Sales learns that a call after two ignored emails gets invoices paid. Kyndred abstracts the pattern out of the metadata and hands it to Finance as a play — before Finance ever hits the problem.",
  },
  {
    label: "what compounds",
    title: "Now run that in every direction, forever.",
    body: "Every Kyn is both a source and a beneficiary, continuously. The portfolio doesn't just grow — it gets cheaper and faster to build into. That advantage compounds in one direction, and it isn't easily copied.",
    closer: true,
  },
];

/** Smoothstep — eases both ends so nothing starts or stops abruptly. */
const ease = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
};
const span = (p: number, from: number, to: number) =>
  ease((p - from) / (to - from));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Camera keyframes. Starts tight on Kyndred, pulls back as the system builds,
 * then pushes in on the Sales → Finance axis for the transfer.
 */
const CAMERA: { at: number; box: [number, number, number, number] }[] = [
  { at: 0.0, box: [352, 212, 296, 296] },
  { at: 0.3, box: [10, 10, 980, 700] },
  { at: 0.62, box: [60, 44, 880, 632] },
  { at: 0.86, box: [80, 20, 850, 690] },
  { at: 1.0, box: [60, 8, 890, 706] },
];

function camera(p: number): string {
  let a = CAMERA[0];
  let b = CAMERA[CAMERA.length - 1];
  for (let i = 0; i < CAMERA.length - 1; i++) {
    if (p >= CAMERA[i].at && p <= CAMERA[i + 1].at) {
      a = CAMERA[i];
      b = CAMERA[i + 1];
      break;
    }
  }
  const t = ease((p - a.at) / (b.at - a.at || 1));
  return a.box.map((v, i) => lerp(v, b.box[i], t).toFixed(1)).join(" ");
}

export function CompoundingSequence() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    // Only mount the 3D scene where it can actually run, and never when the
    // reader has asked for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const c = document.createElement("canvas");
      const ok = !!(
        c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl")
      );
      setWebgl(ok);
    } catch {
      setWebgl(false);
    }
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setP(1);
      return;
    }
    let frame = 0;
    let raf = 0;
    const target = { v: 0 };
    let current = 0;

    const measure = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      target.v =
        scrollable <= 0
          ? 1
          : Math.min(Math.max(-rect.top / scrollable, 0), 1);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Critically-damped follow, framerate independent. Without this the scene
    // steps with the wheel and each beat ends on a cut rather than a settle.
    const tick = () => {
      raf = 0;
      const diff = target.v - current;
      if (Math.abs(diff) < 0.00025) {
        current = target.v;
        setP(current);
        return;
      }
      current += diff * 0.12;
      setP(current);
      raf = requestAnimationFrame(tick);
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
      cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll turns the orbit slowly, so nodes swing through depth as you read.
  const spin = lerp(-26, 34, p);

  const nodes = KYNS.map((k, i) => {
    const angle = ((-110 + i * 90 + spin) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = CX + ORBIT * cos;
    const y = CY + ORBIT * sin * TILT;
    // +1 nearest the viewer, -1 furthest behind the core.
    const depth = sin;
    const scale = 1 + depth * DEPTH_SCALE;
    const r = NODE_R * scale;
    // Spoke endpoints follow the projected positions, not the circle.
    const dx = x - CX;
    const dy = y - CY;
    const len = Math.hypot(dx, dy) || 1;
    return {
      ...k,
      i,
      x,
      y,
      depth,
      scale,
      r,
      fromX: CX + (dx / len) * (CORE_R + 8),
      fromY: CY + (dy / len) * (CORE_R + 8),
      toX: x - (dx / len) * (r + 8),
      toY: y - (dy / len) * (r + 8),
    };
  });

  // Far side draws before the core, near side after — that is the occlusion.
  const behind = nodes.filter((n) => n.depth < 0).sort((a, b) => a.depth - b.depth);
  const inFront = nodes.filter((n) => n.depth >= 0).sort((a, b) => a.depth - b.depth);

  // Overlapping windows — each begins before the last has settled.
  // Bounds are [0, .1, .26, .42, .58, .8, 1]. Each window lands before its
  // beat ends, leaving a beat of stillness to read in.
  const core = span(p, 0.0, 0.06);
  const kynIn = span(p, 0.085, 0.225);
  const linkIn = span(p, 0.245, 0.375);
  const meta = span(p, 0.405, 0.535);
  const transfer = span(p, 0.565, 0.745);
  const payoff = span(p, 0.785, 0.965);

  const bounds = [0, 0.1, 0.26, 0.42, 0.58, 0.8, 1];
  const beat = Math.min(
    Math.max(
      bounds.findIndex((_, i) => i < BEATS.length && p < bounds[i + 1]),
      0
    ),
    BEATS.length - 1
  );
  // Progress *within* the active beat, used to keep the narration moving.
  const within = Math.min(
    Math.max((p - bounds[beat]) / (bounds[beat + 1] - bounds[beat] || 1), 0),
    1
  );

  const source = nodes[0];
  const target = nodes[1];
  const legIn = Math.min(transfer / 0.44, 1);
  const legOut = Math.max((transfer - 0.5) / 0.5, 0);
  const packetIn = {
    x: lerp(source.x, CX, ease(legIn)),
    y: lerp(source.y, CY, ease(legIn)),
  };
  const packetOut = {
    x: lerp(CX, target.x, ease(legOut)),
    y: lerp(CY, target.y, ease(legOut)),
  };
  // The whole assembly turns slowly with scroll, on top of the ambient spin.
  const turn = lerp(-8, 6, p);


  type Projected = (typeof nodes)[number];

  /** Depth fades and thins the far side; the near side reads solid. */
  const depthAlpha = (d: number) => 0.62 + ((d + 1) / 2) * 0.38;

  const renderSpoke = (n: Projected) => {
    const len = Math.hypot(n.toX - n.fromX, n.toY - n.fromY);
    const on = ease(Math.min(Math.max(linkIn * 1.5 - n.i * 0.1, 0), 1));
    if (on <= 0.001) return null;
    return (
      <g key={`s-${n.i}`} opacity={on * depthAlpha(n.depth)}>
        <line
          x1={n.fromX}
          y1={n.fromY}
          x2={n.toX}
          y2={n.toY}
          stroke="url(#cs-spoke)"
          strokeWidth={1.4 + (n.depth + 1) * 0.45}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - on)}
        />
        {on > 0.9 && (
          <>
            <circle r={3.2 + (n.depth + 1) * 0.9} fill="var(--success)" opacity={0.55 + meta * 0.45}>
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                begin={`${n.i * 0.4}s`}
                path={`M ${n.toX} ${n.toY} L ${n.fromX} ${n.fromY}`}
              />
            </circle>
            <circle r={2.6 + (n.depth + 1) * 0.7} fill="var(--sky)" opacity={0.4 + transfer * 0.5}>
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                begin={`${1.6 + n.i * 0.4}s`}
                path={`M ${n.fromX} ${n.fromY} L ${n.toX} ${n.toY}`}
              />
            </circle>
          </>
        )}
      </g>
    );
  };

  const renderNode = (n: Projected) => {
    const appear = ease(Math.min(Math.max(kynIn * 1.5 - n.i * 0.16, 0), 1));
    if (appear <= 0.001) return null;
    const isSource = transfer > 0.02 && n.i === 0;
    const isTarget = legOut > 0.2 && n.i === 1;
    return (
      <g key={`n-${n.i}`} opacity={appear * depthAlpha(n.depth)}>
        <circle cx={n.x} cy={n.y} r={n.r + 7} className="cs-ring"
          style={{ stroke: isSource || isTarget ? "var(--sky)" : undefined }} />
        <circle
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="url(#cs-disc)"
          stroke={isTarget ? "rgba(58,172,204,0.85)" : "rgba(143,192,234,0.24)"}
        />
        {/* Specular highlight — the cue that reads as a sphere, not a disc. */}
        <ellipse
          cx={n.x - n.r * 0.3}
          cy={n.y - n.r * 0.4}
          rx={n.r * 0.44}
          ry={n.r * 0.28}
          fill="url(#cs-spec)"
          opacity={0.5}
        />
        <text x={n.x} y={n.y - 4} className="cs-label" fontSize={14 * n.scale}>
          {n.name}
        </text>
        <text x={n.x} y={n.y + 13 * n.scale} className="cs-sub" fontSize={8 * n.scale}>
          {n.domain}
        </text>
        <text
          x={n.x}
          y={n.y + n.r + 22}
          className="cs-sub"
          fontSize={8.5}
          style={{ fill: isTarget ? "var(--success)" : undefined, opacity: linkIn }}
        >
          {isTarget && n.okrAfter ? n.okrAfter : n.okr}
        </text>
      </g>
    );
  };

  return (
    <div ref={trackRef} className="relative h-[400vh] md:h-[560vh]">
      {/* The scene fills the viewport and the story sits inside it. Boxed into
          a column it read as a video playing beside the text; full-bleed it
          reads as a space you are moving through. */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{
          // Hand off to the next section rather than being yanked out of frame.
          opacity: 1 - ease((p - 0.965) / 0.035),
          transition: "opacity 120ms linear",
        }}
      >
        <div className="cs-root absolute inset-0">
          {webgl ? (
            <KyndredScene
              progress={p}
              core={core}
              kynIn={kynIn}
              linkIn={linkIn}
              meta={meta}
              transfer={transfer}
              payoff={payoff}
              compact={compact}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <svg
                viewBox="0 0 1000 720"
                className="block h-full w-full max-w-[860px]"
                role="img"
                aria-label="Kyndred at the centre with four Kyn connected to it, operating metadata travelling inward and a play travelling back out."
              >
                <defs>
                  <radialGradient id="cs-disc" cx="36%" cy="28%" r="84%">
                    <stop offset="0%" stopColor="#1e3a5c" />
                    <stop offset="100%" stopColor="#111f36" />
                  </radialGradient>
                  <radialGradient id="cs-core" cx="38%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#17304f" />
                    <stop offset="100%" stopColor="#0a1730" />
                  </radialGradient>
                  <radialGradient id="cs-spec" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#bcd8f2" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#bcd8f2" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient
                    id="cs-spoke"
                    gradientUnits="userSpaceOnUse"
                    cx={CX}
                    cy={CY}
                    r={ORBIT}
                  >
                    <stop offset="0%" stopColor="#8fc0ea" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#5f9fd6" stopOpacity="0.6" />
                  </radialGradient>
                </defs>
                {behind.map((n) => renderSpoke(n))}
                {behind.map((n) => renderNode(n))}
                <g opacity={core}>
                  <circle
                    cx={CX}
                    cy={CY}
                    r={CORE_R}
                    fill="url(#cs-core)"
                    stroke="rgba(58,172,204,0.45)"
                  />
                  <text x={CX} y={CY - 6} className="cs-label" fontSize={23}>
                    Kyndred
                  </text>
                  <text x={CX} y={CY + 19} className="cs-sub" fontSize={9.5}>
                    shared intelligence
                  </text>
                </g>
                {inFront.map((n) => renderSpoke(n))}
                {inFront.map((n) => renderNode(n))}
              </svg>
            </div>
          )}
        </div>

        {/* Scrims: keep type legible over the scene without boxing it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              compact
                ? "linear-gradient(180deg, var(--background) 0%, rgba(15,25,33,0.94) 46%, rgba(15,25,33,0.82) 68%, rgba(15,25,33,0.9) 100%)"
                : "linear-gradient(97deg, var(--background) 0%, var(--background) 22%, rgba(15,25,33,0.9) 38%, rgba(15,25,33,0.5) 52%, transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(15,25,33,0.88) 62%, var(--background))",
          }}
        />

        {/* The story, inside the space rather than beside it */}
        <div className="relative flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
            <div className="max-w-[46ch] pb-44 md:pb-36">
              <div className="flex items-center gap-1.5">
                {BEATS.map((_, i) => (
                  <span
                    key={i}
                    className="relative h-[2px] overflow-hidden rounded-full"
                    style={{
                      flex: i === beat ? 2.2 : 1,
                      background: "var(--rule-soft)",
                      transition: "flex var(--dur-medium) var(--ease-out-quart)",
                    }}
                  >
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{
                        width:
                          i < beat ? "100%" : i === beat ? `${within * 100}%` : "0%",
                        background: "var(--ember)",
                      }}
                    />
                  </span>
                ))}
              </div>

              <div className="relative mt-8 min-h-[320px] md:min-h-[340px]">
                {BEATS.map((b, i) => {
                  const active = i === beat;
                  return (
                    <div
                      key={b.title}
                      className="absolute inset-0"
                      style={{
                        opacity: active ? 1 : 0,
                        transform: active
                          ? `translateY(${(1 - within) * 12 - 6}px)`
                          : "translateY(20px)",
                        filter: active ? "none" : "blur(5px)",
                        pointerEvents: active ? undefined : "none",
                        transition:
                          "opacity var(--dur-medium) var(--ease-out-quart), filter var(--dur-medium) var(--ease-out-quart)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="font-display tabular-nums"
                          style={{
                            fontSize: 34,
                            fontWeight: 500,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            color: "var(--ember)",
                            opacity: 0.32,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="h-px flex-1"
                          style={{
                            background: "var(--rule-strong)",
                            transform: `scaleX(${active ? 0.35 + within * 0.65 : 0})`,
                            transformOrigin: "left",
                            transition:
                              "transform var(--dur-slow) var(--ease-out-expo)",
                          }}
                        />
                        <span
                          className="font-mono text-[10px] uppercase"
                          style={{ letterSpacing: "0.22em", color: "var(--ember)" }}
                        >
                          {b.label}
                        </span>
                      </div>

                      <h3
                        className="mt-7 font-display"
                        style={{
                          fontWeight: 500,
                          letterSpacing: "-0.035em",
                          lineHeight: 1.1,
                          fontSize: "clamp(1.6rem, 1rem + 1.6vw, 2.5rem)",
                        }}
                      >
                        {active ? <Headline text={b.title} /> : b.title}
                      </h3>
                      <p
                        className="mt-5 text-[15px] leading-[1.6]"
                        style={{ color: "var(--body-fg)" }}
                      >
                        {b.body}
                      </p>

                      {b.closer && (
                        <div
                          className="mt-8"
                          style={{
                            opacity: within,
                            transform: `translateY(${(1 - within) * 10}px)`,
                          }}
                        >
                          <CtaButton label="See it on your own plan" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* The four Kyn, read across the foot of the space */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ opacity: kynIn }}
        >
          <div className="mx-auto w-full max-w-[1240px] px-6 pb-24 md:px-10 md:pb-8">
            <div
              className="mb-3 flex items-baseline justify-between gap-4 font-mono text-[9.5px] uppercase"
              style={{ letterSpacing: "0.2em", color: "var(--muted-fg)" }}
            >
              <span>
                <span style={{ opacity: 0.55 }}>§ </span>the four kyn · live okrs
              </span>
              <span
                style={{
                  color: payoff > 0.15 ? "var(--success)" : "var(--muted-fg)",
                  transition: "color var(--dur-base) var(--ease-out-quart)",
                }}
              >
                {payoff > 0.15
                  ? "all drawing down"
                  : transfer > 0.15
                    ? "1 play in flight"
                    : meta > 0.1
                      ? "contributing metadata"
                      : "connected"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              {KYNS.map((k, i) => {
                const row = ease(Math.min(Math.max(kynIn * 1.5 - i * 0.16, 0), 1));
                const isSource = transfer > 0.08 && i === 0;
                const isTarget = legOut > 0.2 && i === 1;
                const lit = isTarget || payoff > 0.15;
                return (
                  <div
                    key={k.name}
                    className="flex items-baseline gap-2.5 pt-3"
                    style={{
                      opacity: row,
                      transform: `translateY(${(1 - row) * 8}px)`,
                      borderTop: `1px solid ${
                        lit
                          ? "var(--success)"
                          : isSource
                            ? "var(--sky)"
                            : "var(--rule-soft)"
                      }`,
                      transition:
                        "border-color var(--dur-base) var(--ease-out-quart)",
                    }}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isSource || lit ? "pulse-dot" : ""
                      }`}
                      style={{
                        background: lit ? "var(--success)" : "var(--sky)",
                        opacity: lit || isSource ? 1 : 0.45,
                      }}
                    />
                    <div className="min-w-0">
                      <div
                        className="font-mono text-[9.5px] uppercase"
                        style={{ letterSpacing: "0.16em", color: "var(--muted-fg)" }}
                      >
                        {k.name} · {k.domain}
                      </div>
                      <div
                        className="mt-1.5 text-[12px] leading-snug"
                        style={{
                          color: lit ? "var(--success)" : "var(--body-fg)",
                          transition: "color var(--dur-base) var(--ease-out-quart)",
                        }}
                      >
                        {isTarget && k.okrAfter
                          ? k.okrAfter
                          : payoff > 0.15
                            ? `${k.okr} · play applied`
                            : k.okr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
