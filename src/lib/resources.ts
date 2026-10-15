import type { GuideTopicId } from "./guide-topics";
import type { Stage } from "./schemas";

// Curated official resources (SPEC rule 2). Every entry comes from an allowed official
// source and is re-checked by `npm run check:links`: the page must load, stay on an
// allowed host, and match its stored title; videos must be on GitHub's own channel.
// Claude picks from these keys when it builds an account (Phase 6) and cites them when
// it answers in Ask (Phase 5), so it never has to invent a URL.

export const CHECKED_ON = "2026-10-15";

export const ALLOWED_HOSTS = ["docs.github.com", "github.blog", "resources.github.com", "www.youtube.com"] as const;

export type DocLink = { title: string; url: string; summary: string };
export type Video = { title: string; url: string; minutes: number; published: string };

const docs = (path: string) => `https://docs.github.com${path}`;
const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const DOC_CATALOG = {
  // Getting started
  "ide-quickstart": {
    title: "Quickstart for using GitHub Copilot in your IDE",
    url: docs("/en/copilot/get-started/quickstart-for-using-github-copilot-in-your-ide"),
    summary: "Install Copilot and get your first suggestions and chat answers in a few minutes.",
  },
  "install-extension": {
    title: "Installing the GitHub Copilot extension in your environment",
    url: docs("/en/copilot/how-tos/copilot-in-your-ide/set-up-copilot/install-copilot-extension"),
    summary: "Step-by-step install for VS Code, JetBrains, Visual Studio, and other editors.",
  },
  "about-copilot": {
    title: "About GitHub Copilot",
    url: docs("/en/copilot/get-started/about-github-copilot"),
    summary: "What Copilot can do across your editor, the command line, and GitHub.",
  },
  "best-practices": {
    title: "Best practices for using GitHub Copilot",
    url: docs("/en/copilot/get-started/best-practices"),
    summary: "Where Copilot helps most, where to check its work, and how to give it good context.",
  },
  "responsible-use-inline": {
    title: "Application card: GitHub Copilot inline suggestions",
    url: docs("/en/copilot/responsible-use/inline-suggestions"),
    summary: "How inline suggestions work, their limits, and how to use them well.",
  },
  // Chat and prompting
  "chat-in-ide": {
    title: "Getting started with prompts for GitHub Copilot Chat in your IDE",
    url: docs("/en/copilot/how-tos/copilot-in-your-ide/chat-with-copilot/get-started-with-chat-in-your-ide"),
    summary: "Ask Copilot Chat about your code, get explanations, and fix errors.",
  },
  "chat-cheat-sheet": {
    title: "GitHub Copilot Chat cheat sheet",
    url: docs("/en/copilot/reference/chat-cheat-sheet"),
    summary: "Slash commands, chat variables, and shortcuts on one page.",
  },
  "prompt-engineering": {
    title: "Prompt engineering for GitHub Copilot Chat",
    url: docs("/en/copilot/concepts/prompting/prompt-engineering"),
    summary: "How to write prompts that give Copilot the context it needs.",
  },
  // Everyday use
  "write-tests": {
    title: "Writing tests with GitHub Copilot",
    url: docs("/en/copilot/tutorials/write-tests"),
    summary: "Use Copilot to write unit and integration tests for your code.",
  },
  "generate-unit-tests": {
    title: "Generating unit tests",
    url: docs("/en/copilot/tutorials/copilot-cookbook/testing-code/generate-unit-tests"),
    summary: "A worked example of generating unit tests and edge cases with Copilot Chat.",
  },
  "explore-codebase": {
    title: "Using GitHub Copilot to explore a codebase",
    url: docs("/en/copilot/tutorials/explore-a-codebase"),
    summary: "Get oriented in unfamiliar code, which is especially useful for new hires.",
  },
  "refactor-cookbook": {
    title: "Refactor code",
    url: docs("/en/copilot/tutorials/copilot-cookbook/refactor-code"),
    summary: "Examples for improving readability, simplifying design, and modernizing code.",
  },
  "reduce-tech-debt": {
    title: "Using GitHub Copilot to reduce technical debt",
    url: docs("/en/copilot/tutorials/reduce-technical-debt"),
    summary: "Chip away at legacy code and technical debt with Copilot's help.",
  },
  "code-review": {
    title: "Using GitHub Copilot code review",
    url: docs("/en/copilot/how-tos/use-copilot-agents/use-code-review"),
    summary: "Ask Copilot to review a pull request or your changes in the editor.",
  },
  "review-ai-code": {
    title: "Review AI-generated code",
    url: docs("/en/copilot/tutorials/review-ai-generated-code"),
    summary: "How to review code Copilot wrote before it ships.",
  },
  // Agents and customization
  "agent-mode": {
    title: "Using agent mode in your IDE",
    url: docs("/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode"),
    summary: "Let Copilot plan and make multi-file changes in your editor while you review.",
  },
  "cloud-agent": {
    title: "Concepts for GitHub Copilot cloud agent",
    url: docs("/en/copilot/concepts/agents/cloud-agent"),
    summary: "Hand a task to Copilot on GitHub and review the pull request it opens.",
  },
  "cloud-agent-best-results": {
    title: "Best practices for using GitHub Copilot to work on tasks",
    url: docs("/en/copilot/tutorials/cloud-agent/get-the-best-results"),
    summary: "How to scope tasks and write issues the cloud agent handles well.",
  },
  "repo-instructions": {
    title: "Adding repository custom instructions for GitHub Copilot",
    url: docs("/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions"),
    summary: "Add a .github/copilot-instructions.md file so Copilot follows your conventions.",
  },
  "ide-instructions": {
    title: "Adding repository custom instructions for GitHub Copilot in your IDE",
    url: docs(
      "/en/copilot/how-tos/copilot-in-your-ide/customize-copilot/configure-custom-instructions/add-repository-instructions-in-your-ide",
    ),
    summary: "Set up and use repository custom instructions from your editor.",
  },
  "mcp-about": {
    title: "About Model Context Protocol (MCP)",
    url: docs("/en/copilot/concepts/context/mcp"),
    summary: "How MCP connects Copilot to your other tools and data.",
  },
  "mcp-extend-chat": {
    title: "Extending GitHub Copilot Chat with Model Context Protocol (MCP) servers",
    url: docs(
      "/en/copilot/how-tos/copilot-in-your-ide/customize-copilot/extend-copilot-with-tools-and-context/extend-copilot-chat-with-mcp",
    ),
    summary: "Add MCP servers to Copilot Chat in your editor.",
  },
  // Billing, budgets, and adoption
  "ai-credits": {
    title: "Usage-based billing for organizations and enterprises",
    url: docs("/en/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing"),
    summary: "How AI credits work, what's included per seat, and what happens past the pool.",
  },
  budgets: {
    title: "Budgets for usage-based billing",
    url: docs("/en/copilot/concepts/billing-and-usage/organizations-and-enterprises/budgets"),
    summary: "User, cost-center, organization, and enterprise budgets, and how they interact.",
  },
  "budget-controls": {
    title: "Getting started with budget controls",
    url: docs("/en/copilot/tutorials/budgets/getting-started-with-budget-controls"),
    summary: "A walkthrough for setting your first Copilot budgets.",
  },
  "drive-adoption": {
    title: "Driving GitHub Copilot adoption in your company",
    url: docs("/en/copilot/tutorials/roll-out-at-scale/enable-developers/drive-adoption"),
    summary: "GitHub's playbook for getting developers using Copilot every week.",
  },
  "measure-success": {
    title: "Measuring the success of a GitHub Copilot trial",
    url: docs("/en/copilot/tutorials/roll-out-at-scale/measure-success"),
    summary: "Which metrics to track and how to show results to leadership.",
  },
  "usage-metrics": {
    title: "GitHub Copilot usage metrics",
    url: docs("/en/copilot/concepts/billing-and-usage/copilot-usage-metrics/copilot-metrics"),
    summary: "What Copilot usage metrics measure and where to find them.",
  },
  "view-usage": {
    title: "Viewing the Copilot usage metrics dashboard",
    url: docs("/en/copilot/how-tos/administer-copilot/view-usage-and-adoption"),
    summary: "See active users and adoption trends for your organization or enterprise.",
  },
  // Admin and security
  "setup-org": {
    title: "Setting up GitHub Copilot for your organization",
    url: docs("/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-organization"),
    summary: "Enable Copilot, set policies, and grant access to members.",
  },
  "org-policies": {
    title: "Managing policies and features for GitHub Copilot in your organization",
    url: docs("/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies"),
    summary: "Turn Copilot features and models on or off for your organization.",
  },
  "enterprise-policies": {
    title: "Managing policies and features for GitHub Copilot in your enterprise",
    url: docs("/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies"),
    summary: "Enterprise-wide Copilot policies, including suggestions that match public code.",
  },
  "seat-assignment": {
    title: "GitHub Copilot seat assignment",
    url: docs("/en/copilot/reference/copilot-billing/seat-assignment"),
    summary: "How seats are assigned, billed, and removed.",
  },
  "remind-inactive": {
    title: "Reminding inactive users to use their GitHub Copilot license",
    url: docs("/en/copilot/tutorials/roll-out-at-scale/assign-licenses/remind-inactive-users"),
    summary: "Find inactive seats and nudge people before reassigning them.",
  },
  "content-exclusion-about": {
    title: "Content exclusion for GitHub Copilot",
    url: docs("/en/copilot/concepts/security-governance-and-network-settings/content-exclusion"),
    summary: "What content exclusion does, and what it doesn't cover.",
  },
  "content-exclusion-howto": {
    title: "Excluding content from GitHub Copilot",
    url: docs("/en/copilot/how-tos/configure-content-exclusion/exclude-content-from-copilot"),
    summary: "Exclude repositories or paths in repository, organization, or enterprise settings.",
  },
  "audit-logs": {
    title: "Reviewing audit logs for GitHub Copilot",
    url: docs("/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs"),
    summary: "Track changes to Copilot settings, policies, and licenses, plus agent activity.",
  },
  "approval-resources": {
    title: "Resources for getting approval of GitHub Copilot",
    url: docs("/en/copilot/tutorials/roll-out-at-scale/govern-at-scale/resources-for-approval"),
    summary: "Terms, data protection, and trust center links to send to legal and security teams.",
  },
  "model-hosting": {
    title: "Hosting of models for GitHub Copilot",
    url: docs("/en/copilot/reference/ai-models/model-hosting"),
    summary: "Where models run and how data is handled, including training commitments.",
  },
  "matching-code": {
    title: "Finding public code that matches GitHub Copilot suggestions",
    url: docs("/en/copilot/how-tos/copilot-in-your-ide/copilot-for-common-tasks/find-matching-code"),
    summary: "How code referencing shows when a suggestion matches public code.",
  },
  "speed-up-dev": {
    title: "Speeding up development work with GitHub Copilot",
    url: docs("/en/copilot/tutorials/speed-up-development-work"),
    summary: "Everyday habits that save developers the most time.",
  },
} as const satisfies Record<string, DocLink>;

