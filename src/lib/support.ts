import { z } from "zod";

// Customer help requests and the developer pulse, shared by the portal forms and the server actions.

export const HELP_KINDS = ["session", "blocker", "other"] as const;
export type HelpKind = (typeof HELP_KINDS)[number];

export const HELP_KIND_LABELS: Record<HelpKind, { label: string; prompt: string }> = {
  session: { label: "Book a session", prompt: "What would you like a session on, and roughly when?" },
  blocker: { label: "Flag a blocker", prompt: "What's getting in the way?" },
  other: { label: "Something else", prompt: "How can your account team help?" },
};

export const helpRequestInputSchema = z.object({
  kind: z.enum(HELP_KINDS),
  message: z.string().trim().min(5).max(1000),
  name: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\p{L}\p{N} .'-]*$/u)
    .optional()
    .default(""),
});

export const pulseInputSchema = z.object({
  score: z.number().int().min(1).max(5),
  blocker: z.string().trim().max(500).optional().default(""),
});

/** A key for "already answered this week" in the browser, so one person isn't asked twice. */
export function pulseWeekKey(token: string, now: Date = new Date()): string {
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `onw-pulse:${token.slice(0, 8)}:${now.getUTCFullYear()}-${week}`;
}
