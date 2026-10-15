import { AiError, FRIENDLY_AI_MESSAGE } from "@/lib/ai/client";
import { buildAccount } from "@/lib/ai/build-account";
import type { BuildEvent } from "@/lib/build-events";
import { BREATHER_MESSAGE, callerIp, hashIp, isRateLimited, recordCall } from "@/lib/rate-limit";
import { newAccountInputSchema } from "@/lib/schemas";

// POST /api/accounts: build a new account from deal notes.
// Streams newline-delimited JSON so the form can show real progress:
//   {"type":"step","step":"plan"}  ...  {"type":"done","slug":"..."}  or  {"type":"error","message":"..."}

export const maxDuration = 120;

export async function POST(req: Request) {
  const parsed = newAccountInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }

  const ipHash = hashIp(callerIp(req.headers));
  if (await isRateLimited("rep", ipHash)) {
    await recordCall("buildAccount", ipHash, "limited");
    return Response.json({ error: BREATHER_MESSAGE }, { status: 429 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: BuildEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        const { slug } = await buildAccount(parsed.data, ipHash, (step) => send({ type: "step", step }));
        send({ type: "done", slug });
      } catch (err) {
        const message =
          err instanceof AiError
            ? FRIENDLY_AI_MESSAGE[err.reason]
            : "Something went wrong building the account. Your notes are still here, so try again.";
        if (!(err instanceof AiError)) console.error("[build-account] failed");
        send({ type: "error", message });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