export type DocKey = keyof typeof DOC_CATALOG;
export const DOC_KEYS = Object.keys(DOC_CATALOG) as [DocKey, ...DocKey[]];

export function docLinks(keys: readonly string[] | null | undefined): DocLink[] {
  // Unknown keys are skipped, so stale data can never render a broken link.
  return (keys ?? []).flatMap((k) => (k in DOC_CATALOG ? [DOC_CATALOG[k as DocKey]] : []));
}

/** Official docs for each guide topic, best first. */
export const GUIDE_DOCS: Record<GuideTopicId, DocKey[]> = {
  "install-ide": ["ide-quickstart", "install-extension"],
  "first-suggestions": ["ide-quickstart", "about-copilot"],
  "using-chat": ["chat-in-ide", "chat-cheat-sheet"],
  "good-and-bad-at": ["best-practices", "responsible-use-inline"],
  "better-prompts": ["prompt-engineering", "best-practices"],
  "writing-tests": ["write-tests", "generate-unit-tests"],
  "explain-refactor": ["explore-codebase", "refactor-cookbook", "reduce-tech-debt"],
  "code-review": ["code-review", "review-ai-code"],
  "agent-mode": ["agent-mode"],
  "cloud-agent": ["cloud-agent", "cloud-agent-best-results"],
  "custom-instructions": ["repo-instructions", "ide-instructions"],
  mcp: ["mcp-about", "mcp-extend-chat"],
  "ai-credits": ["ai-credits", "budgets", "budget-controls"],
  "track-developers": ["best-practices", "speed-up-dev", "chat-cheat-sheet"],
  "track-team-leads": ["drive-adoption", "measure-success", "view-usage"],
  "track-admins": ["setup-org", "org-policies", "seat-assignment"],
  "track-security": ["content-exclusion-about", "audit-logs", "approval-resources"],
};

