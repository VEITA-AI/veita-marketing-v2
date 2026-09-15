"use client";

import type { ChatMessage } from "./data";

/** Label + control pair used throughout the intake forms. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-fg)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const CONTROL_CLASS =
  "w-full bg-[var(--background)] px-3 py-2.5 text-[14px] text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-fg)] border border-[var(--border)] focus:border-[var(--border-active)]";

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={CONTROL_CLASS}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className={`${CONTROL_CLASS} resize-none leading-relaxed`}
    />
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="self-start px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-opacity hover:opacity-90 disabled:opacity-40"
      style={{ background: "var(--ember)", color: "var(--navy-deep)" }}
    >
      {children}
    </button>
  );
}

/** The bordered block each intake step renders its fields into. */
export function FormBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ml-11 flex flex-col gap-4 p-5"
      style={{ background: "var(--surface)", borderLeft: "2px solid var(--border-active)" }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-fg)]">
      {children}
    </div>
  );
}

/** A single chat turn. Assistant turns get the Kyndred avatar. */
export function Bubble({ msg }: { msg: ChatMessage }) {
  const isAgent = msg.role === "assistant";
  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div className="shrink-0 pt-0.5">
        <div
          className="flex h-8 w-8 items-center justify-center font-display text-[15px]"
          style={
            isAgent
              ? { background: "rgba(54, 123, 192, 0.14)", color: "var(--primary)" }
              : { background: "rgba(232, 151, 92, 0.14)", color: "var(--ember)" }
          }
        >
          {isAgent ? "K" : "Y"}
        </div>
      </div>
      <div className="max-w-[78%]">
        <div
          className="whitespace-pre-wrap px-4 py-3 text-[14px] leading-relaxed"
          style={{
            background: isAgent ? "var(--surface)" : "rgba(54, 123, 192, 0.10)",
            border: "1px solid var(--border)",
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

/** One of the two track cards shown at the very start of the session. */
export function ChoiceCard({
  icon,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 p-5 text-left transition-colors hover:bg-[rgba(54,123,192,0.06)]"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center"
        style={{ background: "rgba(54, 123, 192, 0.14)", color: "var(--primary)" }}
      >
        {icon}
      </div>
      <div className="text-[14px] font-medium text-[var(--foreground)]">
        {title}
      </div>
      <div className="text-[12.5px] leading-relaxed text-[var(--muted-fg)]">
        {body}
      </div>
    </button>
  );
}
