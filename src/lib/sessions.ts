import "server-only";
import { Storage } from "@google-cloud/storage";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import type { Session, SessionSummary, StoredMessage } from "./session-types";

export type { Session, SessionSummary, StoredMessage } from "./session-types";

/**
 * Where founder conversations are kept.
 *
 * One JSON object per session in a private Cloud Storage bucket, authenticated
 * with the same ADC the agent uses. Object storage rather than a database
 * because the write volume is a handful of sessions, the shape is a document,
 * there is no query surface beyond "list" and "read one", and the whole archive
 * can be downloaded or handed to Saga without an export step.
 *
 * The bucket has uniform bucket-level access and public access prevention
 * enforced — this holds names, emails and business plans.
 */

const BUCKET = process.env.SESSIONS_BUCKET ?? "veita-marketing-sessions";
const PREFIX = "sessions/";

/** Configured only when a project is available; the site works without it. */
export function sessionsEnabled(): boolean {
  return !!(process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT);
}

let cached: Storage | null = null;
function storage(): Storage {
  if (!cached) {
    cached = new Storage({
      projectId:
        process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT,
    });
  }
  return cached;
}

const file = (id: string) => storage().bucket(BUCKET).file(`${PREFIX}${id}.json`);

/** Ids are unguessable: the id alone authorises appending to a session. */
export function newSessionId(): string {
  return randomUUID();
}

export async function createSession(
  input: Omit<Session, "id" | "createdAt" | "updatedAt" | "messages">
): Promise<Session> {
  const now = new Date().toISOString();
  const session: Session = {
    ...input,
    id: newSessionId(),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  await file(session.id).save(JSON.stringify(session, null, 2), {
    contentType: "application/json",
    resumable: false,
  });
  return session;
}

export async function readSession(id: string): Promise<Session | null> {
  try {
    const [buf] = await file(id).download();
    return JSON.parse(buf.toString()) as Session;
  } catch {
    return null;
  }
}

/**
 * Appends turns to a session. Read-modify-write is safe here because a session
 * is a single conversation with one writer, and turns are strictly sequential.
 */
export async function appendMessages(
  id: string,
  messages: StoredMessage[]
): Promise<void> {
  const session = await readSession(id);
  if (!session) return;
  session.messages.push(...messages);
  session.updatedAt = new Date().toISOString();
  await file(id).save(JSON.stringify(session, null, 2), {
    contentType: "application/json",
    resumable: false,
  });
}

export async function listSessions(): Promise<SessionSummary[]> {
  const [files] = await storage().bucket(BUCKET).getFiles({ prefix: PREFIX });
  const sessions = await Promise.all(
    files.map(async (f) => {
      try {
        const [buf] = await f.download();
        const s = JSON.parse(buf.toString()) as Session;
        return {
          id: s.id,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          name: s.name,
          email: s.email,
          company: s.company,
          track: s.track,
          messageCount: s.messages?.length ?? 0,
        };
      } catch {
        return null;
      }
    })
  );
  return sessions
    .filter((s): s is SessionSummary => s !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/* ---- Admin auth -----------------------------------------------------------
 * A signed, expiring token in an httpOnly cookie. The passcode is the HMAC key,
 * so changing it invalidates every existing session. Enough for a gate over an
 * internal dashboard; not a user system.
 * ------------------------------------------------------------------------ */

export const ADMIN_COOKIE = "veita_admin";
export const ADMIN_TTL_SECONDS = 12 * 60 * 60;

const TOKEN_TTL_MS = ADMIN_TTL_SECONDS * 1000;

export function issueAdminToken(passcode: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const sig = createHmac("sha256", passcode).update(String(expires)).digest("hex");
  return `${expires}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode || !token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = createHmac("sha256", passcode)
    .update(expires)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
