"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Link2, Rocket, Upload, X } from "lucide-react";
import {
  EXISTING_GREETING,
  STARTUP_GREETING,
  TRACK_PROMPT,
  type ChatMessage,
  type Track,
} from "./data";
import {
  Bubble,
  ChoiceCard,
  Field,
  FormBlock,
  PrimaryButton,
  SectionLabel,
  TextArea,
  TextInput,
} from "./ui";

type Stage =
  | "track"
  | "identity"
  | "company"
  | "operations"
  | "commercial"
  | "stack"
  | "challenges"
  | "documents";

type BusinessContext = {
  years_operating?: string;
  employees?: string;
  annual_revenue?: string;
  profitability?: string;
  icp?: string;
  pricing_model?: string;
  acv?: string;
  tech_stack: Record<string, string>;
  challenges?: string;
  goals?: string;
};

export type IntakeResult = {
  track: Track;
  name: string;
  email: string;
  company: string;
  oneLiner: string;
  context: BusinessContext;
  documents: string[];
  links: string[];
};

export function GetStarted({
  onComplete,
}: {
  onComplete: (result: IntakeResult) => void;
}) {
  const [stage, setStage] = useState<Stage>("track");
  const [track, setTrack] = useState<Track | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([TRACK_PROMPT]);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [context, setContext] = useState<BusinessContext>({ tech_stack: {} });
  const [linkDraft, setLinkDraft] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, stage, documents, links]);

  function say(user: string, agent: string, next: Stage) {
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: user },
      { role: "assistant", content: agent },
    ]);
    setStage(next);
  }

  function chooseTrack(next: Track) {
    setTrack(next);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content:
          next === "startup"
            ? "Building a startup."
            : "Existing business — want to modernize with AI.",
      },
      next === "existing" ? EXISTING_GREETING : STARTUP_GREETING,
    ]);
    setStage("identity");
  }

  function submitIdentity() {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e) return setError("Need both your name and email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      return setError("That email doesn't look right.");
    say(
      `${n} · ${e}`,
      track === "existing"
        ? `Good to meet you, ${n.split(" ")[0]}. What's the business called, and how would you describe what it does in one line?`
        : `Good to meet you, ${n.split(" ")[0]}. What's the company called, and how would you describe it in one line?`,
      "company"
    );
  }

  function submitCompany() {
    const c = company.trim();
    const o = oneLiner.trim();
    if (!c || !o) return setError("Company name and one-liner please.");
    if (track === "startup") {
      say(
        `${c} — ${o}`,
        "Now share what you've already put together — deck, financials, customer notes, anything material. Then add the links I should look at: website, LinkedIn, data room.",
        "documents"
      );
    } else {
      say(
        `${c} — ${o}`,
        "Let's ground this in the operating picture. How long has the business been running, roughly how many people, what's annual revenue look like, and are you profitable?",
        "operations"
      );
    }
  }

  function submitOperations() {
    if (
      !context.years_operating ||
      !context.employees ||
      !context.annual_revenue
    )
      return setError("Fill in years, headcount, and revenue.");
    say(
      `${context.years_operating} yrs · ${context.employees} people · ${context.annual_revenue} revenue · ${context.profitability ?? "—"}`,
      "Now the commercial shape. Who's your ideal customer, how do you price, and what's a typical annual contract look like?",
      "commercial"
    );
  }

  function submitCommercial() {
    if (!context.icp || !context.pricing_model)
      return setError("ICP and pricing model please.");
    say(
      `ICP: ${context.icp} · ${context.pricing_model}${context.acv ? ` · ACV ${context.acv}` : ""}`,
      "Now the tech surface. What are you running today across sales, marketing, accounting, product/development, and support? List the actual tools — that's what we'll audit for agentic upgrades.",
      "stack"
    );
  }

  function submitStack() {
    const s = context.tech_stack;
    const summary = [
      s.sales && `Sales: ${s.sales}`,
      s.marketing && `Marketing: ${s.marketing}`,
      s.accounting && `Accounting: ${s.accounting}`,
      s.development && `Dev: ${s.development}`,
      s.support && `Support: ${s.support}`,
    ]
      .filter(Boolean)
      .join(" · ");
    say(
      summary || "Stack noted.",
      "Last piece before we look at your material — where does it hurt most today? What's slow, expensive, or manual that keeps coming back? And what would a good outcome from an AI initiative look like for you in the next twelve months?",
      "challenges"
    );
  }

  function submitChallenges() {
    if (!context.challenges || !context.goals)
      return setError("Both fields, please.");
    say(
      `${context.challenges}\n\nGoal: ${context.goals}`,
      "Good. Now share anything already documented — org chart, P&L snapshot, tooling inventory, customer notes, process docs. And any links I should look at: website, LinkedIn, internal wiki.",
      "documents"
    );
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const accepted: string[] = [];
    for (const file of Array.from(list)) {
      if (file.size > 20 * 1024 * 1024) {
        setError(`${file.name} is over 20MB.`);
        continue;
      }
      accepted.push(file.name);
    }
    setDocuments((prev) => [...prev, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addLink() {
    const raw = linkDraft.trim();
    if (!raw) return;
    const candidate = raw.startsWith("http") ? raw : `https://${raw}`;
    try {
      new URL(candidate);
    } catch {
      return setError("That URL doesn't look valid.");
    }
    setLinks((prev) => [...prev, candidate]);
    setLinkDraft("");
    setError(null);
  }

  function finish() {
    if (documents.length === 0 && links.length === 0)
      return setError("Add at least one document or link first.");
    onComplete({
      track: track ?? "startup",
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      oneLiner: oneLiner.trim(),
      context,
      documents,
      links,
    });
  }

  const setCtx = (patch: Partial<BusinessContext>) =>
    setContext((prev) => ({ ...prev, ...patch }));
  const setStack = (key: string, value: string) =>
    setContext((prev) => ({
      ...prev,
      tech_stack: { ...prev.tech_stack, [key]: value },
    }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-8 py-8 max-md:px-5"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {stage === "track" && (
            <div className="mb-2">
              <div
                className="text-[11px] font-mono uppercase tracking-[0.24em]"
                style={{ color: "var(--sky)" }}
              >
                onboarding agent
              </div>
              <h1 className="mt-4 font-display text-[30px] leading-tight">
                A conversation, not an application.
              </h1>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted-fg)]">
                This is a live session with Kyndred. It reads what you share,
                asks what a good operator would ask, and works through your plan
                with you in real time — helping you optimise it before anyone
                forms a judgment. Nothing here is a screening gate.
              </p>
              <div className="hair-rule mt-7" />
            </div>
          )}

          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}

          {stage === "track" && (
            <div className="ml-11 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ChoiceCard
                icon={<Rocket className="h-4 w-4" />}
                title="I'm building a startup"
                body="Pre-launch or early-stage. Looking to pressure-test the plan across why-now, market, moat, model, and TAM."
                onClick={() => chooseTrack("startup")}
              />
              <ChoiceCard
                icon={<Building2 className="h-4 w-4" />}
                title="I have an existing business"
                body="Already operating with real revenue. Want to identify where AI and agentic workflows can optimize the operation."
                onClick={() => chooseTrack("existing")}
              />
            </div>
          )}

          {stage === "identity" && (
            <FormBlock>
              <Field label="Your name">
                <TextInput
                  value={name}
                  onChange={setName}
                  placeholder="Alex Rivera"
                />
              </Field>
              <Field label="Email">
                <TextInput
                  value={email}
                  onChange={setEmail}
                  placeholder="alex@company.com"
                  type="email"
                />
              </Field>
              <PrimaryButton onClick={submitIdentity}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "company" && (
            <FormBlock>
              <Field label={track === "existing" ? "Business" : "Company"}>
                <TextInput
                  value={company}
                  onChange={setCompany}
                  placeholder="Loadlight"
                />
              </Field>
              <Field label="One-line description">
                <TextInput
                  value={oneLiner}
                  onChange={setOneLiner}
                  placeholder={
                    track === "existing"
                      ? "B2B logistics brokerage serving mid-market shippers in the Midwest."
                      : "Real-time shipment visibility for mid-market 3PLs."
                  }
                />
              </Field>
              <PrimaryButton onClick={submitCompany}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "operations" && (
            <FormBlock>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Years operating">
                  <TextInput
                    value={context.years_operating ?? ""}
                    onChange={(v) => setCtx({ years_operating: v })}
                    placeholder="6"
                  />
                </Field>
                <Field label="Employees / FTEs">
                  <TextInput
                    value={context.employees ?? ""}
                    onChange={(v) => setCtx({ employees: v })}
                    placeholder="24"
                  />
                </Field>
                <Field label="Annual revenue">
                  <TextInput
                    value={context.annual_revenue ?? ""}
                    onChange={(v) => setCtx({ annual_revenue: v })}
                    placeholder="$4.5M ARR"
                  />
                </Field>
                <Field label="Profitability">
                  <TextInput
                    value={context.profitability ?? ""}
                    onChange={(v) => setCtx({ profitability: v })}
                    placeholder="Breakeven / 12% net margin"
                  />
                </Field>
              </div>
              <PrimaryButton onClick={submitOperations}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "commercial" && (
            <FormBlock>
              <Field label="Ideal customer (ICP)">
                <TextInput
                  value={context.icp ?? ""}
                  onChange={(v) => setCtx({ icp: v })}
                  placeholder="Mid-market 3PLs, $20–200M revenue, US-based"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pricing model">
                  <TextInput
                    value={context.pricing_model ?? ""}
                    onChange={(v) => setCtx({ pricing_model: v })}
                    placeholder="Annual SaaS + usage"
                  />
                </Field>
                <Field label="Typical ACV">
                  <TextInput
                    value={context.acv ?? ""}
                    onChange={(v) => setCtx({ acv: v })}
                    placeholder="$48k"
                  />
                </Field>
              </div>
              <PrimaryButton onClick={submitCommercial}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "stack" && (
            <FormBlock>
              <SectionLabel>Current tech stack</SectionLabel>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Sales">
                  <TextInput
                    value={context.tech_stack.sales ?? ""}
                    onChange={(v) => setStack("sales", v)}
                    placeholder="HubSpot, Apollo"
                  />
                </Field>
                <Field label="Marketing">
                  <TextInput
                    value={context.tech_stack.marketing ?? ""}
                    onChange={(v) => setStack("marketing", v)}
                    placeholder="Webflow, Customer.io"
                  />
                </Field>
                <Field label="Accounting / Finance">
                  <TextInput
                    value={context.tech_stack.accounting ?? ""}
                    onChange={(v) => setStack("accounting", v)}
                    placeholder="QuickBooks, Ramp"
                  />
                </Field>
                <Field label="Product / Development">
                  <TextInput
                    value={context.tech_stack.development ?? ""}
                    onChange={(v) => setStack("development", v)}
                    placeholder="Linear, GitHub, AWS"
                  />
                </Field>
                <Field label="Customer support">
                  <TextInput
                    value={context.tech_stack.support ?? ""}
                    onChange={(v) => setStack("support", v)}
                    placeholder="Intercom, Zendesk"
                  />
                </Field>
              </div>
              <PrimaryButton onClick={submitStack}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "challenges" && (
            <FormBlock>
              <Field label="Biggest operational challenges today">
                <TextArea
                  value={context.challenges ?? ""}
                  onChange={(v) => setCtx({ challenges: v })}
                  placeholder="Sales ops team spends 15 hrs/week on manual quote generation. Support backlog growing 20% MoM. No unified view of customer health."
                />
              </Field>
              <Field label="What does a good outcome look like in 12 months?">
                <TextArea
                  value={context.goals ?? ""}
                  onChange={(v) => setCtx({ goals: v })}
                  placeholder="Cut manual sales-ops time by 70%, deflect 40% of tier-1 support tickets, keep headcount flat while doubling revenue."
                />
              </Field>
              <PrimaryButton onClick={submitChallenges}>Continue</PrimaryButton>
            </FormBlock>
          )}

          {stage === "documents" && (
            <>
              <FormBlock>
                <SectionLabel>Documents</SectionLabel>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-[var(--border-active)] p-5 text-center transition-colors hover:bg-[rgba(54,123,192,0.04)]"
                >
                  <Upload className="h-4 w-4 text-[var(--muted-fg)]" />
                  <div className="text-[13px] text-[var(--foreground)]">
                    Drop files or click to upload
                  </div>
                  <div className="text-[11.5px] text-[var(--muted-fg)]">
                    {track === "existing"
                      ? "Org chart, P&L, tooling inventory, process docs"
                      : "Deck, financials, customer notes, market research"}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => addFiles(e.target.files)}
                />
                {documents.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {documents.map((doc, i) => (
                      <Row
                        key={`${doc}-${i}`}
                        label={doc}
                        onRemove={() =>
                          setDocuments((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </FormBlock>

              <FormBlock>
                <SectionLabel>Links</SectionLabel>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TextInput
                      value={linkDraft}
                      onChange={setLinkDraft}
                      placeholder="yourcompany.com"
                    />
                  </div>
                  <button
                    onClick={addLink}
                    className="px-4 text-[13px] text-[var(--muted-fg)] transition-colors hover:text-[var(--foreground)]"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>
                {links.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {links.map((link, i) => (
                      <Row
                        key={`${link}-${i}`}
                        label={link}
                        onRemove={() =>
                          setLinks((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                <PrimaryButton onClick={finish}>
                  Begin the interview
                </PrimaryButton>
              </FormBlock>
            </>
          )}

          {error && (
            <div
              className="ml-11 px-4 py-2.5 text-[12.5px]"
              style={{
                background: "rgba(228, 0, 20, 0.08)",
                border: "1px solid rgba(228, 0, 20, 0.28)",
                color: "#ff8a94",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <span className="truncate text-[var(--foreground)]">{label}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="text-[var(--muted-fg)] transition-colors hover:text-[var(--foreground)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
