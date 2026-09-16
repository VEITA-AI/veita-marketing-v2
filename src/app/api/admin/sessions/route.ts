import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  listSessions,
  sessionsEnabled,
  verifyAdminToken,
} from "@/lib/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  if (!sessionsEnabled()) {
    return NextResponse.json({ sessions: [], unconfigured: true });
  }
  try {
    return NextResponse.json({ sessions: await listSessions() });
  } catch (e) {
    console.error("Could not list founder sessions:", e);
    return NextResponse.json(
      { error: "Couldn't reach the session store." },
      { status: 502 }
    );
  }
}
