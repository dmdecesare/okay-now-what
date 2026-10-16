import type { CustomerView } from "@/db/queries";

/** Shared by the streaming chat routes and the chat UI: marks the end of a stream that couldn't be answered. */
export const STREAM_ERROR_MARKER = "\u0000ASK_ERROR:";
export const ASK_ERROR_MARKER = STREAM_ERROR_MARKER;

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Suggested first questions for a customer, from their own setup guide. */
export function askStarters(view: Pick<CustomerView, "profile">): string[] {
  return [
    ...view.profile.setupSteps.slice(0, 2).map((s) => `How do I ${lowerFirst(s.title)}?`),
    "Is our code used to train the models?",
    "What's the best way to get my team using Copilot weekly?",
  ];
}
