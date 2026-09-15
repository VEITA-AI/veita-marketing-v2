export type NavItem = { href: string; label: string };

/** Primary section navigation, in the order it appears in the header. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/studio", label: "Studio" },
  { href: "/kyndred", label: "Kyndred" },
  { href: "/kyn", label: "Kyn" },
  { href: "/saga", label: "Saga" },
  { href: "/origin", label: "Origin" },
  { href: "/transform", label: "Transform" },
];

export const CTA_LABEL = "Start a conversation";
export const CTA_HREF = "/start";

/** Used beneath every closing CTA headline. */
export const AGENT_BLURB =
  "It's a live conversation with our onboarding agent — collaborative, in real time. Not a form, and not a screening gate.";

export const FOOTER_BLURB =
  "One system, two doors. Origin for what's being built. Transform for what already runs.";
