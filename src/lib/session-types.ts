/** The shape of a founder session, shared by the store and the dashboard. */

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  at: string;
};

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  track: string;
  name: string;
  email: string;
  company: string;
  oneLiner: string;
  context: Record<string, unknown>;
  documents: string[];
  links: string[];
  messages: StoredMessage[];
};

export type SessionSummary = Pick<
  Session,
  "id" | "createdAt" | "updatedAt" | "name" | "email" | "company" | "track"
> & { messageCount: number };
