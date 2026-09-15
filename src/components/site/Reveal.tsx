"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children once, on first entry.
 *
 * Deliberately not a CSS scroll-driven animation: a `view()` timeline is
 * scrubbed rather than one-shot, so content fades back out on the way up and
 * anything below the fold renders blank at scroll 0. Scrubbing is right for the
 * atmosphere layer, not for copy. Timing follows SAGA's MOTION.md — outExpo,
 * duration.medium, an 8px translate cap, and a hierarchy stagger of 80ms.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen, or a reduced-motion preference, skips straight in.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
