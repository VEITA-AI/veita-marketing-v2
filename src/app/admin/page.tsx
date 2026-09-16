"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VeitaLogo } from "@/components/site/VeitaLogo";
import type { Session, SessionSummary } from "@/lib/session-types";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  return authed ? (
    <Dashboard onSignOut={() => setAuthed(false)} />
  ) : (
    <Gate onEnter={() => setAuthed(true)} />
  );
}

/* -------------------------------------------------------------------------- */

function Gate({ onEnter }: { onEnter: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A live cookie means there is no need to ask again this shift.
  useEffect(() => {
    fetch("/api/admin/sessions")
      .then((r) => r.ok && onEnter())
      .catch(() => {});
  }, [onEnter]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const { ok, error: message } = await res.json();
      if (ok) onEnter();
      else setError(message ?? "Incorrect passcode.");
    } catch {
      setError("Couldn't verify passcode.");
    } finally {
      setChecking(false);
      setPasscode("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-7"
        style={{
          background: "var(--surface)",
          borderLeft: "2px solid var(--ember)",
        }}
      >
        <VeitaLogo size={19} />
        <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]">
          Admin access
        </div>
        <p className="mt-2 text-[12.5px] text-[var(--muted-fg)]">
          Enter the admin passcode to view founder sessions.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          autoComplete="current-password"
          className="mt-5 h-10 w-full border border-[var(--border)] bg-transparent px-3 text-[13px] outline-none focus:border-[var(--border-active)]"
        />
        <button
          type="submit"
          disabled={checking}
          className="mt-4 h-10 w-full font-mono text-[10.5px] uppercase tracking-[0.16em] disabled:opacity-60"
          style={{ background: "var(--ember)", color: "var(--navy-deep)" }}
        >
          {checking ? "Checking…" : "Enter"}
        </button>
        {error && (
          <p className="mt-3 text-[12px]" style={{ color: "#ff8a94" }}>
            {error}
          </p>
        )}
        <Link
          href="/"
          className="mt-5 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
        >
          ← Back to site
        </Link>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.status === 401) return onSignOut();
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSessions(data.sessions);
    } catch {
      setError("Couldn't load sessions.");
    }
  }, [onSignOut]);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await fetch("/api/admin", { method: "DELETE" }).catch(() => {});
    onSignOut();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[var(--border)] px-6 py-4 md:px-10">
        <VeitaLogo size={18} />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted-fg)]">
          Founder sessions
        </span>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={load}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
          >
            Refresh
          </button>
          <button
            onClick={signOut}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] px-6 py-10 md:px-10">
        {error && (
          <p className="text-[13px]" style={{ color: "#ff8a94" }}>
            {error}
          </p>
        )}
        {!error && sessions === null && (
          <p className="text-[13px] text-[var(--muted-fg)]">Loading…</p>
        )}
        {!error && sessions?.length === 0 && (
          <p className="text-[13px] text-[var(--muted-fg)]">
            No founder sessions yet. One is recorded the moment somebody
            finishes intake at{" "}
            <Link href="/start" className="underline">
              /start
            </Link>
            .
          </p>
        )}
        {sessions && sessions.length > 0 && (
          <SessionTable sessions={sessions} onOpen={setSelected} />
        )}
      </div>

      {selected && (
        <Transcript id={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function SessionTable({
  sessions,
  onOpen,
}: {
  sessions: SessionSummary[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--rule-strong)]">
            {["Founder", "Company", "Track", "Turns", "Last activity"].map(
              (h) => (
                <th
                  key={h}
                  className="py-3 pr-6 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-[var(--muted-fg)]"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="cursor-pointer border-b border-[var(--rule-soft)] transition-colors hover:bg-[var(--surface)]"
            >
              <td className="py-3.5 pr-6 text-[13.5px]">
                {s.name || "—"}
                <div className="text-[11.5px] text-[var(--muted-fg)]">
                  {s.email}
                </div>
              </td>
              <td className="py-3.5 pr-6 text-[13.5px]">{s.company || "—"}</td>
              <td className="py-3.5 pr-6 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-fg)]">
                {s.track === "existing" ? "Transform" : "Origin"}
              </td>
              <td className="py-3.5 pr-6 font-mono text-[12px]">
                {s.messageCount}
              </td>
              <td className="py-3.5 pr-6 font-mono text-[11.5px] text-[var(--muted-fg)]">
                {new Date(s.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Transcript({ id, onClose }: { id: string; onClose: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/sessions/${id}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setSession(d.session)))
      .catch(() => setError("Couldn't load that session."));
  }, [id]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[rgba(6,12,18,0.72)]"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[720px] flex-col overflow-y-auto border-l border-[var(--border)] bg-background"
      >
        <div className="sticky top-0 flex items-center gap-4 border-b border-[var(--border)] bg-background px-6 py-4 md:px-8">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted-fg)]">
            Transcript
          </span>
          <button
            onClick={onClose}
            className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-7 md:px-8">
          {error && <p style={{ color: "#ff8a94" }}>{error}</p>}
          {!error && !session && (
            <p className="text-[13px] text-[var(--muted-fg)]">Loading…</p>
          )}
          {session && (
            <>
              <h2 className="text-[22px] leading-tight">
                {session.name || "Unnamed founder"}
              </h2>
              <p className="mt-1 text-[13px] text-[var(--muted-fg)]">
                {[session.company, session.email].filter(Boolean).join(" · ")}
              </p>
              {session.oneLiner && (
                <p className="mt-4 text-[14px] text-[var(--body-fg)]">
                  {session.oneLiner}
                </p>
              )}

              <Facts session={session} />

              <div className="mt-8 flex flex-col gap-5 border-t border-[var(--rule-soft)] pt-7">
                {session.messages.length === 0 && (
                  <p className="text-[13px] text-[var(--muted-fg)]">
                    No messages recorded.
                  </p>
                )}
                {session.messages.map((m, i) => (
                  <div key={i}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-fg)]">
                      {m.role === "user" ? session.name || "Founder" : "Kyndred"}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--body-fg)]">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/** Flattens the intake answers into a plain label/value list. */
function Facts({ session }: { session: Session }) {
  const rows: [string, string][] = [
    ["Track", session.track === "existing" ? "Transform" : "Origin"],
    ["Started", new Date(session.createdAt).toLocaleString()],
  ];
  if (session.documents.length)
    rows.push(["Documents", session.documents.join(", ")]);
  if (session.links.length) rows.push(["Links", session.links.join(", ")]);

  for (const [key, value] of Object.entries(session.context ?? {})) {
    if (!value) continue;
    if (typeof value === "object") {
      const inner = Object.entries(value as Record<string, string>)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`);
      if (inner.length) rows.push([key, inner.join("; ")]);
    } else {
      rows.push([key, String(value)]);
    }
  }

  return (
    <dl className="mt-6 grid grid-cols-[minmax(84px,auto)_1fr] gap-x-5 gap-y-2.5 border-t border-[var(--rule-soft)] pt-6">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-fg)]">
            {label.replace(/_/g, " ")}
          </dt>
          <dd className="text-[13px] text-[var(--body-fg)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
