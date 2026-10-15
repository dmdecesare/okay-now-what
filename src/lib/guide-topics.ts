// Guide topics from SPEC section 6. Official doc and video links get attached in Phase 4,
// after each URL is checked.

export const GUIDE_LEVELS = [
  { id: "101", title: "101 Getting started" },
  { id: "201", title: "201 Everyday use" },
  { id: "301", title: "301 Advanced" },
  { id: "role", title: "Role tracks" },
] as const;

export const GUIDE_TOPICS = [
  { id: "install-ide", level: "101", title: "Install in your IDE", summary: "Get Copilot running in VS Code, JetBrains, or your editor of choice." },
  { id: "first-suggestions", level: "101", title: "Your first suggestions", summary: "How inline suggestions work and how to accept, cycle, or ignore them." },
  { id: "using-chat", level: "101", title: "Using Copilot Chat", summary: "Ask questions about your code, get explanations, and fix errors in chat." },
  { id: "good-and-bad-at", level: "101", title: "What Copilot is good and bad at", summary: "Where it saves the most time, and where to double-check its work." },
  { id: "better-prompts", level: "201", title: "Writing better prompts", summary: "Give Copilot the context it needs to get it right the first time." },
  { id: "writing-tests", level: "201", title: "Writing tests", summary: "Generate unit tests, edge cases, and test data from your code." },
  { id: "explain-refactor", level: "201", title: "Explaining and refactoring code", summary: "Understand unfamiliar code and clean it up in small, safe steps." },
  { id: "code-review", level: "201", title: "Copilot code review", summary: "Get a first review on pull requests before a teammate looks." },
  { id: "agent-mode", level: "301", title: "Agent mode", summary: "Let Copilot plan and make multi-file changes in your editor, with you in control." },
  { id: "coding-agent", level: "301", title: "The coding agent", summary: "Assign an issue to Copilot and review the pull request it opens." },
  { id: "custom-instructions", level: "301", title: "Custom instructions", summary: "Teach Copilot your conventions, frameworks, and preferences per repository." },
  { id: "mcp", level: "301", title: "Extending Copilot with MCP", summary: "Connect Copilot to your tools and data through the Model Context Protocol." },
  { id: "premium-requests", level: "301", title: "Managing premium requests", summary: "How premium requests work and how to set budgets." },
  { id: "track-developers", level: "role", title: "Track: developers", summary: "The habits that save developers the most time, week one to week four." },
  { id: "track-team-leads", level: "role", title: "Track: team leads", summary: "Roll out to your team and track adoption." },
  { id: "track-admins", level: "role", title: "Track: admins", summary: "Seats, policies, and settings for your organization." },
  { id: "track-security", level: "role", title: "Track: security teams", summary: "Content exclusions, data handling, and audit logs." },
] as const;

export type GuideTopicId = (typeof GUIDE_TOPICS)[number]["id"];

export const GUIDE_TOPIC_IDS = GUIDE_TOPICS.map((t) => t.id) as [GuideTopicId, ...GuideTopicId[]];

export const GUIDE_TOPIC_BY_ID = Object.fromEntries(GUIDE_TOPICS.map((t) => [t.id, t])) as Record<
  GuideTopicId,
  (typeof GUIDE_TOPICS)[number]
>;
