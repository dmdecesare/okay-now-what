import { teamsFrom, type SeedAccount } from "./types";

const TEAMS: [string, number][] = [
  ["Lending platform", 140],
  ["Servicing", 110],
  ["Mobile", 80],
  ["Data and credit models", 90],
  ["Platform", 70],
  ["Internal tools", 60],
];

export const copperleaf: SeedAccount = {
  slug: "copperleaf-lending",
  name: "Copperleaf Lending",
  industry: "Digital lending",
  employees: 1400,
  seats: 550,
  stage: "onboarding",
  stageDay: 10,
  renewalInDays: 356,
  championLastVisitDaysAgo: 1,
  dealNotes: `Dan drove this, rolled out to 2 teams informally before buying. CISO concerned about loan decisioning repo + anything touching credit models, wants it excluded. regulators (state + CFPB exam stuff) came up, need audit story. dev ex team will run enablement but are 3 people. Dan's goal: every dev using it weekly by end of Q1, and onboarding new hires faster (ramp takes ~3 months now). CFO wants to see value at 6 months or they cut seats. mostly VS Code, some JetBrains.`,

  profile: {
    summary:
      "550 seats, day 10 of onboarding. Dan wants every developer using Copilot weekly by end of Q1. The CISO needs credit model code excluded and an audit story for regulators, and the CFO will review value at six months.",
    goals: [
      {
        goal: "Every developer using Copilot weekly by end of Q1",
        inTheirWords: "Every dev using it weekly by end of Q1.",
      },
      {
        goal: "Cut new hire ramp time",
        inTheirWords: "Onboarding new hires faster. Ramp takes about 3 months now.",
      },
      {
        goal: "Keep credit model and loan decisioning code out of Copilot",
        inTheirWords: "CISO wants the loan decisioning repo and anything touching credit models excluded.",
      },
      {
        goal: "Show clear value by month six",
        inTheirWords: "CFO wants to see value at 6 months or they cut seats.",
      },
    ],
    champion: {
      name: "Dan Okafor",
      title: "VP Engineering",
      notes:
        "Drove the purchase after an informal rollout to two teams. Wants weekly use across the org and faster new hire ramp. Give him numbers he can show the CFO.",
    },
    stakeholders: [
      {
        name: null,
        title: "CISO",
        notes: "Wants loan decisioning and credit model code excluded, and an audit story for state and CFPB exams.",
      },
      {
        name: null,
        title: "Head of Developer Experience",
        notes: "Their team of three runs enablement for 550 developers. Needs ready-made materials, not more work.",
      },
      {
        name: null,
        title: "CFO",
        notes: "Signed off on spend. Will review value at six months and cut seats if it isn't there.",
      },
    ],
    concerns: [
      {
        concern: "Credit model and loan decisioning code must stay out of Copilot",
        raisedBy: "CISO",
        response: "Set content exclusions for those repositories in week two and test them with the CISO's team.",
      },
      {
        concern: "Regulators will ask how AI is used in development",
        raisedBy: "CISO",
        response:
          "Build an audit story: written policies, audit log for Copilot admin activity, content exclusions, and usage metrics.",
      },
      {
        concern: "Enablement team is only three people",
        raisedBy: "Head of Developer Experience",
        response: "Give DevEx a ready-to-run champion kit and self-serve guides so they lead sessions instead of writing them.",
      },
      {
        concern: "Value has to show up by month six",
        raisedBy: "CFO",
        response: "Track weekly active use and new hire ramp from day one, with a value review scheduled before month six.",
      },
    ],
    successCriteria: [],
    thisWeek: [
      "Finish content exclusions for the loan decisioning and credit model repos",
      "Book the DevEx train-the-trainer session",
      "Send the launch announcement to the next three teams",
    ],
    setupSteps: [
      {
        id: "exclude-credit",
        title: "Exclude loan decisioning and credit model code",
        why: "The CISO asked for these repositories to be kept out of Copilot.",
        steps: [
          "List the loan decisioning repo and every repo that touches credit models with the CISO's team",
          "Add them as content exclusions in your organization's Copilot settings",
          "Test it: open an excluded file in VS Code and JetBrains and confirm there are no suggestions",
        ],
        audience: "security",
      },
      {
        id: "audit-story",
        title: "Build the audit story for regulators",
        why: "State and CFPB exams came up. The CISO needs to show how AI use is governed.",
        steps: [
          "Write down your Copilot policies and who approved them",
          "Use the enterprise audit log to track Copilot admin activity like policy changes and seat assignments",
          "Keep a record of content exclusions and when they changed",
          "Export usage metrics monthly as evidence of controlled rollout",
        ],
        audience: "security",
      },
      {
        id: "policies",
        title: "Set Copilot policies and the public code filter",
        why: "Clear, documented settings are the base of the audit story.",
        steps: [
          "Review each Copilot policy in your organization settings and decide on/off",
          "Set suggestions matching public code to Blocked",
          "Record each decision for the CISO",
        ],
        audience: "admin",
      },
      {
        id: "seats",
        title: "Manage seats for 550 developers",
        why: "Every developer needs a seat to hit Dan's weekly-use goal.",
        steps: [
          "Assign seats by team so you can track adoption team by team",
          "Add new hires to Copilot as part of their first-day setup",
          "Review inactive seats monthly before the CFO review",
        ],
        audience: "admin",
      },
      {
        id: "ide-setup",
        title: "Standard setup for VS Code and JetBrains",
        why: "Most teams use VS Code, and some use JetBrains. One guide each keeps DevEx out of support tickets.",
        steps: [
          "Share the VS Code install guide with every team",
          "Share the JetBrains guide with the teams that use it",
          "Add both to the new hire onboarding checklist",
        ],
        audience: "team_lead",
      },
      {
        id: "metrics",
        title: "Turn on usage metrics",
        why: "Weekly active use is Dan's goal and the CFO's evidence.",
        steps: [
          "Enable Copilot usage metrics for the organization",
          "Review weekly active users by team every Monday",
          "Flag teams under 50% weekly active to DevEx for a follow-up session",
        ],
        audience: "team_lead",
      },
    ],
    championKit: {
      launchAnnouncement: `Subject: GitHub Copilot is live for every engineer

Hi all,

Copilot is now available to every engineer at Copperleaf. Two teams have been using it for a few months, and they've seen real time savings on tests, refactors, and getting up to speed on unfamiliar code.

Get started in 10 minutes:
1. Install Copilot in VS Code or JetBrains (guides on our onboarding page)
2. Try it on today's work: write a test, explain a function, or draft a small change
3. Join a DevEx session this month to pick up the habits that save the most time

Good to know:
- Loan decisioning and credit model repositories are excluded, so Copilot won't read or suggest code there
- Our goal is simple: everyone using it weekly by the end of Q1

Questions? Ask in #copilot or reach out to the DevEx team.

Dan`,
      enablementAgenda: `Copilot for Copperleaf engineers (45 minutes, run by DevEx)

1. Why we rolled out Copilot (5 min)
   Weekly use by end of Q1 and faster ramp for new hires
2. Live demo in VS Code and JetBrains (10 min)
   Suggestions, Chat, and writing tests on a lending service
3. Hands-on: three tasks on your own code (15 min)
4. Guardrails (5 min)
   Excluded repos, public code filter, and what we track for the audit story
5. Tips for new hires (5 min)
   Using Chat to explain unfamiliar code and find your way around
6. Q&A (5 min)`,
      developerFaq: [
        {
          q: "Will this replace me?",
          a: "No. Copilot takes on repetitive work like boilerplate and tests so you spend more time on the problems that need you. You review and own every change.",
        },
        {
          q: "Is our code used for training?",
          a: "GitHub states that it does not use Copilot Business or Enterprise customers' code to train its models. Our CISO has reviewed the data handling details as part of this rollout.",
        },
        {
          q: "Why can't I use Copilot in the credit model repos?",
          a: "Those repositories are excluded on purpose. They contain sensitive decisioning logic, and our CISO asked us to keep them out of Copilot.",
        },
        {
          q: "I'm new here. How can Copilot help me ramp up?",
          a: "Ask Copilot Chat to explain a file or function, walk you through how a service works, or find where something is defined.",
        },
        {
          q: "Where do I get help?",
          a: "Ask in #copilot, join a DevEx session, or use the Ask tab on our onboarding page.",
        },
      ],
    },
    guides: [
      { topic: "install-ide", why: "VS Code and JetBrains setup for all 550 developers" },
      { topic: "first-suggestions", why: "Gets new users to their first win fast" },
      { topic: "explain-refactor", why: "Helps new hires ramp faster on unfamiliar code" },
      { topic: "writing-tests", why: "Quick, visible time savings for every team" },
      { topic: "track-admins", why: "Seat management and policy settings for 550 seats" },
      { topic: "track-security", why: "Content exclusions and the audit story for the CISO" },
      { topic: "premium-requests", why: "Keeps spend predictable ahead of the CFO review" },
    ],
  },

  milestones: [
    {
      title: "Kickoff with Dan, DevEx, and the CISO",
      description: "Agree on the rollout plan, exclusions, and how we'll measure weekly use.",
      dueDay: 2,
      status: "done",
      completedDay: 2,
    },
    {
      title: "Assign seats to all 550 developers",
      description: "Seats assigned by team so adoption can be tracked team by team.",
      dueDay: 6,
      status: "done",
      completedDay: 5,
      completedBy: "customer",
    },
    {
      title: "Content exclusions for credit model repos",
      description: "Exclude loan decisioning and credit model repositories, then test them.",
      dueDay: 12,
      status: "in_progress",
    },
    {
      title: "Policies, public code filter, and audit log",
      description: "Document every Copilot policy decision for the CISO's audit story.",
      dueDay: 14,
      status: "todo",
    },
    {
      title: "DevEx train-the-trainer session",
      description: "Prepare the three-person DevEx team to run enablement with the champion kit.",
      dueDay: 17,
      status: "todo",
    },
    {
      title: "First enablement wave",
      description: "DevEx runs sessions for the next six teams in VS Code and JetBrains.",
      dueDay: 24,
      status: "todo",
    },
    {
      title: "30-day adoption review with Dan",
      description: "Weekly active use by team and where to focus next.",
      dueDay: 30,
      status: "todo",
    },
    {
      title: "Add Copilot to new hire onboarding",
      description: "Make Copilot setup and the ramp-up guide part of every new hire's first week.",
      dueDay: 45,
      status: "todo",
    },
    {
      title: "Six-month value review for the CFO",
      description: "Adoption, time saved, and new hire ramp compared with before Copilot.",
      dueDay: 175,
      status: "todo",
    },
  ],

  usage: [
    { daysAgo: 7, teams: teamsFrom(TEAMS, [55, 10, 5, 2, 40, 8]) },
    { daysAgo: 3, teams: teamsFrom(TEAMS, [65, 22, 14, 5, 43, 11]) },
    { daysAgo: 0, teams: teamsFrom(TEAMS, [70, 30, 20, 10, 45, 15]) },
  ],

  spend: [
    // Informal two-team rollout on 60 seats before the purchase.
    { monthsAgo: 1, seat: 2340, premium: 90 },
    { monthsAgo: 0, seat: 21450, premium: 600 },
  ],

  questions: [
    {
      question: "How do I exclude our loan decisioning repo from Copilot?",
      answer:
        "An organization owner can add the repository under content exclusions in the organization's Copilot settings. You can exclude a whole repository or specific paths. Once it's saved, Copilot won't use those files as context or offer suggestions in them. Test it by opening an excluded file in VS Code and JetBrains.",
      topic: "security",
      daysAgo: 9,
    },
    {
      question: "What do I tell our CISO about where code goes?",
      answer:
        "Point them to GitHub's Copilot Trust Center, which covers how prompts and suggestions are handled and retained. The key points for your CISO: GitHub states it does not use Copilot Business or Enterprise customers' code to train its models, and content exclusions keep your most sensitive repositories out of Copilot entirely.",
      topic: "security",
      daysAgo: 3,
    },
    {
      question: "Is there an audit log for Copilot usage?",
      answer:
        "Yes. The enterprise and organization audit logs record Copilot admin activity, like policy changes and seat assignments. For usage, Copilot usage metrics show active users and activity over time. Together they make a good base for the audit story your regulators will ask about.",
      topic: "compliance",
      daysAgo: 1,
    },
  ],
};
