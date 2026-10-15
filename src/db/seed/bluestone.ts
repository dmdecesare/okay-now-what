import { teamsFrom, type SeedAccount } from "./types";

const TEAMS: [string, number][] = [
  ["Claims platform", 160],
  ["Policy admin", 150],
  ["Data and analytics", 110],
  ["Billing", 90],
  ["Digital", 120],
  ["Platform", 70],
];

// Weekly snapshots: ramp to an 84% peak around day 42, then the claims team falls off.
const USAGE_BY_DAY: [day: number, active: number[]][] = [
  [14, [60, 70, 50, 30, 45, 25]],
  [21, [85, 95, 70, 40, 60, 35]],
  [28, [105, 115, 85, 52, 75, 44]],
  [35, [118, 128, 95, 63, 90, 52]],
  [42, [120, 135, 100, 70, 103, 60]],
  [49, [110, 136, 101, 70, 104, 60]],
  [56, [92, 137, 101, 69, 102, 59]],
  [63, [74, 137, 102, 68, 100, 58]],
  [70, [56, 138, 102, 67, 93, 55]],
  [75, [45, 138, 102, 66, 90, 56]],
];

const STAGE_DAY = 75;

export const bluestone: SeedAccount = {
  slug: "bluestone-assurance",
  name: "Bluestone Assurance",
  industry: "Insurtech",
  employees: 2000,
  seats: 700,
  stage: "rolling_out",
  stageDay: STAGE_DAY,
  renewalInDays: 270,
  championLastVisitDaysAgo: 22,
  dealNotes: `Elena + CIO bought for whole eng org. big goal is modernizing legacy claims system (lots of old Java). claims team lead was skeptical from day one. Elena wants a monthly adoption update she can forward to CIO. security asked about public code filter + IP indemnity, resolved. heard Elena may be taking on a bigger reorg project in Q4, bandwidth risk. renewal in ~9 months.`,

  profile: {
    summary:
      "700 seats across the whole engineering org, day 75. The big goal is modernizing the legacy Java claims system, but the claims team has dropped off and Elena may lose bandwidth to a Q4 reorg. Renewal in about nine months.",
    goals: [
      {
        goal: "Modernize the legacy claims system",
        inTheirWords: "Big goal is modernizing the legacy claims system. Lots of old Java.",
      },
      {
        goal: "Adoption across the whole engineering org",
        inTheirWords: "Elena and the CIO bought it for the whole eng org.",
      },
      {
        goal: "A monthly adoption update for the CIO",
        inTheirWords: "Elena wants a monthly adoption update she can forward to the CIO.",
      },
    ],
    champion: {
      name: "Elena Ruiz",
      title: "Senior Director of Engineering",
      notes:
        "Bought for the whole org with the CIO. May be taking on a bigger reorg project in Q4, so make every touchpoint easy to forward and quick to act on.",
    },
    stakeholders: [
      {
        name: null,
        title: "CIO",
        notes: "Co-sponsor of the purchase. Gets Elena's monthly adoption update.",
      },
      {
        name: null,
        title: "Claims platform team lead",
        notes: "Skeptical from day one. The claims team owns the legacy Java system that's the main reason for the purchase.",
      },
      {
        name: null,
        title: "Security",
        notes: "Asked about the public code filter and IP indemnity. Both resolved.",
      },
    ],
    concerns: [
      {
        concern: "Claims team lead is skeptical",
        raisedBy: "Claims platform team",
        response:
          "Run a claims-specific session on legacy Java: custom instructions for the repo, Chat to explain old code, and agent mode for small, tested refactors.",
      },
      {
        concern: "Public code filter and IP indemnity",
        raisedBy: "Security",
        response: "Resolved during the deal. Keep the public code filter set to Blocked and documented.",
      },
      {
        concern: "Champion bandwidth in Q4",
        raisedBy: "Account team",
        response:
          "Identify a second champion in the claims or platform team and keep Elena's monthly update ready to forward.",
      },
    ],
    successCriteria: [],
    thisWeek: [
      "Reschedule the claims team enablement session",
      "Add custom instructions to the main claims repository",
      "Send this month's adoption update to the CIO",
    ],
    setupSteps: [
      {
        id: "custom-instructions",
        title: "Add custom instructions for legacy Java repos",
        why: "Suggestions on old Java get much better when Copilot knows your Java version, frameworks, and conventions.",
        steps: [
          "Create a .github/copilot-instructions.md file in the claims repository",
          "Describe the Java version, frameworks, build tool, and coding conventions",
          "Add any patterns to avoid, like deprecated internal libraries",
          "Ask the claims team to try the same tasks again and compare",
        ],
        audience: "team_lead",
      },
      {
        id: "public-code-filter",
        title: "Keep the public code filter on",
        why: "Security resolved this during the deal. Keep it documented so it stays that way.",
        steps: [
          "Confirm suggestions matching public code is set to Blocked in your Copilot policies",
          "Note the setting in your security documentation",
        ],
        audience: "admin",
      },
      {
        id: "metrics",
        title: "Use usage metrics for the monthly CIO update",
        why: "Elena wants a monthly update she can forward to the CIO without extra work.",
        steps: [
          "Pull weekly active users by team from Copilot usage metrics",
          "Highlight the strongest teams and the plan for the claims team",
          "Send it the first week of each month",
        ],
        audience: "team_lead",
      },
      {
        id: "seats",
        title: "Review inactive seats",
        why: "Inactive seats are the first thing finance asks about before renewal.",
        steps: [
          "List seats with no activity in the last 30 days",
          "Ask team leads to follow up before removing anyone",
          "Reassign unused seats to teams that need them",
        ],
        audience: "admin",
      },
      {
        id: "premium-budget",
        title: "Check premium request budgets",
        why: "Premium request use is falling, which usually means agent mode and Chat use are dropping too.",
        steps: [
          "Review premium request usage by team in billing",
          "Make sure budgets aren't blocking teams that want to use agent mode",
        ],
        audience: "admin",
      },
    ],
    championKit: {
      launchAnnouncement: `Subject: Getting more out of Copilot on legacy Java

Hi team,

We rolled out GitHub Copilot to all of engineering to help us move faster, especially on modernizing the claims system. Policy admin and data teams are seeing great results. Now we want to make it work just as well on our older Java code.

What's new:
1. Custom instructions are coming to the claims repository so Copilot understands our Java version and conventions
2. A hands-on session for the claims team on Chat, custom instructions, and agent mode
3. Short guides on our onboarding page for working with legacy code

If suggestions haven't been useful for you, we want to hear it. Tell us in #copilot.

Elena`,
      enablementAgenda: `Copilot for legacy Java: claims team session (60 minutes)

1. What we've heard from the claims team (10 min)
   Open discussion: where suggestions fall short
2. Custom instructions for the claims repo (15 min)
   Live: write the instructions file together
3. Chat for understanding old code (10 min)
   Explain a legacy class, trace a claim through the system
4. Agent mode for small, tested refactors (15 min)
   Extract a method, add tests, update a deprecated call
5. Next steps and Q&A (10 min)`,
      developerFaq: [
        {
          q: "Will this replace me?",
          a: "No. Copilot speeds up the repetitive parts so you can spend more time on design and on modernizing the claims system. You review and own every change.",
        },
        {
          q: "Is our code used for training?",
          a: "GitHub states that it does not use Copilot Business or Enterprise customers' code to train its models. Security reviewed this during the purchase.",
        },
        {
          q: "Why are suggestions weaker on old Java?",
          a: "Copilot works best with context. Custom instructions, open related files, and clear comments all help it understand older code and conventions.",
        },
        {
          q: "Can I use it to refactor legacy code safely?",
          a: "Yes, in small steps. Ask Copilot to write tests first, then make the change, then run the tests. Agent mode can handle multi-file changes, and you review everything before it merges.",
        },
        {
          q: "Where do I get help?",
          a: "Ask in #copilot or use the Ask tab on our onboarding page.",
        },
      ],
    },
    guides: [
      { topic: "custom-instructions", why: "The biggest fix for weak suggestions on old Java" },
      { topic: "explain-refactor", why: "Understanding and modernizing the legacy claims code" },
      { topic: "agent-mode", why: "Small, tested refactors across many files" },
      { topic: "better-prompts", why: "Better results on legacy code with better context" },
      { topic: "writing-tests", why: "A safety net before touching old code" },
      { topic: "track-team-leads", why: "Monthly adoption numbers for the CIO update" },
      { topic: "premium-requests", why: "Make sure budgets aren't holding teams back" },
    ],
  },

  milestones: [
    {
      title: "Kickoff with Elena and the CIO",
      description: "Rollout plan for the whole engineering org.",
      dueDay: 3,
      status: "done",
      completedDay: 2,
    },
    {
      title: "Org-wide seat assignment",
      description: "All 700 seats assigned by team.",
      dueDay: 7,
      status: "done",
      completedDay: 6,
      completedBy: "customer",
    },
    {
      title: "Security review: public code filter and IP indemnity",
      description: "Confirm settings and close out security's questions.",
      dueDay: 14,
      status: "done",
      completedDay: 12,
    },
    {
      title: "Policy admin and data team enablement",
      description: "Hands-on sessions for the first two teams.",
      dueDay: 30,
      status: "done",
      completedDay: 28,
      completedBy: "customer",
    },
    {
      title: "Claims team enablement session",
      description: "Hands-on session for the claims team on legacy Java.",
      dueDay: 60,
      status: "todo",
    },
    {
      title: "First monthly adoption update to the CIO",
      description: "Adoption by team, wins, and next steps.",
      dueDay: 62,
      status: "done",
      completedDay: 62,
      completedBy: "customer",
    },
    {
      title: "Custom instructions rollout",
      description: "Custom instructions in the claims and policy repositories.",
      dueDay: 65,
      status: "in_progress",
    },
    {
      title: "Claims modernization pilot with agent mode",
      description: "Pick one legacy claims module and modernize it with agent mode and tests.",
      dueDay: 90,
      status: "todo",
    },
    {
      title: "Value review ahead of renewal",
      description: "Adoption, modernization progress, and plan for the next year.",
      dueDay: 180,
      status: "todo",
    },
  ],

  usage: USAGE_BY_DAY.map(([day, active]) => ({
    daysAgo: STAGE_DAY - day,
    teams: teamsFrom(TEAMS, active),
  })),

  spend: [
    { monthsAgo: 2, seat: 27300, premium: 2900 },
    { monthsAgo: 1, seat: 27300, premium: 2650 },
    { monthsAgo: 0, seat: 27300, premium: 2380 },
  ],

  questions: [
    {
      question: "Our claims team says suggestions are bad on old Java. Any tips?",
      answer:
        "Three things help most. First, add custom instructions to the claims repository describing your Java version, frameworks, and conventions. Second, keep related files open so Copilot has context. Third, use Copilot Chat to explain old code before changing it, and make changes in small steps with tests.",
      topic: "usage",
      daysAgo: 6,
    },
    {
      question: "How do I set custom instructions for one repo?",
      answer:
        "Add a file named .github/copilot-instructions.md to that repository. Write plain-language guidance like your Java version, frameworks, build tool, and coding conventions. Copilot Chat and agent mode will use it for work in that repository.",
      topic: "setup",
      daysAgo: 4,
    },
  ],

  insights: {
    risk_play: {
      reason: "Claims team adoption collapsed, and Elena has been quiet for 22 days.",
      explanation:
        "Seat activity fell from an 84% peak to 71%, almost all of it on the claims platform team (75% down to 28%). Premium request spend is down 18% over two months, both overdue milestones are claims team work, and Elena may be pulled into a Q4 reorg. Renewal is about nine months out, so this is the window to fix it.",
      play: {
        title: "Win back the claims team",
        steps: [
          "Send Elena a short, forwardable update and ask for 20 minutes this week",
          "Ship custom instructions for the claims repo before the session, so the first impression changes",
          "Reschedule the claims enablement session with the team lead, focused on legacy Java",
          "Ask Elena to name a second champion on the claims or platform team",
          "Send the CIO update leading with the policy admin and data team wins",
        ],
      },
    },
    next_best_action: {
      actions: [
        {
          title: "Fix the claims team experience first",
          detail:
            "Claims platform is at 28% active, down from 75%. Custom instructions for the claims repo address their main complaint about old Java.",
        },
        {
          title: "Reschedule the claims enablement session",
          detail: "It's 15 days overdue. Run it with the claims team lead, using their own legacy code.",
        },
        {
          title: "Re-engage Elena",
          detail:
            "She hasn't opened the customer app in 22 days. Send a short update she can forward to the CIO, and ask for a second champion.",
        },
      ],
    },
    question_themes: {
      summary:
        "Both questions are about getting better results on legacy Java. They line up with the claims team's drop in usage.",
      themes: [
        { theme: "Legacy Java", count: 1, note: "Suggestions on old Java code are weak." },
        { theme: "Setup", count: 1, note: "How to add custom instructions for one repository." },
      ],
    },
  },
};
