"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure that counts up once, on entry.
 *
 * Follows MOTION.md's counter recipe: outExpo so the number visibly settles
 * into its final value, tabular figures so glyph widths don't jitter as digits
 * roll, and a shorter duration for small targets — the full glacial ramp on a
 * number like 2 reads as broken.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function Stat({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }

    const duration = value < 100 ? 480 : 720;
    let frame = 0;
    let start: number | null = null;

    const run = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          observer.disconnect();
          const tick = (ts: number) => {
            if (start === null) start = ts;
            const t = Math.min((ts - start) / duration, 1);
            setShown(Math.round(value * easeOutExpo(t)));
            if (t < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return observer;
    };

    const observer = run();
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ref}>
      <div
        className="font-display tabular-nums"
        style={{
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontSize: "clamp(2.5rem, 1rem + 3vw, 4rem)",
        }}
      >
        {shown}
        <span style={{ color: "var(--ember)" }}>{suffix}</span>
      </div>
      <div
        className="mt-4 font-mono text-[11px] uppercase md:text-[10px]"
        style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
      >
        {label}
      </div>
    </div>
  );
}
