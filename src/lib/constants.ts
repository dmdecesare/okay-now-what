import type { Stage } from "./schemas";

/** Demo assumption from SPEC section 8: Copilot Enterprise list price per seat per month. */
export const SEAT_PRICE_USD = 39;
export const PRICING_NOTE = "Demo assumption: Copilot Enterprise at $39 per seat per month, which includes 3,900 AI credits per user. Usage beyond the pooled credits is billed as additional usage.";

export const STAGE_LABELS: Record<Stage, string> = {
  pilot: "Pilot",
  onboarding: "Onboarding",
  rolling_out: "Rolling out",
};

export const NEW_ACCOUNT_USAGE_NOTE =
  "Usage data appears once the customer is live. Production version pulls from GitHub's Copilot usage and billing data.";
