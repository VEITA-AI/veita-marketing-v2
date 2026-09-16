"use client";

import { useMemo, useState } from "react";

type LoopNode = {
  domain: string;
  kr: string;
  internal: string;
  kyndred: string;
};

const NODES: LoopNode[] = [
  {
    domain: "Sales",
    kr: "25% funnel growth",
    internal:
      "The top-of-funnel agent spots that one SDR's calls convert better, reviews the recordings and pre-qualification notes, and rolls the winning approach out to the rest of the team.",
    kyndred:
      "Seeing the 25% target slip, the agent signals Kyndred; shared memory returns a play — cut spend on the weakest channel, double outbound call volume, tighten the email cadence.",
  },
  {
    domain: "Finance",
    kr: "AR over 60 days under 10%",
    internal:
      "The collections agent learns which reminder timing and tone get invoices paid fastest — a call after two ignored emails — and applies that sequence across the aging ledger.",
    kyndred:
      "With DSO drifting past target, the agent signals Kyndred; shared memory returns moves proven in other Kyns — deposit terms for repeat late-payers, calls queued on the top 20 overdue accounts, early-pay discounts on the largest balances.",
  },
  {
    domain: "R&D",
    kr: "Cut spec-to-merge time 30%",
    internal:
      "The engineering agent notices small PRs with a test plan merge far faster, so it nudges the team to split work into smaller diffs and auto-drafts test plans from the ticket.",
    kyndred:
      "As cycle time regresses, the agent signals Kyndred; shared memory returns what worked elsewhere — reuse the common eval harness, adopt the shared CI template, pull a validated prompt pattern from another Kyn.",
  },
  {
    domain: "Marketing",
    kr: "Qualified leads +40%",
    internal:
      "The demand-gen agent sees which offers and landing pages convert best by segment and reallocates budget and creative toward the winning combinations.",
    kyndred:
      "With lead volume trending below target, the agent signals Kyndred; shared memory returns cross-Kyn wins — a messaging angle that lifted conversion, a lookalike audience that performed, a shift out of a saturated channel.",
  },
];

const CORE_BLURB =
  "Each Kyn's learnings feed one shared layer — build playbook, governance patterns, eval harnesses, infrastructure — with governance built in from day one. That layer lifts every Kyn and makes each next one faster to launch.";

const CX = 450;
const CY = 360;
const ORBIT = 250;
const CORE_R = 84;
const NODE_R = 46;

