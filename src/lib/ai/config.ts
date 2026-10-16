// Every model ID, effort setting, and limit for the app's live AI features lives here.
// Checked against Anthropic's API docs on 2026-10-15.
//
// - Effort is sent as output_config.effort ("low" | "medium" | "high" | "xhigh" | "max").
// - Claude Sonnet 5.5 always thinks adaptively; thinking can't be set to "disabled" on
//   this model, so effort is the speed and cost control.
// - Structured outputs use messages.parse() with a Zod schema, so generated JSON is
//   validated before anything is saved.

export const MODELS = {
  sonnet: "claude-sonnet-5-5",
  opus: "claude-opus-5-5",
} as const;

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

type FeatureConfig = { model: string; effort: Effort; maxTokens: number; label: string };

export const AI_FEATURES = {
  /** Paste deal notes, get the full account (Phase 6). Switch to MODELS.opus if plans feel thin. */
  buildAccount: { model: MODELS.sonnet, effort: "medium", maxTokens: 16000, label: "Build account from notes" },
  /** Customer-facing chat. Low effort keeps answers fast. */
  ask: { model: MODELS.sonnet, effort: "low", maxTokens: 4000, label: "Ask assistant" },
  /** Tags each customer question with a topic (feeds the security-questions risk rule). */
  classifyQuestion: { model: MODELS.sonnet, effort: "low", maxTokens: 1000, label: "Question topic" },
  nextBestAction: { model: MODELS.sonnet, effort: "low", maxTokens: 4000, label: "Next best action" },
  riskPlay: { model: MODELS.sonnet, effort: "low", maxTokens: 4000, label: "Risk explanation and recovery play" },
  questionThemes: { model: MODELS.sonnet, effort: "low", maxTokens: 4000, label: "Question themes" },
  tools: { model: MODELS.sonnet, effort: "medium", maxTokens: 8000, label: "Rep tools" },
} as const satisfies Record<string, FeatureConfig>;

export type AiFeature = keyof typeof AI_FEATURES;

/**
 * Server-side fallback: if the model declines a request for policy reasons, Anthropic
 * can re-run it on its default fallback model inside the same call. Rarely relevant
 * for onboarding content, but it keeps a decline from becoming a dead end.
 */
export const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
} as const;

/** Basic protection so a public demo link can't drain the API budget (SPEC rule 8). */
export const RATE_LIMITS = {
  /** Customer Ask questions per IP per hour. */
  askPerHour: Number(process.env.RATE_LIMIT_ASK_PER_HOUR ?? 20),
  /** Rep refreshes and tool drafts per IP per hour. */
  repPerHour: Number(process.env.RATE_LIMIT_REP_PER_HOUR ?? 30),
  /** Full account builds per IP per hour (the most expensive call). */
  buildPerHour: Number(process.env.RATE_LIMIT_BUILD_PER_HOUR ?? 6),
  /** All AI calls across the whole app per day. Worst case stays under a $20 monthly spend limit. */
  globalPerDay: Number(process.env.RATE_LIMIT_GLOBAL_PER_DAY ?? 300),
  /** Non-AI writes (milestone check-offs, visits) per IP per minute. */
  writesPerMinute: Number(process.env.RATE_LIMIT_WRITES_PER_MINUTE ?? 60),
};
