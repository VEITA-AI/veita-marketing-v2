import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, readSession, verifyAdminToken } from "@/lib/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  const { id } = await params;
  const session = await readSession(id);
  if (!session) {
    return NextResponse.json({ error: "No such session." }, { status: 404 });
  }
  return NextResponse.json({ session });
}
