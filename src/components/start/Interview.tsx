"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Linkedin, Send, Upload } from "lucide-react";
import type { ChatMessage } from "./data";
import type { IntakeResult } from "./GetStarted";
import { Bubble } from "./ui";

const OPENING_INSTRUCTION =
  "[system] Open the interview. Greet this founder by name, reference the specific materials and context they shared, and ask one sharp opening question grounded in their actual business. Do not invent facts you were not given.";

/**
 * Streams a reply from the onboarding agent, appending deltas to the last
 * assistant message as they arrive. Returns the completed text.
 */
async function streamReply(
  history: ChatMessage[],
  intake: IntakeResult,
  onDelta: (full: string, isFirst: boolean) => void
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history, intake }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Kyndred is unavailable right now.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let started = false;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;

      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return text;

      const parsed = JSON.parse(payload) as { text?: string; error?: string };
      if (parsed.error) throw new Error(parsed.error);
      if (parsed.text) {
        text += parsed.text;
        onDelta(text, !started);
        started = true;
      }
    }
  }

  return text;
}

export function Interview({
  intake,
  onUserMessageCount,
}: {
  intake: IntakeResult;
  onUserMessageCount: (count: number) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);

  const applyDelta = (full: string, isFirst: boolean) =>
    setMessages((prev) =>
      isFirst
        ? [...prev, { role: "assistant", content: full }]
        : [...prev.slice(0, -1), { role: "assistant", content: full }]
    );

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    setThinking(true);
    streamReply(
      [{ role: "user", content: OPENING_INSTRUCTION }],
      intake,
      applyDelta
    )
      .catch((e: Error) => setError(e.message))
      .finally(() => setThinking(false));
  }, [intake]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const userCount = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    onUserMessageCount(userCount);
  }, [userCount, onUserMessageCount]);

  async function send() {
    const text = draft.trim();
    if (!text || thinking) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setThinking(true);
    setError(null);
    try {
      await streamReply(next, intake, applyDelta);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-8 py-8 max-md:px-5"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
          {thinking && (
            <div className="pl-12 text-[12px] text-[var(--muted-fg)]">
              Kyndred is thinking…
            </div>
          )}
          {error && (
            <div
              className="px-4 py-2.5 text-[12.5px]"
              style={{
                background: "rgba(228, 0, 20, 0.08)",
                border: "1px solid rgba(228, 0, 20, 0.28)",
                color: "#ff8a94",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-8 pb-6 pt-3 max-md:px-5">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-2">
            <Affordance icon={Upload} label="upload document" />
            <Affordance icon={Link2} label="add link" />
            <Affordance icon={Linkedin} label="LinkedIn" />
          </div>
          <div className="flex items-end gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition-colors focus-within:border-[var(--border-active)]">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Reply to Kyndred…"
              className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[14px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-fg)]"
            />
            <button
              onClick={send}
              disabled={!draft.trim() || thinking}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Affordance({
  icon: Icon,
  label,
}: {
  icon: typeof Upload;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[var(--muted-fg)]"
      style={{ border: "1px solid var(--border)" }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