/** Videos from GitHub's official YouTube channel only. Titles are exactly as published. */
export const VIDEO_GROUPS: {
  id: string;
  title: string;
  description: string;
  /** Stages where this group goes in the "Send to my devs" message. */
  stages: Stage[];
  videos: Video[];
  /** Official docs to read alongside, for groups with few videos. */
  articles: DocKey[];
}[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Installing Copilot and your first suggestions.",
    stages: ["pilot", "onboarding", "rolling_out"],
    videos: [
      { title: "Getting started with GitHub Copilot | Tutorial", url: yt("n0NlxUyA7FI"), minutes: 11, published: "2025-03-03" },
    ],
    articles: ["ide-quickstart"],
  },
  {
    id: "chat",
    title: "Copilot Chat",
    description: "Asking questions, explaining code, and fixing errors.",
    stages: ["pilot", "onboarding", "rolling_out"],
    videos: [
      { title: "GitHub Copilot 101 - Essential features | Tutorial", url: yt("b5xcWdzAB5c"), minutes: 11, published: "2025-03-17" },
    ],
    articles: ["chat-in-ide"],
  },
  {
    id: "agents",
    title: "Agent mode and the cloud agent",
    description: "Multi-file changes in your editor, and handing tasks to Copilot in the cloud.",
    stages: ["pilot", "rolling_out"],
    videos: [
      { title: "Put GitHub Copilot cloud agent to work - Research, plan and code", url: yt("pn5x1CamKVY"), minutes: 1, published: "2026-04-01" },
      { title: "When to use GitHub Copilot coding agent versus agent mode", url: yt("a1BR6K3E4zs"), minutes: 3, published: "2025-07-29" },
      {
        title: "Run code generation in the background with GitHub Copilot coding agents | GitHub Checkout",
        url: yt("S1ch_6fjp5M"),
        minutes: 13,
        published: "2026-02-18",
      },
      { title: "Fixing merge conflicts and PRs with Copilot cloud agent | GitHub Checkout", url: yt("ws_3hiXLKjQ"), minutes: 12, published: "2026-04-23" },
    ],
    articles: [],
  },
  {
    id: "code-review",
    title: "Code review",
    description: "Getting a first review on your pull requests.",
    stages: ["pilot", "rolling_out"],
    videos: [
      { title: "Catching complex bugs with GitHub Copilot medium depth code review", url: yt("LGQOu08rR_o"), minutes: 2, published: "2026-07-03" },
      { title: "Using GitHub Copilot for code reviews: from VS Code to github.com", url: yt("xf65vxjNWdk"), minutes: 2, published: "2025-07-26" },
      { title: "How to use GitHub Copilot for code reviews in pull requests", url: yt("jYW9MorrE_w"), minutes: 1, published: "2025-08-06" },
    ],
    articles: [],
  },
  {
    id: "admin",
    title: "Admin setup",
    description: "Seats, policies, budgets, and settings for admins.",
    // For admins, so never included in the message to developers.
    stages: [],
    videos: [
      { title: "How to manage Copilot spend across your enterprise", url: yt("AzuGe_cuCvg"), minutes: 1, published: "2026-07-08" },
      {
        title: "Best practices for administering GitHub Copilot with Luis Pujols | Beyond the Commit",
        url: yt("CwP81uyISuc"),
        minutes: 10,
        published: "2025-06-19",
      },
    ],
    articles: ["setup-org"],
  },
];

/** Every URL in the library, for the link checker and the allowlist guard. */
export function allResources(): { kind: "doc" | "video"; key: string; title: string; url: string }[] {
  return [
    ...Object.entries(DOC_CATALOG).map(([key, d]) => ({ kind: "doc" as const, key, title: d.title, url: d.url })),
    ...VIDEO_GROUPS.flatMap((g) => g.videos.map((v) => ({ kind: "video" as const, key: g.id, title: v.title, url: v.url }))),
  ];
}

// Guard: no link outside the allowed official hosts can make it into the app.
for (const r of allResources()) {
  const host = new URL(r.url).host;
  if (!(ALLOWED_HOSTS as readonly string[]).includes(host)) {
    throw new Error(`Resource "${r.title}" is not on an allowed official host: ${r.url}`);
  }
}
