// Guide topics from SPEC section 6. Official doc and video links get attached in Phase 4,
// after each URL is checked.

export const GUIDE_TOPICS = [
  { id: "install-ide", level: "101", title: "Install in your IDE" },
  { id: "first-suggestions", level: "101", title: "Your first suggestions" },
  { id: "using-chat", level: "101", title: "Using Copilot Chat" },
  { id: "good-and-bad-at", level: "101", title: "What Copilot is good and bad at" },
  { id: "better-prompts", level: "201", title: "Writing better prompts" },
  { id: "writing-tests", level: "201", title: "Writing tests" },
  { id: "explain-refactor", level: "201", title: "Explaining and refactoring code" },
  { id: "code-review", level: "201", title: "Copilot code review" },
  { id: "agent-mode", level: "301", title: "Agent mode" },
  { id: "coding-agent", level: "301", title: "The coding agent" },
  { id: "custom-instructions", level: "301", title: "Custom instructions" },
  { id: "mcp", level: "301", title: "Extending Copilot with MCP" },
  { id: "premium-requests", level: "301", title: "Managing premium requests" },
  { id: "track-developers", level: "role", title: "Track: developers" },
  { id: "track-team-leads", level: "role", title: "Track: team leads" },
  { id: "track-admins", level: "role", title: "Track: admins" },
  { id: "track-security", level: "role", title: "Track: security teams" },
] as const;

export type GuideTopicId = (typeof GUIDE_TOPICS)[number]["id"];

export const GUIDE_TOPIC_IDS = GUIDE_TOPICS.map((t) => t.id) as [GuideTopicId, ...GuideTopicId[]];
