"use client";

import { useEffect, useState } from "react";

type Entry = { t: string; domain: string; action: string };

/**
 * A depicted morning on Saga. These are illustrations of the kind of work the
 * operating layer moves forward on its own — labelled as a depiction, not
 * presented as a live feed of real customer data.
 */
const RECORD: Entry[] = [
  { t: "09:02", domain: "finance", action: "runway reforecast · 19 mo" },
  { t: "09:04", domain: "pipeline", action: "3 opportunities advanced" },
  { t: "09:11", domain: "sales", action: "winning call pattern rolled to 4 reps" },
  { t: "09:17", domain: "collections", action: "cadence applied · 28 invoices" },
  { t: "09:23", domain: "kyndred", action: "play returned to Kyn 2 · deposit terms" },
  { t: "09:31", domain: "r&d", action: "test plans drafted from 12 tickets" },
  { t: "09:38", domain: "marketing", action: "spend shifted off saturated channel" },
  { t: "09:46", domain: "board", action: "October update drafted for review" },
  { t: "09:52", domain: "finance", action: "close advanced · 2 accounts open" },
  { t: "10:03", domain: "kyndred", action: "signal absorbed from Kyn 4" },
];

const MONO = "font-mono uppercase tracking-[0.16em]";

export function OperatingRecord({
  caption = "Every line is work Saga moved forward without being asked. Kyndred reads all of it, across every Kyn.",
}: {
  caption?: string;
}) {
  const [shown, setShown] = useState(4);

  useEffect(() => {
    if (shown >= RECORD.length) return;
    const id = setTimeout(() => setShown((n) => n + 1), 1000);
    return () => clearTimeout(id);
  }, [shown]);

  return (
    <div className="pl-0 md:border-l md:border-[var(--border)] md:pl-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className={`${MONO} text-[9.5px]`} style={{ color: "var(--muted-fg)" }}>
          a day on saga
        </span>
        <span
          className={`${MONO} shrink-0 text-[9px] tabular-nums`}
          style={{ color: "var(--success)" }}
        >
          09:02 — 10:03
        </span>
      </div>

      <div className="mt-5 flex flex-col">
        {RECORD.slice(0, shown).map((entry, i) => (
          <div
            key={entry.t + entry.action}
            className="grid grid-cols-[42px_92px_1fr] gap-x-3 py-2 font-mono text-[11.5px] leading-relaxed"
            style={{
              borderBottom: "1px solid var(--border)",
              animation:
                i === shown - 1 && shown > 4
                  ? "record-in var(--dur-medium) var(--ease-out-expo), record-flash 1.4s var(--ease-out-quart)"
                  : undefined,
            }}
          >
            <span className="tabular-nums" style={{ color: "var(--success)" }}>
              {entry.t}
            </span>
            <span className="truncate" style={{ color: "var(--sky)" }}>
              {entry.domain}
            </span>
            <span className="text-[var(--muted-fg)]">{entry.action}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-sm text-[11.5px] leading-relaxed text-[var(--muted-fg)]">
        {caption}
      </p>
    </div>
  );
}