export function KyndredLoop() {
  const [active, setActive] = useState<number | "core" | null>(null);

  const nodes = useMemo(
    () =>
      NODES.map((node, i) => {
        const angle = ((-90 + i * (360 / NODES.length)) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = CX + ORBIT * cos;
        const y = CY + ORBIT * sin;
        const fromX = CX + (CORE_R + 8) * cos;
        const fromY = CY + (CORE_R + 8) * sin;
        const toX = x - (NODE_R + 8) * cos;
        const toY = y - (NODE_R + 8) * sin;
        return { ...node, i, x, y, path: `M ${fromX} ${fromY} L ${toX} ${toY}` };
      }),
    []
  );

  const coreOn = active === "core";
  const anyOn = active !== null;
  const hovered = typeof active === "number" ? nodes[active] : null;

  return (
    <div className="kl-root">
      <div className="relative mx-auto aspect-[900/720] w-full max-w-[760px]">
        <svg
          viewBox="0 0 900 720"
          className={`block h-full w-full overflow-visible ${
            anyOn ? "kl-dim" : ""
          } ${coreOn ? "kl-core-active" : ""}`}
          role="img"
          aria-label="A central Kyndred loop surrounded by orbiting Kyn loops, each connected by a two-way signal exchange."
        >
          <defs>
            {/* Spokes brighten toward the core. Anchored in user space — an
                objectBoundingBox gradient collapses on axis-aligned lines. */}
            <radialGradient
              id="kl-spoke"
              gradientUnits="userSpaceOnUse"
              cx={CX}
              cy={CY}
              r={ORBIT}
            >
              <stop offset="0%" stopColor="#8fc0ea" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#5f9fd6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#367bc0" stopOpacity="0.28" />
            </radialGradient>
            {/* Discs are lit from upper-left so they read as objects, not fills. */}
            <radialGradient id="kl-disc" cx="36%" cy="28%" r="84%">
              <stop offset="0%" stopColor="#1e3a5c" />
              <stop offset="100%" stopColor="#111f36" />
            </radialGradient>
            <radialGradient id="kl-core" cx="38%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#17304f" />
              <stop offset="100%" stopColor="#0a1730" />
            </radialGradient>
            <radialGradient id="kl-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3aaccc" stopOpacity="0.42" />
              <stop offset="55%" stopColor="#367bc0" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#367bc0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="kl-node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8fc0ea" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#8fc0ea" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Core glow, behind everything. */}
          <circle
            cx={CX}
            cy={CY}
            r={CORE_R * 2.4}
            fill="url(#kl-glow)"
            className="kl-core-breath"
          />

          <g>
            {nodes.map((node) => (
              <g
                key={`spoke-${node.i}`}
                className={`kl-spoke ${active === node.i ? "kl-on" : ""}`}
              >
                <path d={node.path} className="kl-track" />
                <circle r="4" cx="0" cy="0" className="kl-dot kl-dot-out">
                  <animateMotion
                    dur="3.4s"
                    repeatCount="indefinite"
                    begin={`${node.i * 0.25}s`}
                    path={node.path}
                  />
                </circle>
                <circle r="4" cx="0" cy="0" className="kl-dot kl-dot-in">
                  <animateMotion
                    dur="3.4s"
                    repeatCount="indefinite"
                    begin={`${0.6 + node.i * 0.25}s`}
                    path={node.path}
                    keyPoints="1;0"
                    keyTimes="0;1"
                    calcMode="linear"
                  />
                </circle>
              </g>
            ))}
          </g>

          <g>
            {nodes.map((node) => (
              <g
                key={`node-${node.i}`}
                className={`kl-node ${active === node.i ? "kl-on" : ""}`}
                style={
                  { "--amp-delay": `${node.i * 0.12}s` } as React.CSSProperties
                }
                tabIndex={0}
                role="button"
                aria-label={`Kyn ${node.i + 1}, ${node.domain}. OKR: ${node.kr}. Internal loop: ${node.internal} Kyndred loop: ${node.kyndred}`}
                onMouseEnter={() => setActive(node.i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(node.i)}
                onBlur={() => setActive(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R * 2}
                  fill="url(#kl-node-glow)"
                  className="kl-halo"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R + 6}
                  className="kl-ring"
                />
                <circle cx={node.x} cy={node.y} r={NODE_R} className="kl-disc" />
                <text x={node.x} y={node.y} className="kl-label" fontSize={15}>
                  {`Kyn ${node.i + 1}`}
                </text>
                <text
                  x={node.x}
                  y={node.y + 19}
                  className="kl-sub"
                  fontSize={8.5}
                >
                  {node.domain}
                </text>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R + 10}
                  fill="transparent"
                />
              </g>
            ))}

            <g
              className={`kl-core ${coreOn ? "kl-on" : ""}`}
              tabIndex={0}
              role="button"
              aria-label={`Kyndred. ${CORE_BLURB}`}
              onMouseEnter={() => setActive("core")}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive("core")}
              onBlur={() => setActive(null)}
            >
              <circle
                cx={CX}
                cy={CY}
                r={CORE_R * 1.7}
                fill="url(#kl-node-glow)"
                className="kl-halo"
              />
              <circle cx={CX} cy={CY} r={CORE_R + 8} className="kl-ring2" />
              <circle
                cx={CX}
                cy={CY}
                r={CORE_R + 2}
                className="kl-ring kl-ring-core"
              />
              <circle
                cx={CX}
                cy={CY}
                r={CORE_R}
                className="kl-disc kl-disc-core"
              />
              <text x={CX} y={CY - 8} className="kl-label" fontSize={22}>
                Kyndred
              </text>
              <text x={CX} y={CY + 21} className="kl-sub" fontSize={9.5}>
                shared intelligence
              </text>
              <circle cx={CX} cy={CY} r={CORE_R + 6} fill="transparent" />
            </g>
          </g>
        </svg>

        {(hovered || coreOn) && (
          <div
            role="status"
            aria-live="polite"
            className="kl-tip pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(340px,86%)] -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 text-left"
          >
            {hovered ? (
              <>
                <div className="text-[13px] font-medium">
                  <span style={{ color: "var(--success)" }}>
                    Kyn {hovered.i + 1}
                  </span>{" "}
                  · {hovered.domain}
                </div>
                <div
                  className="mt-2 inline-block rounded-full px-3 py-1 text-[11px]"
                  style={{
                    background: "rgba(58,172,204,0.14)",
                    color: "var(--success)",
                  }}
                >
                  OKR · {hovered.kr}
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-[var(--tip-fg)]">
                  <span
                    className="mr-1 font-medium"
                    style={{ color: "var(--success)" }}
                  >
                    Internal loop —
                  </span>
                  {hovered.internal}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--tip-fg)]">
                  <span
                    className="mr-1 font-medium"
                    style={{ color: "var(--sky)" }}
                  >
                    Kyndred loop —
                  </span>
                  {hovered.kyndred}
                </p>
              </>
            ) : (
              <>
                <div className="text-[13px] font-medium">Kyndred</div>
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--tip-fg)]">
                  {CORE_BLURB}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 min-h-[22px] max-w-xl px-2 text-center text-[14px] text-[var(--muted-fg)]">
        {hovered ? (
          <>
            <strong className="font-medium text-[var(--foreground)]">
              Kyn {hovered.i + 1} · {hovered.domain}
            </strong>{" "}
            — targeting {hovered.kr}.
          </>
        ) : coreOn ? (
          <>
            <strong className="font-medium text-[var(--foreground)]">
              Kyndred
            </strong>{" "}
            — one shared layer lifting every Kyn at once.
          </>
        ) : (
          <>
            Hover any{" "}
            <strong className="font-medium text-[var(--foreground)]">Kyn</strong>{" "}
            to see its loop — or the centre to see the shared one.
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2.5 text-[13px] text-[var(--muted-fg)] md:text-[12.5px]">
        <span className="inline-flex items-center gap-2">
          <i
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--success)" }}
          />
          Teal travels inward — what a Kyn contributes
        </span>
        <span className="inline-flex items-center gap-2">
          <i
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--sky)" }}
          />
          Sky travels back out — the shared capability it draws down
        </span>
      </div>

      <p className="mx-auto mt-3 max-w-xl text-center text-[13px] italic text-[var(--muted-fg)] md:text-[12.5px]">
        Every Kyn starts with OKRs set at onboarding — its agent proposes, a
        human confirms.
      </p>
    </div>
  );
}
