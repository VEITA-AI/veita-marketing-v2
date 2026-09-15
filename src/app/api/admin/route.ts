import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

/** Constant-time compare so the endpoint doesn't leak the passcode by timing. */
function matches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const { passcode } = (await request.json()) as { passcode?: string };
  const expected = process.env.ADMIN_PASSCODE;

  if (!expected) {
    return NextResponse.json({
      ok: false,
      error: "Admin access is not configured — set ADMIN_PASSCODE.",
    });
  }

  if (!passcode || !matches(passcode, expected)) {
    return NextResponse.json({ ok: false, error: "Incorrect passcode." });
  }

  // The founder-session dashboard behind this gate needs a datastore that this
  // project doesn't have yet, so a correct passcode currently unlocks nothing.
  return NextResponse.json({
    ok: false,
    error: "Passcode accepted, but the founder dashboard isn't wired up yet.",
  });
}
