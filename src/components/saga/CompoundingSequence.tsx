"use client";

import { useEffect, useRef, useState } from "react";

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
  const core = span(p, 0.0, 0.06);
  const kynIn = span(p, 0.1, 0.34);
  const linkIn = span(p, 0.28, 0.5);
  const meta = span(p, 0.46, 0.7);
  const transfer = span(p, 0.7, 0.96);

  const beat = p < 0.13 ? 0 : p < 0.31 ? 1 : p < 0.49 ? 2 : p < 0.7 ? 3 : 4;
  // Progress *within* the active beat, used to keep the narration moving.
  const bounds = [0, 0.13, 0.31, 0.49, 0.7, 1];
  const within =
    (p - bounds[beat]) / (bounds[beat + 1] - bounds[beat] || 1);

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
    <div ref={trackRef} className="relative h-[340vh] md:h-[460vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Narration */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2">
                {BEATS.map((_, i) => (
                  <span
                    key={i}
                    className="relative h-[2px] flex-1 overflow-hidden rounded-full"
                    style={{ background: "var(--rule-soft)" }}
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

              <div className="relative mt-8 min-h-[300px] md:min-h-[320px]">
                {BEATS.map((b, i) => {
                  const active = i === beat;
                  return (
                    <div
                      key={b.title}
                      className="absolute inset-0"
                      style={{
                        opacity: active ? 1 : 0,
                        // Copy keeps drifting through the beat, so the block is
                        // never completely static between transitions.
                        transform: active
                          ? `translateY(${(1 - within) * 14 - 7}px)`
                          : "translateY(18px)",
                        filter: active ? "none" : "blur(4px)",
                        pointerEvents: active ? undefined : "none",
                        transition:
                          "opacity var(--dur-medium) var(--ease-out-quart), filter var(--dur-medium) var(--ease-out-quart)",
                      }}
                    >
                      <div
                        className="font-mono text-[11px] uppercase"
                        style={{ letterSpacing: "0.22em", color: "var(--ember)" }}
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
                          fontSize: "clamp(1.55rem, 1rem + 1.4vw, 2.3rem)",
                        }}
                      >
                        {b.title}
                      </h3>
                      <p
                        className="mt-5 max-w-[44ch] text-[14.5px] leading-[1.6]"
                        style={{ color: "var(--body-fg)" }}
                      >
                        {b.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="mt-2 font-mono text-[10px] uppercase tabular-nums"
                style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
              >
                {String(beat + 1).padStart(2, "0")} / 0{BEATS.length}
              </div>
            </div>

            {/* Stage */}
            <div className="cs-root lg:col-span-8">
              <svg
                viewBox={camera(p)}
                className="block h-full w-full"
                role="img"
                aria-label="A scroll sequence: Kyndred alone, then four Kyn appearing, connecting to the shared layer, their operating metadata travelling inward, and a play travelling back out to another Kyn."
              >
                <defs>
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
                  <radialGradient id="cs-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3aaccc" stopOpacity="0.5" />
                    <stop offset="55%" stopColor="#367bc0" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#367bc0" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <circle
                  cx={CX}
                  cy={CY}
                  r={CORE_R * 2.6}
                  fill="url(#cs-glow)"
                  className="cs-breath"
                  opacity={0.4 + meta * 0.35 + transfer * 0.25}
                />

                {/* The orbital plane, seen at an angle. */}
                <ellipse
                  cx={CX}
                  cy={CY}
                  rx={ORBIT}
                  ry={ORBIT * TILT}
                  fill="none"
                  stroke="rgba(143,192,234,0.14)"
                  strokeWidth={1}
                  strokeDasharray="2 10"
                  opacity={kynIn * 0.9}
                />

                {/* Far side: drawn before the core, so the core occludes it. */}
                {behind.map((n) => renderSpoke(n))}
                {behind.map((n) => renderNode(n))}

                {/* Kyndred */}
                <g
                  opacity={core}
                  style={{
                    transform: `scale(${0.88 + core * 0.12})`,
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                >
                  <circle
                    cx={CX}
                    cy={CY}
                    r={CORE_R + 10}
                    className="cs-ring cs-ring-core"
                  />
                  <circle
                    cx={CX}
                    cy={CY}
                    r={CORE_R}
                    fill="url(#cs-core)"
                    stroke="rgba(58,172,204,0.45)"
                  />
                  <ellipse
                    cx={CX - CORE_R * 0.3}
                    cy={CY - CORE_R * 0.42}
                    rx={CORE_R * 0.42}
                    ry={CORE_R * 0.26}
                    fill="url(#cs-spec)"
                    opacity={0.55}
                  />
                  <text x={CX} y={CY - 6} className="cs-label" fontSize={23}>
                    Kyndred
                  </text>
                  <text x={CX} y={CY + 19} className="cs-sub" fontSize={9.5}>
                    shared intelligence
                  </text>
                </g>

                {/* Near side: drawn after the core, so it passes in front. */}
                {inFront.map((n) => renderSpoke(n))}
                {inFront.map((n) => renderNode(n))}

                {/* The transfer, with a trail so the packet reads as moving. */}
                {transfer > 0.01 && (
                  <>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={packetIn.x}
                      y2={packetIn.y}
                      stroke="var(--success)"
                      strokeWidth={2}
                      opacity={legIn < 1 ? 0.5 : 0}
                    />
                    <circle
                      r={7}
                      cx={packetIn.x}
                      cy={packetIn.y}
                      fill="var(--success)"
                      opacity={legIn < 1 ? 1 : 0}
                      style={{ filter: "drop-shadow(0 0 10px rgba(58,172,204,1))" }}
                    />
                    <line
                      x1={CX}
                      y1={CY}
                      x2={packetOut.x}
                      y2={packetOut.y}
                      stroke="var(--sky)"
                      strokeWidth={2}
                      opacity={legOut > 0 && legOut < 1 ? 0.55 : 0}
                    />
                    <circle
                      r={7}
                      cx={packetOut.x}
                      cy={packetOut.y}
                      fill="var(--sky)"
                      opacity={legOut > 0 ? 1 : 0}
                      style={{ filter: "drop-shadow(0 0 10px rgba(143,192,234,1))" }}
                    />
                  </>
                )}
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
