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
        docs: ["content-exclusion-howto", "content-exclusion-about"],
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
        docs: ["approval-resources", "model-hosting"],
        title: "Review data handling and retention with AppSec",
        why: "AppSec needs a clean answer on data retention before they sign off.",
        steps: [
          "Send AppSec GitHub's approval resources page: terms, data protection agreement, and trust center links",
          "Walk through where models are hosted and GitHub's commitment not to train on your data",
          "Send AppSec a one-page summary and ask for written sign-off",
        ],
        audience: "security",
      },
      {
        id: "public-code-filter",
        docs: ["enterprise-policies", "matching-code"],
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
        docs: ["seat-assignment", "setup-org"],
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
        docs: ["usage-metrics", "measure-success"],
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
        id: "ai-credit-budget",
        docs: ["ai-credits", "budgets"],
        title: "Set AI credit budgets",
        why: "Keeps pilot spend predictable while teams try agent mode and code review.",
        steps: [
          "Check AI credit usage in your billing settings",
          "Decide whether to allow additional usage beyond the included credits (it's on by default)",
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
          a: "No. GitHub's documentation says: \"GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models.\" AppSec is reviewing the full data handling details as part of this pilot.",
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
    { monthsAgo: 2, seat: 3900, usage: 180 },
    { monthsAgo: 1, seat: 3900, usage: 290 },
    { monthsAgo: 0, seat: 3900, usage: 410 },
  ],

  questions: [],

  learning: [
    { name: "Maya R.", role: "developer", challenges: ["install", "first_chat", "write_tests", "refactor", "custom_instructions", "agent_task"], daysAgo: 1 },
    { name: "Priya N.", role: "team_lead", challenges: ["install", "first_chat", "code_review", "drive_adoption", "view_usage"], daysAgo: 2 },
    { name: "Tom B.", role: "developer", challenges: ["install", "first_chat", "write_tests", "code_review"], daysAgo: 3 },
    { name: "Luis G.", role: "team_lead", challenges: ["install", "first_chat", "drive_adoption", "view_usage"], daysAgo: 4 },
    { name: "Raj K.", role: "admin", challenges: ["setup_org", "policies", "budgets"], daysAgo: 6 },
    { name: "Ana P.", role: "developer", challenges: ["install", "first_chat", "agent_task"], daysAgo: 2 },
    { name: "Sam O.", role: "security", challenges: ["data_handling", "public_code"], daysAgo: 5 },
    { name: "Ken W.", role: "developer", challenges: ["install", "first_chat"], daysAgo: 7 },
    { name: "Dee F.", role: "developer", challenges: ["install"], daysAgo: 3 },
  ],
  calls: [
    {
      daysAgo: 6,
      notes:
        "mid-pilot check-in w/ Priya + 2 EMs. survey back 4.2. checkout loving test gen. mobile still meh, wants agent mode session. AppSec reviewing retention doc, Priya chasing. CTO wants PR cycle time on all 4 teams in readout.",
      summary:
        "Mid-pilot check-in with Priya and two engineering managers. Satisfaction came back at 4.2 and Checkout is the strongest team, while Mobile wants a hands-on agent mode session. AppSec is still reviewing data retention, and the CTO wants PR cycle time for all four teams in the readout.",
    },
  ],
  helpRequests: [
    { kind: "session", message: "Our mobile team would like a hands-on session on agent mode with our own Kotlin code.", name: "Priya", daysAgo: 8, status: "resolved" },
  ],
  pulse: [
    [5, 0],
    [4, 1],
    [4, 3],
    [5, 4],
    [4, 6],
    [4, 8],
    [3, 9],
    [5, 11],
    [4, 12],
    [4, 14],
    [5, 16],
    [4, 17],
    [4, 19],
    [4, 20],
    [5, 22],
    [3, 24],
    [4, 25],
    [5, 27],
    [4, 3, "Suggestions in our Kotlin UI code are hit or miss."],
    [4, 9, "Not sure what we can paste into Chat in the PCI repos."],
  ],
  insights: {
    call_brief: {
      headline:
        "The pilot is beating its usage and satisfaction targets at day 24. AppSec sign-off and the mobile team are the two things left to close.",
      whatChanged: [
        "Weekly active use climbed from 61% to 82% over the last two check-ins.",
        "Mobile is up from 6 to 12 of 20 active, still the lowest team at 60%.",
        "The mid-pilot survey came back at 4.2 out of 5, above the 4.0 target.",
        "Additional usage rose from $180 to $410 a month as teams try Chat and agent mode.",
      ],
      openQuestions: [
        "When does AppSec expect to finish the data handling review?",
        "Does the CTO want PR cycle time measured on all four teams or the strongest two?",
        "Who on the mobile team could become a second champion?",
      ],
      risks: [
        "AppSec sign-off is still in progress, and it gates the CTO decision.",
        "PR cycle time is 14% faster so far against a 20% target.",
      ],
      opportunities: [
        "Checkout is 90% active, a strong first wave for the 600-seat rollout.",
        "Weekly use and satisfaction already beat target, so the readout can start now.",
      ],
      talkTrack: [
        { topic: "Wins so far", say: "Open with the numbers: 82% weekly active against a 70% target, and 4.2 out of 5 satisfaction." },
        { topic: "AppSec sign-off", say: "Ask Priya what AppSec still needs on data retention, and offer to join a 30-minute review this week." },
        { topic: "Mobile team", say: "Confirm the Chat and agent mode session for day 28 and suggest running it on the team's own code." },
        { topic: "Readout plan", say: "Propose drafting the CTO readout now and adding the final PR cycle time number at day 55." },
      ],
      asks: ["A target date for AppSec sign-off", "30 minutes with the CTO in the last week of the pilot"],
    },
    expansion_pitch: {
      headline: "Strong pilot: line up the 600-seat rollout for the CTO decision",
      why: "Weekly active use is 82% against a 70% target, satisfaction is 4.2 out of 5, and additional usage more than doubled in two months. The CTO wants hard numbers before buying 600 seats, and most of them are already in.",
      proposal:
        "Move from the 100-seat pilot to the 600 developers in scope, starting with Checkout and Risk, the two strongest teams, ahead of Q1 budget lock.",
      talkingPoints: [
        "Checkout is 27 of 30 active (90%), proof the rollout can start there.",
        "Two of four success criteria are already met, and the other two are on track.",
        "Additional usage grew from $180 to $410 a month, a sign developers are using Chat and agent mode, not just completions.",
      ],
      nextStep: "Ask Priya for 30 minutes this week to plan the readout and the rollout waves for the CTO.",
    },
    next_best_action: {
      actions: [
        {
          title: "Lock in AppSec sign-off before day 30",
          detail:
            "Send AppSec the data handling summary this week. Security sign-off is the one success criterion still open, and it gates the CTO decision.",
        },
        {
          title: "Turn the mobile team around",
          detail:
            "Mobile is at 60% active, the lowest of the four teams. Run the Chat and agent mode session on their own code before day 28.",
        },
        {
          title: "Start the CTO readout now",
          detail:
            "Weekly active use (82%) and satisfaction (4.2) already beat target. Draft the readout early and add the final PR cycle time number at day 55.",
        },
      ],
    },
  },
};
