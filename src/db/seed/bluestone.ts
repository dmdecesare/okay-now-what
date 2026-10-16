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
        docs: ["repo-instructions", "ide-instructions"],
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
        docs: ["enterprise-policies", "matching-code"],
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
        docs: ["view-usage", "usage-metrics"],
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
        docs: ["remind-inactive", "seat-assignment"],
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
        id: "ai-credit-budget",
        docs: ["budgets", "ai-credits"],
        title: "Check AI credit budgets",
        why: "AI credits power Chat, agent mode, and the cloud agent. A budget set too low can quietly block teams that want to use them.",
        steps: [
          "Review AI credit usage by team in billing",
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
          a: "No. GitHub's documentation says: \"GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models.\" Security reviewed this during the purchase.",
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
      { topic: "ai-credits", why: "Make sure budgets aren't holding teams back" },
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
    { monthsAgo: 2, seat: 27300, usage: 2900 },
    { monthsAgo: 1, seat: 27300, usage: 2650 },
    { monthsAgo: 0, seat: 27300, usage: 2380 },
  ],

  questions: [
    {
      question: "Our claims team says suggestions are bad on old Java. Any tips?",
      answer:
        "Three things help most. First, add custom instructions to the claims repository describing your Java version, frameworks, and conventions. Second, keep related files open so Copilot has context. Third, use Copilot Chat to explain old code before changing it, and make changes in small steps with tests.",
      topic: "usage",
      daysAgo: 6,
      sources: ["repo-instructions", "explore-codebase"],
    },
    {
      question: "How do I set custom instructions for one repo?",
      answer:
        "Add a file named .github/copilot-instructions.md to that repository. Write plain-language guidance like your Java version, frameworks, build tool, and coding conventions. Copilot Chat and agent mode will use it for work in that repository.",
      topic: "setup",
      daysAgo: 4,
      sources: ["repo-instructions"],
    },
  ],

  learning: [
    { name: "Omar Z.", role: "developer", challenges: ["install", "first_chat", "write_tests", "refactor", "custom_instructions", "agent_task", "code_review"], daysAgo: 9 },
    { name: "Grace L.", role: "developer", challenges: ["install", "first_chat", "write_tests", "refactor", "code_review", "agent_task"], daysAgo: 12 },
    { name: "Pete M.", role: "developer", challenges: ["install", "first_chat", "write_tests", "refactor", "code_review"], daysAgo: 15 },
    { name: "Elena R.", role: "team_lead", challenges: ["install", "first_chat", "drive_adoption", "view_usage"], daysAgo: 30 },
    { name: "Max D.", role: "admin", challenges: ["setup_org", "policies", "budgets", "reengage"], daysAgo: 20 },
    { name: "Hana K.", role: "developer", challenges: ["install", "first_chat", "write_tests", "code_review"], daysAgo: 10 },
    { name: "Jon V.", role: "developer", challenges: ["install", "first_chat", "refactor"], daysAgo: 14 },
    { name: "Lia C.", role: "developer", challenges: ["install", "first_chat", "write_tests"], daysAgo: 18 },
    { name: "Kim P.", role: "security", challenges: ["data_handling", "public_code"], daysAgo: 40 },
    { name: "Rosa F.", role: "developer", challenges: ["install", "first_chat"], daysAgo: 25 },
    { name: "Ted Y.", role: "developer", challenges: ["install"], daysAgo: 35 },
    { name: "Al G.", role: "developer", challenges: ["install"], daysAgo: 28 },
  ],
  review: {
    status: "published",
    content: {
      title: "Copilot at Bluestone Assurance: the first 75 days",
      period: "First 75 days",
      executiveSummary:
        "Copilot is now part of daily work across most of Bluestone's engineering org, with 497 of 700 developers active. Policy admin and data and analytics have made it a weekly habit on nearly every seat, and the first monthly update reached the CIO on schedule. Claims platform adoption has dipped, so the next quarter focuses on a tailored plan for that team and its legacy Java modernization.",
      goals: [
        {
          goal: "Modernize the legacy claims system",
          status: "in_progress",
          evidence: "A claims modernization pilot with agent mode is planned, and custom instructions for the claims repo are under way.",
        },
        {
          goal: "Adoption across the whole engineering org",
          status: "on_track",
          evidence: "497 of 700 seats are active (71%), and two teams are above 90%.",
        },
        {
          goal: "A monthly adoption update for the CIO",
          status: "achieved",
          evidence: "The first monthly update was delivered on schedule.",
        },
      ],
      adoptionHighlights: [
        "Policy admin: 138 of 150 developers active each week",
        "Data and analytics: 102 of 110 developers active each week",
        "Digital: 90 of 120 developers active each week",
        "12 developers have started a learning path, with 42 challenges completed",
      ],
      wins: [
        { title: "Every seat assigned in week one", detail: "All 700 seats went out by team, so adoption can be followed team by team." },
        { title: "Security questions settled early", detail: "The public code filter and IP questions were resolved within the first two weeks." },
        { title: "Two teams set the standard", detail: "Policy admin and data and analytics use Copilot weekly across nearly every seat, a model for the rest of the org." },
      ],
      nextQuarter: [
        {
          title: "Hands-on session for the claims team",
          detail: "A working session on their own legacy Java, using Chat and repository instructions.",
          owner: "Claims platform team lead",
          timing: "Next two weeks",
        },
        {
          title: "Repository instructions for every team",
          detail: "Start with the claims repo, then roll the pattern out org-wide.",
          owner: "Platform team",
          timing: "This month",
        },
        {
          title: "Claims modernization pilot with agent mode",
          detail: "Small, tested refactors of legacy Java, measured against today's baseline.",
          owner: "Elena Ruiz",
          timing: "Within 45 days",
        },
        {
          title: "Results review with leadership",
          detail: "Progress against each goal, with the numbers from your portal.",
          owner: "Your GitHub account team",
          timing: "Next quarter",
        },
      ],
      asks: [
        "Help us find a Copilot advocate inside claims or platform engineering",
        "Join the kickoff for the claims modernization pilot",
        "Share the monthly update with the wider engineering leadership team",
      ],
    },
  },
  calls: [
    {
      daysAgo: 25,
      notes:
        "monthly sync w/ Elena. policy admin + data teams flying. claims lead pushing back, says old java suggestions are junk. Elena maybe moving to reorg project Q4. agreed: claims session + custom instructions before end of month.",
      summary:
        "Monthly sync with Elena. Policy admin and data are doing well, but the claims team lead is pushing back on suggestions for legacy Java. We agreed to run a claims session and ship custom instructions before month end, and both are now overdue.",
    },
  ],
  helpRequests: [
    {
      kind: "blocker",
      message: "Suggestions on our legacy claims framework are mostly wrong. Can someone show us how to give Copilot more context about it?",
      name: "Marco, claims platform",
      daysAgo: 3,
      status: "open",
    },
  ],
  pulse: [
    [5, 0],
    [4, 1],
    [4, 2],
    [5, 3],
    [3, 4],
    [4, 5],
    [2, 6],
    [4, 7],
    [5, 8],
    [3, 9],
    [4, 10],
    [2, 11],
    [4, 12],
    [5, 13],
    [4, 15],
    [3, 16],
    [2, 17],
    [4, 18],
    [5, 19],
    [3, 20],
    [4, 21],
    [1, 22],
    [4, 23],
    [2, 24],
    [5, 25],
    [3, 26],
    [4, 27],
    [2, 4, "Suggestions don't understand our legacy claims framework."],
    [1, 11, "Haven't had time to try it since the reorg started."],
    [3, 15, "Would love a custom instructions file for the claims repo."],
  ],
  insights: {
    call_brief: {
      headline:
        "Two teams are thriving, but the claims team has fallen to 28% active and Elena has been quiet for 22 days.",
      whatChanged: [
        "Overall activity is down to 71% from an 84% peak.",
        "Claims platform fell to 28% active, down from 75% at its peak.",
        "The claims enablement session and the custom instructions rollout are both overdue.",
        "The claims team asked for tips on Copilot suggestions for legacy Java.",
      ],
      openQuestions: [
        "Is Elena still the right champion if she takes on the Q4 reorg?",
        "Who on the claims team would co-host a session on their own legacy Java?",
        "Has the custom instructions file for the claims repo been started?",
      ],
      risks: [
        "The claims system is the main reason for the purchase, so low claims adoption weakens the renewal story.",
        "Additional usage is down 18% over two months.",
      ],
      opportunities: [
        "Policy admin (92%) and data and analytics (93%) are near full adoption and make strong proof points for the CIO.",
        "A claims modernization pilot with agent mode is already on the plan.",
      ],
      talkTrack: [
        { topic: "Lead with the wins", say: "Start with policy admin and data and analytics, both above 90% active, so the CIO update opens with good news." },
        { topic: "Name the claims problem", say: "Share that claims dropped to 28% active and ask Elena what she is hearing from the team lead." },
        { topic: "Fix the first impression", say: "Offer to ship custom instructions for the claims repo before rescheduling their session on legacy Java." },
        { topic: "A second champion", say: "Ask who on the claims or platform team could help drive adoption while Elena is busy with the reorg." },
      ],
      asks: ["A new date for the claims enablement session", "A named second champion", "20 minutes with Elena before the next CIO update"],
    },
    expansion_pitch: {
      headline: "Use the policy admin and data wins to steady the account first",
      why: "Policy admin and data and analytics are both above 90% active, so the value is real where teams have leaned in. With claims down and renewal about nine months out, these wins are the proof point for the CIO, not an upsell yet.",
      proposal:
        "Hold seat expansion until the claims team recovers. Propose the claims modernization pilot with agent mode as the next step, using what worked for policy admin.",
      talkingPoints: [
        "Policy admin is 138 of 150 active (92%).",
        "Data and analytics is 102 of 110 active (93%).",
        "Once claims recovers, the same playbook extends to its 160 seats.",
      ],
      nextStep: "Ask Elena to lead her next CIO update with the policy admin and data team wins.",
    },
    risk_play: {
      reason: "Claims team adoption collapsed, and Elena has been quiet for 22 days.",
      explanation:
        "Seat activity fell from an 84% peak to 71%, almost all of it on the claims platform team (75% down to 28%). Additional usage is down 18% over two months, both overdue milestones are claims team work, and Elena may be pulled into a Q4 reorg. Renewal is about nine months out, so this is the window to fix it.",
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
