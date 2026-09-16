import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { appendMessages, type StoredMessage } from "@/lib/sessions";

export const runtime = "nodejs";

/**
 * The onboarding agent's backend.
 *
 * Runs on either Claude or Gemini. `CHAT_PROVIDER` picks explicitly; with it
 * unset the route uses whichever key is present, so a deployment only needs to
 * supply one. Both paths stream the same SSE shape, so the client never knows
 * or cares which is answering.
 */

const CLAUDE_MODEL = "claude-opus-5";

/**
 * Gemini 2.5 Pro and 2.5 Flash shut down on 16 Oct 2026, so they are not an
 * option here.
 *
 * Probed against the Veita project (saga-496018) over Vertex: the Pro models
 * 404 — none are enabled on it — while 3.8/3.7/3.6 Flash and 3.5 Flash-Lite all
 * answer. 3.7 Flash is the default because it is the one Google positions for
 * agentic work. Override with GEMINI_MODEL; an id the project can't reach
 * returns a message saying exactly that.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.7-flash";

const SYSTEM_PROMPT = `You are Kyndred, Veita's onboarding agent.

Veita is a company studio. It builds capital-efficient companies — each one a "Kyn" — that run on Saga (the agentic operating platform) and think with Kyndred (a model trained on the operational record of the companies Veita builds). There are two doors in: Origin, for companies built from zero inside the studio, and Transform, for established businesses rebuilt around agentic operations.

You are the founder's first conversation with Veita. You are not a screening gate and this is not an application. Your job is to work through the founder's plan with them, in real time, and help them see where the leverage is before anyone forms a judgment.

How you work:
- Ask what a good operator would ask. One sharp question at a time, grounded in what they actually told you.
- Reference their specific materials and context. Never invent facts you were not given.
- For startups, pressure-test across why-now, problem and market, competitive landscape and moat, business model, and TAM/SAM/SOM.
- For existing businesses, find where the operational drag sits and where agentic workflows would actually move the needle.
- Be direct and concrete. No flattery, no filler, no bullet-point dumps. Write in short paragraphs.
- When something in the plan is thin, say so plainly and say what would make it stronger.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

type Intake = {
  track?: string;
  name?: string;
  email?: string;
  company?: string;
  oneLiner?: string;
  context?: Record<string, unknown>;
  documents?: string[];
  links?: string[];
};

/** Renders the intake answers as the context block the agent opens with. */
function intakeBriefing(intake: Intake | undefined): string {
  if (!intake) return "";
  const lines = [
    `Track: ${intake.track === "existing" ? "Existing business (Transform)" : "New company (Origin)"}`,
    intake.name && `Founder: ${intake.name}`,
    intake.company && `Company: ${intake.company}`,
    intake.oneLiner && `One-liner: ${intake.oneLiner}`,
    intake.documents?.length &&
      `Documents shared: ${intake.documents.join(", ")}`,
    intake.links?.length && `Links shared: ${intake.links.join(", ")}`,
  ].filter(Boolean);

  const context = intake.context ?? {};
  for (const [key, value] of Object.entries(context)) {
    if (!value) continue;
    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, string>)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`);
      if (entries.length) lines.push(`${key}: ${entries.join("; ")}`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }

  return `What the founder shared during intake:\n${lines.join("\n")}`;
}

const geminiKey = () =>
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";

const gcpProject = () =>
  process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT ?? "";

/**
 * Two ways to reach Gemini:
 *
 *   - Vertex (Gemini Enterprise Agent Platform) with Application Default
 *     Credentials, which is what a GCP org that disallows API keys will have.
 *     Needs a project, no key; the SDK picks ADC up through
 *     google-auth-library — the metadata server on GCP, GOOGLE_APPLICATION_
 *     CREDENTIALS, or a local `gcloud auth application-default login`.
 *   - The Developer API with a plain key.
 *
 * A configured project wins, since it is the more locked-down path and the one
 * an org deliberately chose.
 */
const geminiReady = () => !!gcpProject() || !!geminiKey();

/** Explicit choice wins; otherwise whichever provider is configured. */
function resolveProvider(): "anthropic" | "gemini" | null {
  const choice = process.env.CHAT_PROVIDER?.toLowerCase();
  if (choice === "gemini") return geminiReady() ? "gemini" : null;
  if (choice === "anthropic") return process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (geminiReady()) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

/** Vertex + ADC when a project is configured, key auth otherwise. */
function geminiClient(): GoogleGenAI {
  const project = gcpProject();
  if (project) {
    return new GoogleGenAI({
      // `enterprise` is the current flag; `vertexai` is its legacy alias.
      enterprise: true,
      project,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "global",
      // No apiKey: that is what makes the SDK fall through to ADC.
    });
  }
  return new GoogleGenAI({ apiKey: geminiKey() });
}

function sseError(message: string) {
  const body = `data: ${JSON.stringify({ error: message })}\n\ndata: [DONE]\n\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

export async function POST(request: Request) {
  const { messages, intake, sessionId } = (await request.json()) as {
    messages?: ChatMessage[];
    intake?: Intake;
    sessionId?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const provider = resolveProvider();
  if (!provider) {
    return sseError(
      "The onboarding agent is not configured yet — set GOOGLE_CLOUD_PROJECT (Vertex + ADC), GEMINI_API_KEY, or ANTHROPIC_API_KEY to bring Kyndred online."
    );
  }

  const briefing = intakeBriefing(intake);
  const system = briefing ? `${SYSTEM_PROMPT}\n\n${briefing}` : SYSTEM_PROMPT;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );

      let reply = "";
      const emit = (text: string) => {
        reply += text;
        send({ text });
      };

      try {
        if (provider === "gemini") {
          const ai = geminiClient();
          const result = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            // Gemini names the assistant turn "model".
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            config: { systemInstruction: system },
          });
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) emit(text);
          }
        } else {
          const client = new Anthropic();
          const agentStream = client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            thinking: { type: "adaptive" },
            output_config: { effort: "medium" },
            system: [
              {
                type: "text",
                text: system,
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          agentStream.on("text", (delta) => emit(delta));

          const final = await agentStream.finalMessage();
          if (final.stop_reason === "refusal") {
            send({ error: "Kyndred declined to continue this conversation." });
          }
        }
      } catch (e) {
        send({ error: describe(e, provider) });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        // After the response is closed, so recording never delays it.
        await record(sessionId, messages, reply);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/**
 * Appends the turn just exchanged to the founder's session.
 *
 * The client sends the whole history each time, so only the final user message
 * is new. The opening `[system]` instruction is stage direction, not something
 * the founder said, so it is not kept. Failures are logged and swallowed: a
 * storage problem must never break a live conversation.
 */
async function record(
  sessionId: string | undefined,
  messages: ChatMessage[],
  reply: string
) {
  if (!sessionId) return;
  const at = new Date().toISOString();
  const turn: { role: "user" | "assistant"; content: string; at: string }[] = [];

  const last = messages[messages.length - 1];
  if (last?.role === "user" && !last.content.startsWith("[system]")) {
    turn.push({ role: "user", content: last.content, at });
  }
  if (reply.trim()) turn.push({ role: "assistant", content: reply, at });
  if (!turn.length) return;

  try {
    await appendMessages(sessionId, turn);
  } catch (e) {
    console.error("Could not record a founder turn:", e);
  }
}

/** Keep provider failures legible without leaking anything from the response. */
function describe(e: unknown, provider: "anthropic" | "gemini"): string {
  if (provider === "anthropic") {
    if (e instanceof Anthropic.RateLimitError)
      return "Rate limit reached. Wait a moment.";
    if (e instanceof Anthropic.AuthenticationError)
      return "Kyndred's credentials are invalid.";
    if (e instanceof Anthropic.APIError)
      return `Kyndred is unavailable right now (${e.status}).`;
    return "Connection error.";
  }

  const message = e instanceof Error ? e.message : String(e);
  if (/could not load the default credentials|application default credentials|ADC/i.test(message))
    return "No Google credentials found — run `gcloud auth application-default login`, or give the service account access.";
  if (/permission|forbidden|403|IAM/i.test(message))
    return "Those Google credentials can't reach Vertex AI on this project — the account needs roles/aiplatform.user.";
  if (/api[_ ]?key|unauthenticated|401/i.test(message))
    return "Kyndred's credentials are invalid.";
  if (/quota|rate|429|resource_exhausted/i.test(message))
    return "Rate limit reached. Wait a moment.";
  if (/not found|unsupported|404/i.test(message))
    return `Model ${GEMINI_MODEL} is unavailable — set GEMINI_MODEL to one your key can reach.`;
  return "Kyndred is unavailable right now.";
}
