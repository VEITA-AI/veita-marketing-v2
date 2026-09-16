import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  ADMIN_COOKIE,
  ADMIN_TTL_SECONDS,
  issueAdminToken,
} from "@/lib/sessions";

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

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, issueAdminToken(expected), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_TTL_SECONDS,
  });
  return response;
}

/** Signs out by dropping the cookie. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
