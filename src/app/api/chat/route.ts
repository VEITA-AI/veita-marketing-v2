import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-opus-5";

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

function sseError(message: string) {
  const body = `data: ${JSON.stringify({ error: message })}\n\ndata: [DONE]\n\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

export async function POST(request: Request) {
  const { messages, intake } = (await request.json()) as {
    messages?: ChatMessage[];
    intake?: Intake;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return sseError(
      "The onboarding agent is not configured yet — set ANTHROPIC_API_KEY to bring Kyndred online."
    );
  }

  const client = new Anthropic();
  const briefing = intakeBriefing(intake);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );

      try {
        const agentStream = client.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system: [
            {
              type: "text",
              text: briefing
                ? `${SYSTEM_PROMPT}\n\n${briefing}`
                : SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        agentStream.on("text", (delta) => send({ text: delta }));

        const final = await agentStream.finalMessage();
        if (final.stop_reason === "refusal") {
          send({ error: "Kyndred declined to continue this conversation." });
        }
      } catch (e) {
        const message =
          e instanceof Anthropic.RateLimitError
            ? "Rate limit reached. Wait a moment."
            : e instanceof Anthropic.AuthenticationError
              ? "Kyndred's credentials are invalid."
              : e instanceof Anthropic.APIError
                ? `Kyndred is unavailable right now (${e.status}).`
                : "Connection error.";
        send({ error: message });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
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
