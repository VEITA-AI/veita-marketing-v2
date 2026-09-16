import { NextResponse } from "next/server";
import { createSession, sessionsEnabled } from "@/lib/sessions";

export const runtime = "nodejs";

/**
 * Opens a founder session when intake completes.
 *
 * Returns an id the client then passes to /api/chat so each turn is appended to
 * the same record. Persistence is optional: with no bucket configured the route
 * returns `{ id: null }` and the conversation simply runs without being kept,
 * rather than blocking the founder.
 */
export async function POST(request: Request) {
  if (!sessionsEnabled()) return NextResponse.json({ id: null });

  const body = (await request.json()) as {
    track?: string;
    name?: string;
    email?: string;
    company?: string;
    oneLiner?: string;
    context?: Record<string, unknown>;
    documents?: string[];
    links?: string[];
  };

  try {
    const session = await createSession({
      track: body.track ?? "",
      name: body.name ?? "",
      email: body.email ?? "",
      company: body.company ?? "",
      oneLiner: body.oneLiner ?? "",
      context: body.context ?? {},
      documents: body.documents ?? [],
      links: body.links ?? [],
    });
    return NextResponse.json({ id: session.id });
  } catch (e) {
    // A storage outage must not cost the founder their interview.
    console.error("Could not open a founder session:", e);
    return NextResponse.json({ id: null });
  }
}
