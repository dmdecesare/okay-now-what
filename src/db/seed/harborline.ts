import { teamsFrom, type SeedAccount } from "./types";

const TEAMS: [string, number][] = [
  ["Checkout", 30],
  ["Risk", 25],
  ["Mobile", 20],
  ["Internal tools", 25],
];

export const harborline: SeedAccount = {
  slug: "harborline-payments",
  name: "Harborline Payments",
  industry: "Payments",
  employees: 1800,
  seats: 100,
  stage: "pilot",
  stageDay: 24,
  pilotLengthDays: 60,
  championLastVisitDaysAgo: 2,
  dealNotes: `call w/ Priya + 2 eng managers. they've had Cursor trial on a couple teams, mixed feelings, legal didn't love it. want one vendor. CTO wants hard numbers before buying 600 seats, PR cycle time is the metric he keeps saying. AppSec (Marcus?) worried about code leaving env + PCI scope, need clean answer on data retention. pilot = 100 seats, 4 teams (checkout, risk, mobile, internal tools). mobile team skeptical, "autocomplete on steroids." Priya wants readout deck for CTO end of pilot. timeline: decision before Q1 budget lock.`,

  profile: {
    summary:
      "60-day paid pilot with 100 seats across four teams. The CTO will decide on 600 seats based on PR cycle time, and AppSec needs a clean answer on data handling before Q1 budget lock.",
    goals: [
      {
        goal: "Prove a 20% faster PR cycle time on pilot teams",
        inTheirWords: "CTO wants hard numbers before buying 600 seats. PR cycle time is the metric he keeps saying.",
      },
      {
        goal: "Consolidate on one AI coding vendor",
        inTheirWords: "Mixed feelings on the last trial, legal didn't love it. Want one vendor.",
      },
      {
        goal: "Get a clean security answer on data handling and PCI scope",
        inTheirWords: "Worried about code leaving the environment and PCI scope. Need a clean answer on data retention.",
      },
      {
        goal: "Hand the CTO a decision-ready readout before Q1 budget lock",
        inTheirWords: "Priya wants a readout deck for the CTO at the end of the pilot.",
      },
    ],
    champion: {
      name: "Priya Nair",
      title: "Director of Platform Engineering",
      notes:
        "Driving the pilot and wants to consolidate on one vendor. Needs a readout she can take straight to the CTO, so keep her stocked with numbers every week.",
    },
    stakeholders: [
      {
        name: null,
        title: "CTO (economic buyer)",
        notes: "Decides on the 600-seat purchase. Cares about PR cycle time and hard numbers, not anecdotes.",
      },
      {
        name: "Marcus (to confirm)",
        title: "Head of AppSec",
        notes: "Security reviewer. Worried about code leaving the environment, PCI scope, and data retention.",
      },
      {
        name: null,
        title: "Mobile team lead",
        notes: "Skeptical, called it \"autocomplete on steroids.\" Needs to see Chat and agent mode on real mobile work.",
      },
      {
        name: null,
        title: "Engineering managers (2)",
        notes: "Joined discovery and run the pilot teams day to day. Good source of PR cycle time data.",
      },
      {
        name: null,
        title: "Legal",
        notes: "Did not love the terms on the previous AI tool trial. Will want clear answers on IP and data.",
      },
    ],
    concerns: [
      {
        concern: "Code leaving the environment and PCI scope",
        raisedBy: "AppSec",
        response:
          "Exclude PCI-scoped repositories with content exclusions, walk AppSec through how Copilot handles data, and get written sign-off by day 30.",
      },
      {
        concern: "Data retention",
        raisedBy: "AppSec",
        response:
          "Share GitHub's documented data handling and retention policies for Copilot Business and Enterprise, and confirm the organization's policy settings together.",
      },
      {
        concern: "Mixed results from the previous AI tool trial",
        raisedBy: "Engineering managers",
        response:
          "Run a structured pilot with a baseline, clear success criteria, and weekly check-ins so the result is measured, not anecdotal.",
      },
      {
        concern: "Mobile team skepticism",
        raisedBy: "Mobile team",
        response: "Hands-on session on Chat and agent mode using the mobile team's own code, plus a team-specific prompt guide.",
      },
      {
        concern: "Decision has to land before Q1 budget lock",
        raisedBy: "CTO",
        response: "Readout scheduled for day 58 with a recommendation, the numbers, and a 600-seat rollout plan.",
      },
    ],
    successCriteria: [
      { label: "Weekly active pilot users", target: "70% or more", current: "82%", status: "met" },
      {
        label: "PR cycle time on pilot teams",
        target: "20% faster than baseline",
        current: "14% faster so far",
        status: "on_track",
      },
      {
        label: "Developer satisfaction",
        target: "4 out of 5 or better",
        current: "4.2 out of 5 (mid-pilot survey)",
        status: "met",
      },
      {
        label: "Security sign-off on data handling",
        target: "Written approval from AppSec",
        current: "Review in progress",
        status: "on_track",
      },
    ],
    thisWeek: [
      "Send AppSec the data handling summary so sign-off lands by day 30",
      "Hold the mobile team session on Chat and agent mode",
      "Share the mid-pilot numbers with the CTO: 82% weekly active, PR cycle time down 14%",
    ],
    setupSteps: [
      {
        id: "exclude-pci",
        title: "Exclude PCI-scoped repositories",
        why: "AppSec asked to keep PCI-scoped code out of Copilot.",
        steps: [
          "List the repositories and paths that are in PCI scope with AppSec",
          "Add them as content exclusions in your organization's Copilot settings",
          "Test it: open an excluded file and confirm Copilot does not offer suggestions there",
        ],
        audience: "security",
      },
      {
        id: "data-handling",
        title: "Review data handling and retention with AppSec",
        why: "AppSec needs a clean answer on data retention before they sign off.",
        steps: [
          "Read the data handling section of GitHub's Copilot Trust Center",
          "Review your organization's Copilot policies together in the admin settings",
          "Send AppSec a one-page summary and ask for written sign-off",
        ],
        audience: "security",
      },
      {
        id: "public-code-filter",
        title: "Block suggestions that match public code",
        why: "Legal will ask about IP. This setting reduces the chance of suggestions that match public code.",
        steps: [
          "In your Copilot policies, set suggestions matching public code to Blocked",
          "Add the setting to the summary you send AppSec and legal",
        ],
        audience: "admin",
      },
      {
        id: "pilot-seats",
        title: "Assign seats to the four pilot teams",
        why: "Keeps the pilot to 100 seats across checkout, risk, mobile, and internal tools.",
        steps: [
          "Create a team for each pilot group",
          "Assign Copilot seats to those teams only",
          "Send each team lead the install guide",
        ],
        audience: "admin",
      },
      {
        id: "metrics",
        title: "Turn on usage metrics for the readout",
        why: "The CTO wants hard numbers. Usage metrics plus PR cycle time make the case.",
        steps: [
          "Enable Copilot usage metrics for the organization",
          "Pull weekly active users every Friday",
          "Track PR cycle time on pilot teams against the baseline from week one",
        ],
        audience: "team_lead",
      },
      {
        id: "premium-budget",
        title: "Set a premium request budget",
        why: "Keeps pilot spend predictable while teams try agent mode and code review.",
        steps: [
          "Check premium request usage in your billing settings",
          "Set a monthly budget for the pilot",
          "Review it again after the agent mode workshop",
        ],
        audience: "admin",
      },
    ],
    championKit: {
      launchAnnouncement: `Subject: Copilot pilot: what it is and how to get started

Hi team,

For the next 60 days, Checkout, Risk, Mobile, and Internal Tools are piloting GitHub Copilot. The goal is simple: find out whether it helps us ship faster, measured by PR cycle time, before we decide on a wider rollout.

What to do this week:
1. Install the Copilot extension in your IDE (guide linked in our onboarding page)
2. Try it on real work: tests, small refactors, and explaining unfamiliar code
3. Use Copilot Chat when you're stuck and share what works in #copilot-pilot

What you should know:
- PCI-scoped repositories are excluded, so Copilot won't read or suggest code there
- Your honest feedback matters more than anything. We'll run a short survey at the midpoint and at the end

Questions? Ask in #copilot-pilot or reach out to me directly.

Priya`,
      enablementAgenda: `Copilot pilot kickoff (60 minutes)

1. Why we're piloting and how we'll measure it (5 min)
   PR cycle time, weekly active use, and developer satisfaction
2. Live demo on our own code (15 min)
   Inline suggestions, Chat, and writing tests for a checkout service
3. Hands-on: everyone installs and tries three tasks (20 min)
4. Agent mode preview (10 min)
   A small multi-file change, start to finish
5. Guardrails (5 min)
   PCI exclusions, public code filter, where to ask questions
6. Q&A (5 min)`,
      developerFaq: [
        {
          q: "Will this replace me?",
          a: "No. Copilot handles the repetitive parts like boilerplate, tests, and lookups so you spend more time on design and the hard problems. You stay in charge of every change that ships.",
        },
        {
          q: "Is our code used for training?",
          a: "GitHub states that it does not use Copilot Business or Enterprise customers' code to train its models. AppSec is reviewing the full data handling details from GitHub's Copilot Trust Center as part of this pilot.",
        },
        {
          q: "What about PCI-scoped code?",
          a: "Those repositories are excluded. Copilot won't use them as context or offer suggestions inside them.",
        },
        {
          q: "Do I have to use it?",
          a: "Please try it on real work for the pilot. If it isn't helping, tell us why. That feedback is part of the result.",
        },
        {
          q: "Where do I get help?",
          a: "Ask in #copilot-pilot, check the guides on our onboarding page, or use the Ask tab.",
        },
      ],
    },
    guides: [
      { topic: "install-ide", why: "Get all four pilot teams set up in week one" },
      { topic: "using-chat", why: "Fastest way to win over the mobile team" },
      { topic: "writing-tests", why: "Quick, measurable wins that shorten PR cycle time" },
      { topic: "code-review", why: "Directly targets the CTO's PR cycle time metric" },
      { topic: "agent-mode", why: "Shows the mobile team it's more than autocomplete" },
      { topic: "track-security", why: "Gives AppSec what they need for sign-off" },
      { topic: "track-team-leads", why: "Helps managers track adoption and cycle time" },
    ],
  },

  milestones: [
    {
      title: "Pilot kickoff with Priya and team leads",
      description: "Agree on success criteria, pilot teams, and the readout date.",
      dueDay: 1,
      status: "done",
      completedDay: 1,
    },
    {
      title: "Enable Copilot for the four pilot teams",
      description: "Assign 100 seats and get everyone installed.",
      dueDay: 5,
      status: "done",
      completedDay: 4,
      completedBy: "customer",
    },
    {
      title: "Baseline PR cycle time",
      description: "Capture PR cycle time for each pilot team before Copilot use ramps up.",
      dueDay: 7,
      status: "done",
      completedDay: 7,
      completedBy: "customer",
    },
    {
      title: "Mid-pilot check-in and developer survey",
      description: "Review usage and run a short satisfaction survey.",
      dueDay: 21,
      status: "done",
      completedDay: 21,
    },
    {
      title: "Mobile team session on Chat and agent mode",
      description: "Hands-on session using the mobile team's own code.",
      dueDay: 28,
      status: "todo",
    },
    {
      title: "AppSec sign-off on data handling",
      description: "Written approval covering data retention and PCI scope.",
      dueDay: 30,
      status: "in_progress",
    },
    {
      title: "Agent mode and code review workshop",
      description: "Show all pilot teams how to use agent mode and Copilot code review.",
      dueDay: 35,
      status: "todo",
    },
    {
      title: "Final measurement against baseline",
      description: "PR cycle time, weekly active use, and the end-of-pilot survey.",
      dueDay: 55,
      status: "todo",
    },
    {
      title: "Pilot readout to the CTO",
      description: "Results, recommendation, and a 600-seat rollout plan before Q1 budget lock.",
      dueDay: 58,
      status: "todo",
    },
  ],

  usage: [
    { daysAgo: 14, teams: teamsFrom(TEAMS, [22, 17, 6, 16]) },
    { daysAgo: 7, teams: teamsFrom(TEAMS, [25, 20, 10, 19]) },
    { daysAgo: 0, teams: teamsFrom(TEAMS, [27, 22, 12, 21]) },
  ],

  spend: [
    { monthsAgo: 2, seat: 3900, premium: 180 },
    { monthsAgo: 1, seat: 3900, premium: 290 },
    { monthsAgo: 0, seat: 3900, premium: 410 },
  ],

  questions: [],
};
