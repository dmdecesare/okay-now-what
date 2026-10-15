/** Progress events streamed by POST /api/accounts while an account is built. */
export type BuildStep = "plan" | "kit" | "app";

export type BuildEvent =
  | { type: "step"; step: BuildStep }
  | { type: "done"; slug: string }
  | { type: "error"; message: string };
