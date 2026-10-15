import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { AI_FEATURES, FALLBACK, type AiFeature } from "./config";

// The only place the app talks to the Anthropic API. Server-only: the key is read from
// process.env.ANTHROPIC_API_KEY here and never reaches the browser, the repo, or logs.

export type AiFailure = "no_key" | "refused" | "api_error" | "invalid_output" | "rate_limited";

export class AiError extends Error {
  constructor(public reason: AiFailure) {
    super(reason);
  }
}

export const FRIENDLY_AI_MESSAGE: Record<AiFailure, string> = {
  no_key: "Live AI isn't set up yet. Everything else still works.",
  refused: "Claude couldn't help with that one. Try rephrasing it.",
  api_error: "Claude is having a moment. Please try again in a minute.",
  invalid_output: "That didn't come out right. Please try again.",
  rate_limited: "Taking a short breather. Please try again in a bit.",
};

export type Usage = { input: number; output: number };

type SystemBlocks = Anthropic.Beta.Messages.BetaTextBlockParam[];

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new AiError("no_key");
  client ??= new Anthropic({ maxRetries: 1, timeout: 90_000 });
  return client;
}

/** Stable instructions first (cached), then the per-account context. */
export function systemBlocks(stable: string, context?: string): SystemBlocks {
  return [
    { type: "text", text: stable, cache_control: { type: "ephemeral" } },
    ...(context ? [{ type: "text" as const, text: context }] : []),
  ];
}

function usageOf(u: Anthropic.Beta.Messages.BetaUsage): Usage {
  return {
    input: u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
    output: u.output_tokens,
  };
}

function toAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  if (err instanceof Anthropic.RateLimitError) return new AiError("rate_limited");
  if (err instanceof Anthropic.APIError) {
    // Log the kind of failure only. Never the request, headers, or key.
    console.error(`[ai] API error ${err.status ?? "unknown"}`);
    return new AiError("api_error");
  }
  console.error("[ai] request failed");
  return new AiError("api_error");
}

/** Structured output, validated against a Zod schema before it's returned. */
export async function generateStructured<T>(
  feature: AiFeature,
  schema: z.ZodType<T>,
  system: SystemBlocks,
  input: string,
): Promise<{ data: T; usage: Usage }> {
  const cfg = AI_FEATURES[feature];
  try {
    const res = await getClient().beta.messages.parse({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      ...FALLBACK,
      betas: [...FALLBACK.betas],
      output_config: { effort: cfg.effort, format: betaZodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: input }],
    });
    if (res.stop_reason === "refusal") throw new AiError("refused");
    if (res.parsed_output == null) throw new AiError("invalid_output");
    return { data: res.parsed_output as T, usage: usageOf(res.usage) };
  } catch (err) {
    throw toAiError(err);
  }
}

/** Plain-text draft (tools). */
export async function generateText(
  feature: AiFeature,
  system: SystemBlocks,
  input: string,
): Promise<{ text: string; usage: Usage }> {
  const cfg = AI_FEATURES[feature];
  try {
    const res = await getClient().beta.messages.create({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      ...FALLBACK,
      betas: [...FALLBACK.betas],
      output_config: { effort: cfg.effort },
      system,
      messages: [{ role: "user", content: input }],
    });
    if (res.stop_reason === "refusal") throw new AiError("refused");
    const text = res.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (!text) throw new AiError("invalid_output");
    return { text, usage: usageOf(res.usage) };
  } catch (err) {
    throw toAiError(err);
  }
}

/**
 * Streams answer text for Ask. Calls onText for each chunk and resolves with the full
 * text and usage. Throws AiError if the request fails or is declined.
 */
export async function streamText(
  feature: AiFeature,
  system: SystemBlocks,
  messages: Anthropic.Beta.Messages.BetaMessageParam[],
  onText: (chunk: string) => void,
): Promise<{ text: string; usage: Usage }> {
  const cfg = AI_FEATURES[feature];
  try {
    const stream = getClient().beta.messages.stream({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      ...FALLBACK,
      betas: [...FALLBACK.betas],
      output_config: { effort: cfg.effort },
      system,
      messages,
    });
    stream.on("text", onText);
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") throw new AiError("refused");
    const text = final.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    return { text, usage: usageOf(final.usage) };
  } catch (err) {
    throw toAiError(err);
  }
}
