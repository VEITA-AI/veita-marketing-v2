"use client";

import Link from "next/link";
import { useState } from "react";
import { VeitaLogo } from "@/components/site/VeitaLogo";

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!ok) setError(message ?? "Incorrect passcode.");
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
        <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]">Admin access</div>
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
