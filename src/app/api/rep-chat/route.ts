import { z } from "zod";
import { getBook } from "@/db/queries";
import { AiError, streamText, systemBlocks } from "@/lib/ai/client";
import { REP_CHAT_SYSTEM, repChatContext } from "@/lib/ai/prompts";
import { STREAM_ERROR_MARKER } from "@/lib/ask";
import { BREATHER_MESSAGE, callerIp, hashIp, isRateLimited, recordCall } from "@/lib/rate-limit";

// POST /api/rep-chat: the rep's assistant across the whole book, focused on the open account if any.
// Streams the answer as plain text. Nothing is saved. If Claude can't answer, the stream ends with
// STREAM_ERROR_MARKER plus a friendly message.

export const maxDuration = 60;

const COULD_NOT_ANSWER = "I couldn't answer that right now. Please try again in a moment.";

const bodySchema = z.object({
  question: z.string().trim().min(3).max(1000),
  history: z
    .array(z.object({ q: z.string().max(1000), a: z.string().max(6000) }))
    .max(6)
    .default([]),
  focus: z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .nullish(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please type a question first." }, { status: 400 });
  const { question, history, focus } = parsed.data;

  const ipHash = hashIp(callerIp(req.headers));
  if (await isRateLimited("rep", ipHash)) {
    await recordCall("repChat", ipHash, "limited");
    return Response.json({ error: BREATHER_MESSAGE }, { status: 429 });
  }

  const book = await getBook().catch(() => null);
  if (!book) return Response.json({ error: "Your accounts didn't load. Please try again." }, { status: 503 });

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
      try {
        const result = await streamText(
          "repChat",
          systemBlocks(REP_CHAT_SYSTEM, repChatContext(book, focus ?? null)),
          messages,
          (chunk) => controller.enqueue(encoder.encode(chunk.replace(/\u2014/g, ", "))),
        );
        await recordCall("repChat", ipHash, "ok", result.usage);
      } catch (err) {
        const refused = err instanceof AiError && err.reason === "refused";
        await recordCall("repChat", ipHash, refused ? "refused" : "error");
        controller.enqueue(encoder.encode(`${STREAM_ERROR_MARKER}${COULD_NOT_ANSWER}`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
