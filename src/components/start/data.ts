import type { CSSProperties } from "react";

export type Track = "startup" | "existing";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type DimensionScore = "Early" | "Developing" | "Strong";

export type Dimension = {
  id: string;
  name: string;
  weight: string;
  score: DimensionScore;
  summary: string;
  offer?: string;
  isGate?: boolean;
};

export const DIMENSIONS: Dimension[] = [
  {
    id: "why-now",
    name: "Why Now",
    weight: "20 pts weighted · currently Early",
    score: "Early",
    summary:
      "You've identified a real enabling condition — carrier API expansion — but the timing thesis needs more depth. The window of opportunity and first-mover dynamics haven't been addressed. It's not clear yet whether competitors have already captured the ready market.",
    offer: "Research this space together with Kyndred",
  },
  {
    id: "competitive",
    name: "Competitive landscape and moat",
    weight: "20 pts weighted · currently Developing",
    score: "Developing",
    summary:
      "Direct competitor awareness is present but the indirect competitive landscape — what customers are doing right now instead — hasn't been mapped. No moat has been articulated beyond first-mover timing, which is fragile on its own.",
    offer: "Build a competitive map together",
  },
  {
    id: "business-model",
    name: "Business model",
    weight: "20 pts weighted · currently Strong",
    score: "Strong",
    summary:
      "SaaS subscription model is well-suited to the customer profile. Unit economics assumptions are internally consistent with comparable logistics SaaS benchmarks. Pricing logic reflects genuine value — the cost of a lost contract is clear and quantified.",
  },
  {
    id: "problem-market",
    name: "Problem and market",
    weight: "20 pts weighted · currently Developing",
    score: "Developing",
    summary:
      "Origin story is compelling and grounded in lived experience. Problem evidence beyond personal experience is thin — customer discovery conversations haven't been documented. Market growth rate and broader evidence of demand hasn't been addressed.",
    offer: "Strengthen problem evidence",
  },
  {
    id: "tam-sam-som",
    name: "TAM / SAM / SOM",
    weight: "20 pts weighted · currently Developing",
    score: "Developing",
    summary:
      "TAM figure ($4.2B) is present but top-down sourced. SAM and SOM haven't been calculated. The SOM needs to be internally consistent with your go-to-market plan and revenue projections.",
    offer: "Build a bottom-up model together",
    isGate: true,
  },
];

export const INTAKE_STEPS = [
  { key: "opening", label: "Opening conversation", status: "complete" },
  { key: "docs", label: "Documents uploaded", status: "complete" },
  { key: "interview", label: "Founder interview", status: "active" },
] as const;

/** Badge colours by dimension score. */
export function scoreStyle(score: DimensionScore): CSSProperties {
  if (score === "Strong")
    return { background: "rgba(58, 172, 204, 0.14)", color: "var(--success)" };
  if (score === "Developing")
    return { background: "rgba(201, 146, 58, 0.14)", color: "var(--amber)" };
  return { background: "rgba(54, 123, 192, 0.14)", color: "var(--primary)" };
}

/* ---- Opening messages ---- */

export const TRACK_PROMPT: ChatMessage = {
  role: "assistant",
  content:
    "First — which of these describes you better? It changes what I ask you next, and how we'll use the time.",
};

export const STARTUP_GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Welcome. I'm Kyndred. Before we begin the interview, I want to get oriented — who you are, what you're building, and the material you've already put together. Share what you have. We'll go from there.",
};

export const EXISTING_GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Welcome. I'm Kyndred. You're here because you have a business that's already running — and you want to figure out where AI and agentic workflows can actually move the needle. To do that well I need to understand where you are today: revenue shape, who you serve, what's already stitched together, and where the friction lives. Let's start there.",
};

/* ---- Founder profile panel ---- */

export const PROFILE = {
  strength:
    "Your business model is well-constructed. The SaaS structure fits the customer profile, your pricing logic is grounded in a quantifiable cost — the lost contract — and your unit economics thinking is consistent with logistics software benchmarks. This is an unusually strong foundation for an early-stage plan and it should be protected as you refine the rest.",
  focus: [
    {
      label: "Timing thesis",
      body: "Your enabling condition is real but the timing argument needs specific evidence — who else is moving, why this window and not two years ago, and whether you're first or late to a ready market.",
    },
    {
      label: "Market sizing",
      body: "Build a bottom-up SOM before your next conversation. Start with the number of mid-market 3PLs in North America, your realistic reach in year one, and what each pays. Make it consistent with your revenue projections.",
    },
  ],
  support: {
    title: "Domain expert, GTM-ready",
    body: "You bring eight years of lived experience in the problem space and a clear commercial instinct. The gap is on the technical product side. You'll need someone who can own the build architecture and carrier API integration strategy without founder involvement in every decision.",
    needs: [
      {
        label: "Technical co-founder",
        bg: "rgba(54, 123, 192, 0.10)",
        border: "var(--border-active)",
        color: "var(--primary)",
      },
      {
        label: "Veita GTM support",
        bg: "rgba(58, 172, 204, 0.10)",
        border: "rgba(58, 172, 204, 0.30)",
        color: "var(--success)",
      },
      {
        label: "Early BD hire",
        bg: "rgba(201, 146, 58, 0.10)",
        border: "rgba(201, 146, 58, 0.30)",
        color: "var(--amber)",
      },
    ],
  },
};
