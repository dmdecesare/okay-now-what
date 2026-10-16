import { z } from "zod";
import type { DocKey } from "./resources";

// Developer learning paths on the customer portal: short, hands-on challenges by role. Every link
// comes from the verified doc catalog (DocKey), so nothing here can point at an unchecked URL.

export const LEARNING_ROLES = ["developer", "team_lead", "admin", "security"] as const;
export type LearningRole = (typeof LEARNING_ROLES)[number];

export const ROLE_LABELS: Record<LearningRole, { label: string; blurb: string }> = {
  developer: { label: "Developer", blurb: "From first suggestion to handing off whole tasks." },
  team_lead: { label: "Team lead", blurb: "Get your team using it weekly, and see what's working." },
  admin: { label: "Admin", blurb: "Seats, policies, and budgets, set up the right way." },
  security: { label: "Security", blurb: "Exclusions, data handling, and the audit trail." },
};

export type Challenge = {
  id: string;
  title: string;
  why: string;
  steps: string[];
  minutes: number;
  docs: DocKey[];
  /** One of VIDEO_GROUPS[].id, if there's a short official video for it. */
  videoGroup?: string;
};

const C = (c: Challenge) => c;

export const CHALLENGES = {
  install: C({
    id: "install",
    title: "Install Copilot in your editor",
    why: "Everything else starts here.",
    steps: ["Install the extension for VS Code or JetBrains", "Sign in with your work account", "Type a comment and accept your first suggestion"],
    minutes: 5,
    docs: ["ide-quickstart", "install-extension"],
    videoGroup: "getting-started",
  }),
  first_chat: C({
    id: "first_chat",
    title: "Ask Copilot Chat about your code",
    why: "Chat is the fastest way to understand code you didn't write.",
    steps: ["Open Copilot Chat in your editor", "Select a function and ask it to explain what it does", "Ask a follow-up about an edge case"],
    minutes: 10,
    docs: ["chat-in-ide", "chat-cheat-sheet"],
    videoGroup: "chat",
  }),
  write_tests: C({
    id: "write_tests",
    title: "Write tests for one function",
    why: "A quick, visible time saver that most teams feel in week one.",
    steps: ["Pick a function with thin test coverage", "Ask Copilot to generate unit tests", "Run them, and fix or keep what's useful"],
    minutes: 15,
    docs: ["write-tests", "generate-unit-tests"],
  }),
  refactor: C({
    id: "refactor",
    title: "Refactor something you've been putting off",
    why: "Copilot is good at the careful, boring parts of a refactor.",
    steps: ["Choose a small piece of code that needs cleanup", "Ask Chat to suggest a refactor and explain the trade-offs", "Apply it with tests running"],
    minutes: 20,
    docs: ["refactor-cookbook", "explore-codebase"],
  }),
  custom_instructions: C({
    id: "custom_instructions",
    title: "Add custom instructions to a repo",
    why: "Teach Copilot your team's conventions once, so every suggestion follows them.",
    steps: ["Create .github/copilot-instructions.md", "Write five lines about your stack, style, and testing", "Ask Chat a question and check the answer follows them"],
    minutes: 15,
    docs: ["repo-instructions"],
  }),
  agent_task: C({
    id: "agent_task",
    title: "Hand a multi-file change to agent mode",
    why: "Agent mode plans and edits across files while you stay in control.",
    steps: ["Open agent mode in your editor", "Describe a small change that touches two or three files", "Review each edit before you accept it"],
    minutes: 20,
    docs: ["agent-mode"],
    videoGroup: "agents",
  }),
  code_review: C({
    id: "code_review",
    title: "Get a Copilot code review on a pull request",
    why: "A first review in minutes, before a teammate looks.",
    steps: ["Open a pull request", "Request a review from Copilot", "Resolve or dismiss each comment"],
    minutes: 10,
    docs: ["code-review", "review-ai-code"],
    videoGroup: "code-review",
  }),
  cloud_agent: C({
    id: "cloud_agent",
    title: "Assign an issue to the cloud agent",
    why: "Hand off a well-scoped task and get a pull request back.",
    steps: ["Pick a small, well-described issue", "Assign it to Copilot", "Review the pull request it opens like any other"],
    minutes: 15,
    docs: ["cloud-agent", "cloud-agent-best-results"],
    videoGroup: "agents",
  }),
  drive_adoption: C({
    id: "drive_adoption",
    title: "Plan your team's first two weeks",
    why: "Teams that pick two or three use cases up front build the habit faster.",
    steps: ["Pick two use cases for your team (tests, reviews, or explaining code)", "Share them in your team channel", "Check in after a week on what's working"],
    minutes: 15,
    docs: ["drive-adoption", "measure-success"],
  }),
  view_usage: C({
    id: "view_usage",
    title: "Check how your team is using Copilot",
    why: "Usage data shows who might need a hand and which habits are sticking.",
    steps: ["Open the Copilot usage metrics", "Look at weekly active users for your team", "Share one number in your next team meeting"],
    minutes: 10,
    docs: ["view-usage", "usage-metrics"],
  }),
  setup_org: C({
    id: "setup_org",
    title: "Set up Copilot for your organization",
    why: "Get seats and access right before the rollout grows.",
    steps: ["Enable Copilot for the organization", "Assign seats by team", "Confirm a test user can sign in"],
    minutes: 20,
    docs: ["setup-org", "seat-assignment"],
    videoGroup: "admin",
  }),
  policies: C({
    id: "policies",
    title: "Set policies and the public code filter",
    why: "Clear, documented settings are the base of your governance story.",
    steps: ["Review each Copilot policy and decide on or off", "Set suggestions matching public code to Block if required", "Write down each decision and who approved it"],
    minutes: 20,
    docs: ["org-policies", "matching-code"],
  }),
  budgets: C({
    id: "budgets",
    title: "Set AI credit budgets",
    why: "Keep usage-based spend predictable as adoption grows.",
    steps: ["Read how AI credits and additional usage work", "Set a budget for additional usage", "Decide who gets alerted when it's close"],
    minutes: 15,
    docs: ["ai-credits", "budgets"],
  }),
  reengage: C({
    id: "reengage",
    title: "Re-engage inactive seats",
    why: "Unused seats are the easiest adoption win.",
    steps: ["Find seats with no activity in 30 days", "Send those developers a short reminder with one quick win to try", "Check again in two weeks"],
    minutes: 10,
    docs: ["remind-inactive", "usage-metrics"],
  }),
  data_handling: C({
    id: "data_handling",
    title: "Understand where your code goes",
    why: "The first question every security review asks.",
    steps: ["Read how models are hosted and how data is handled", "Collect the approval resources for your review", "Note any open questions for your account team"],
    minutes: 20,
    docs: ["model-hosting", "approval-resources"],
  }),
  exclusions: C({
    id: "exclusions",
    title: "Set up content exclusion",
    why: "Keep sensitive repositories and paths out of Copilot.",
    steps: ["List the repositories or paths that must be excluded", "Add them in your organization's Copilot settings", "Open an excluded file and confirm there are no suggestions"],
    minutes: 20,
    docs: ["content-exclusion-about", "content-exclusion-howto"],
  }),
  public_code: C({
    id: "public_code",
    title: "Decide on suggestions that match public code",
    why: "A clear setting here answers most IP questions.",
    steps: ["Read how matching public code works", "Choose Block or Allow with your legal team", "Record the decision"],
    minutes: 10,
    docs: ["matching-code"],
  }),
  audit: C({
    id: "audit",
    title: "Review the audit log",
    why: "Show who changed Copilot settings and when.",
    steps: ["Open the enterprise audit log", "Filter for Copilot events", "Export a sample for your records"],
    minutes: 15,
    docs: ["audit-logs"],
  }),
} satisfies Record<string, Challenge>;

