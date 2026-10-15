import { after } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { getAskContext } from "@/db/queries";
import { customerQuestions } from "@/db/schema";
import { AiError, generateStructured, streamText, systemBlocks } from "@/lib/ai/client";
import { keepCatalogLinks } from "@/lib/ai/format";
import { regenerateInsight } from "@/lib/ai/insights";
import { ASK_SYSTEM, CLASSIFY_SYSTEM, askContext } from "@/lib/ai/prompts";
import { guessTopic } from "@/lib/ai/topic";
import { ASK_ERROR_MARKER } from "@/lib/ask";
import { BREATHER_MESSAGE, callerIp, hashIp, isRateLimited, recordCall } from "@/lib/rate-limit";
import { QUESTION_TOPICS, type QuestionTopic } from "@/lib/schemas";

// POST /api/ask: the customer's Ask assistant. Authorized by the private link token.
// Streams the answer as plain text. If Claude can't answer, the stream ends with
// ASK_ERROR_MARKER plus a friendly message, and the question is still saved for the rep.

export const maxDuration = 60;

const SAVED_ANYWAY =
  "I couldn't answer that right now, but your question was saved and your account team will follow up.";

const bodySchema = z.object({
  token: z.string().min(32).max(64),
  question: z.string().trim().min(3).max(1000),
  history: z
    .array(z.object({ q: z.string().max(1000), a: z.string().max(4000) }))
    .max(4)
    .default([]),
});

const topicSchema = z.object({ topic: z.enum(QUESTION_TOPICS) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please type a question first." }, { status: 400 });
  const { token, question, history } = parsed.data;

  const ctx = await getAskContext(token);
  if (!ctx) return Response.json({ error: "This onboarding link isn't valid." }, { status: 404 });

  const ipHash = hashIp(callerIp(req.headers));
  if (await isRateLimited("ask", ipHash)) {
    await recordCall("ask", ipHash, "limited");
    return Response.json({ error: BREATHER_MESSAGE }, { status: 429 });
  }

  // Tag the topic alongside the answer. Falls back to keywords if AI is unavailable.
  const topicPromise: Promise<QuestionTopic> = generateStructured(
    "classifyQuestion",
    topicSchema,
    systemBlocks(CLASSIFY_SYSTEM),
    question,
  )
    .then(async ({ data, usage }) => {
      await recordCall("classifyQuestion", ipHash, "ok", usage);
      return data.topic;
    })
    .catch(() => guessTopic(question));

  const messages = [
    ...history.flatMap((h) => [
      { role: "user" as const, content: h.q },
      { role: "assistant" as const, content: h.a },
    ]),
    { role: "user" as const, content: question },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer: string | null = null;
      try {
        const result = await streamText("ask", systemBlocks(ASK_SYSTEM, askContext(ctx)), messages, (chunk) =>
          controller.enqueue(encoder.encode(chunk.replace(/\u2014/g, ", "))),
        );
        answer = result.text;
        await recordCall("ask", ipHash, "ok", result.usage);
      } catch (err) {
        const refused = err instanceof AiError && err.reason === "refused";
        await recordCall("ask", ipHash, refused ? "refused" : "error");
        controller.enqueue(encoder.encode(`${ASK_ERROR_MARKER}${SAVED_ANYWAY}`));
      }

      // Save every question so the rep sees it, answered or not.
      try {
        const cleaned = answer ? keepCatalogLinks(answer) : null;
        const db = await getDb();
        await db.insert(customerQuestions).values({
          accountId: ctx.accountId,
          question,
          answer: cleaned?.text ?? null,
          topic: await topicPromise,
          sources: cleaned?.sources ?? null,
        });
      } catch {
        console.error("[ask] could not save question");
      }
      controller.close();
    },
  });

  // Once the answer is out, refresh the rep's question themes in the background.
  after(async () => {
    try {
      await regenerateInsight(ctx.slug, "question_themes", hashIp("background"));
    } catch {
      // The previous summary stays in place.
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
