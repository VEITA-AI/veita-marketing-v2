"use client";

import { useCallback, useState } from "react";
import { AppHeader, Sidebar, type Panel } from "@/components/start/Shell";
import { GetStarted, type IntakeResult } from "@/components/start/GetStarted";
import { Interview } from "@/components/start/Interview";
import {
  Dimensions,
  FounderProfile,
  TeamNudge,
} from "@/components/start/Panels";

const PHASE_LABELS: Record<Panel, string> = {
  "get-started": "getting started",
  interview: "founder interview",
  dimensions: "dimension scores",
  profile: "founder profile",
};

const PANEL_INDEX: Record<Panel, number> = {
  "get-started": 0,
  interview: 1,
  dimensions: 2,
  profile: 3,
};

export default function StartPage() {
  const [intake, setIntake] = useState<IntakeResult | null>(null);
  const [panel, setPanel] = useState<Panel>("get-started");
  const [userTurns, setUserTurns] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  const showNudge = userTurns >= 3 && !nudgeDismissed;

  const tabs: { key: Panel; label: string; disabled: boolean }[] = [
    { key: "get-started", label: "Get Started", disabled: false },
    { key: "interview", label: "Interview", disabled: !intake },
    { key: "dimensions", label: "Dimension Scores", disabled: !intake },
  ];

  function navigate(next: Panel) {
    if (next !== "get-started" && !intake) {
      setBlocked("Complete Get Started first.");
      return;
    }
    setBlocked(null);
    setPanel(next);
  }

  function completeIntake(result: IntakeResult) {
    setIntake(result);
    setPanel("interview");
  }

  const trackUserTurns = useCallback((count: number) => setUserTurns(count), []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <AppHeader phase={PHASE_LABELS[panel]} activeIndex={PANEL_INDEX[panel]} />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          active={panel === "get-started" ? "interview" : panel}
          onNavigate={navigate}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-end border-b border-[var(--border)] px-8 max-md:px-5">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const isActive = panel === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => !tab.disabled && navigate(tab.key)}
                    className="-mb-px px-4 py-2.5 text-[13px] transition-colors"
                    style={{
                      color: isActive
                        ? "var(--foreground)"
                        : tab.disabled
                          ? "rgba(107,126,143,0.5)"
                          : "var(--muted-fg)",
                      fontWeight: isActive ? 500 : 400,
                      borderBottom: isActive
                        ? "2px solid var(--primary)"
                        : "2px solid transparent",
                      cursor: tab.disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {blocked && (
              <span className="ml-auto pb-3 text-[11.5px] text-[var(--muted-fg)]">
                {blocked}
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1">
            {panel === "get-started" && (
              <GetStarted onComplete={completeIntake} />
            )}
            {panel === "interview" && intake && (
              <Interview intake={intake} onUserMessageCount={trackUserTurns} />
            )}
            {panel === "dimensions" && <Dimensions />}
            {panel === "profile" && <FounderProfile />}
          </div>
        </main>
      </div>

      {showNudge && (
        <TeamNudge
          onAccept={() => setNudgeDismissed(true)}
          onDismiss={() => setNudgeDismissed(true)}
        />
      )}
    </div>
  );
}