export type ChallengeId = keyof typeof CHALLENGES;
export const CHALLENGE_IDS = Object.keys(CHALLENGES) as [ChallengeId, ...ChallengeId[]];

export const PATHS: Record<LearningRole, ChallengeId[]> = {
  developer: ["install", "first_chat", "write_tests", "refactor", "custom_instructions", "agent_task", "code_review", "cloud_agent"],
  team_lead: ["install", "first_chat", "code_review", "drive_adoption", "view_usage"],
  admin: ["setup_org", "policies", "budgets", "reengage"],
  security: ["data_handling", "exclusions", "public_code", "audit"],
};

export const MAX_LEARNERS_PER_ACCOUNT = 300;

export const learnerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(24)
    .regex(/^[\p{L}\p{N} .'-]+$/u),
  role: z.enum(LEARNING_ROLES),
  challengeId: z.enum(CHALLENGE_IDS),
  done: z.boolean(),
});
export type LearnerInput = z.infer<typeof learnerInputSchema>;

/** How a learner is matched across visits: case and spacing don't matter. */
export function nameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export type LearningSummary = {
  learners: number;
  completions: number;
  leaders: { name: string; role: LearningRole; done: number }[];
  /** Challenge ids done, by nameKey. */
  progress: Record<string, ChallengeId[]>;
};

export function summarizeLearning(
  rows: { displayName: string; nameKey: string; role: string; challengeId: string; completedAt: Date }[],
): LearningSummary {
  const byName = new Map<string, { name: string; role: LearningRole; done: Set<ChallengeId>; last: number }>();
  for (const r of rows) {
    if (!(r.challengeId in CHALLENGES)) continue;
    const entry = byName.get(r.nameKey) ?? {
      name: r.displayName,
      role: (LEARNING_ROLES as readonly string[]).includes(r.role) ? (r.role as LearningRole) : "developer",
      done: new Set<ChallengeId>(),
      last: 0,
    };
    entry.done.add(r.challengeId as ChallengeId);
    if (r.completedAt.getTime() > entry.last) {
      entry.last = r.completedAt.getTime();
      entry.name = r.displayName;
    }
    byName.set(r.nameKey, entry);
  }
  const all = [...byName.entries()];
  return {
    learners: all.length,
    completions: all.reduce((n, [, e]) => n + e.done.size, 0),
    leaders: all
      .map(([, e]) => ({ name: e.name, role: e.role, done: e.done.size, last: e.last }))
      .sort((a, b) => b.done - a.done || a.last - b.last)
      .slice(0, 10)
      .map(({ name, role, done }) => ({ name, role, done })),
    progress: Object.fromEntries(all.map(([key, e]) => [key, [...e.done]])),
  };
}
