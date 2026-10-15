// Every model ID and effort setting for the app's live AI features lives here.
// Checked against Anthropic's API docs on 2026-10-15. Wired into routes in Phase 5.
//
// - Effort is sent as output_config.effort ("low" | "medium" | "high" | "xhigh" | "max").
// - Claude Sonnet 5.5 defaults to "high" and always thinks adaptively; thinking can't be
//   set to "disabled" on this model, so effort is the speed and cost control.
// - Structured outputs use client.messages.parse() with zodOutputFormat(schema), so
//   generated JSON is validated before anything is saved.

export const MODELS = {
  sonnet: "claude-sonnet-5-5",
  opus: "claude-opus-5-5",
} as const;

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

type FeatureConfig = { model: string; effort: Effort; maxTokens: number };

export const AI_FEATURES = {
  /** Paste deal notes, get the full account. Switch model to MODELS.opus if plans feel thin. */
  buildAccount: { model: MODELS.sonnet, effort: "medium", maxTokens: 16000 },
  /** Customer-facing chat. Low effort keeps answers fast. */
  ask: { model: MODELS.sonnet, effort: "low", maxTokens: 2000 },
  nextBestAction: { model: MODELS.sonnet, effort: "low", maxTokens: 1500 },
  riskPlay: { model: MODELS.sonnet, effort: "low", maxTokens: 1500 },
  questionThemes: { model: MODELS.sonnet, effort: "low", maxTokens: 1500 },
  tools: { model: MODELS.sonnet, effort: "medium", maxTokens: 4000 },
} as const satisfies Record<string, FeatureConfig>;
