// The story of the build, for the Behind the build page. Drawn from BUILD_LOG.md and
// the git history. Times are when each phase was committed.

export type TimelineEntry = {
  phase: string;
  title: string;
  when: string;
  claude: string;
  derek: string;
};

export const BUILD_TIMELINE: TimelineEntry[] = [
  {
    phase: "Plan",
    title: "Shape the problem and write the spec",
    when: "Before day 1",
    claude: "In claude.ai: shaped the problem, the structure, and the build spec (SPEC.md) with Derek.",
    derek: "Picked the problem from his own book of 40 accounts, the demo story, and the nine build phases.",
  },
  {
    phase: "0",
    title: "Set up the machine",
    when: "Oct 15",
    claude: "Found Node.js missing and installed the official LTS build in Derek's home folder after checking its checksum. No admin password needed.",
    derek: "Approved the download, signed in to Vercel later, and kept the API key out of chat.",
  },
  {
    phase: "1",
    title: "Skeleton, design system, seeded data",
    when: "Oct 15, 6:00 pm",
    claude: "Built the Next.js app, Postgres schema, design system, and three demo accounts. Caught two places where the spec contradicted itself.",
    derek: "Approved the fixes: measure the spend signal on usage, and date one Copperleaf question so the account stays On track.",
  },
  {
    phase: "2",
    title: "Book of business and account tabs",
    when: "Oct 15, 6:11 pm",
    claude: "Built the at-risk panel and seven account tabs with charts, and validated chart colors for color blindness.",
    derek: "Reviewed the Bluestone story in the browser before moving on.",
  },
  {
    phase: "3",
    title: "Customer app and two-way sync",
    when: "Oct 15, 6:28 pm",
    claude: "Built eight customer tabs, milestone check-off that syncs both ways, and a leak checker that scans every customer page for internal data.",
    derek: "Approved a rep preview mode so opening a customer link during the demo doesn't reset the champion's visit history.",
  },
  {
    phase: "4",
    title: "Verified resource library",
    when: "Oct 15, 6:53 pm",
    claude: "Verified 41 GitHub Docs pages and 11 official GitHub videos, and found that the spec's billing terms were out of date.",
    derek: "Chose to update the app to AI credits and \"cloud agent\", and to link only the four official sources.",
  },
  {
    phase: "5",
    title: "Live AI",
    when: "Oct 15, 7:28 pm",
    claude: "Wired Claude Sonnet 5.5 into Ask, next best action, risk plays, question themes, and six rep tools. Tested the failure path with a fake key.",
    derek: "Created the API key in the Anthropic Console and pasted it into a local file himself.",
  },
  {
    phase: "6",
    title: "Add account from deal notes",
    when: "Oct 15, 7:41 pm",
    claude: "Built the paste-notes flow with two parallel Claude calls (about 20 to 30 seconds). Its own leak checker caught rep notes in customer copy, so it tightened the prompts.",
    derek: "Wrote the example notes style and confirmed the under-a-minute bar.",
  },
  {
    phase: "7",
    title: "Polish",
    when: "Oct 16, 8:47 am",
    claude: "Added friendly error pages, empty states, tighter rate limits, security headers, and a 66-page phone-width sweep.",
    derek: "Reviewed the result before deploying.",
  },
  {
    phase: "8",
    title: "Deploy to Vercel",
    when: "Oct 16, 9:14 am",
    claude: "Set up Neon Postgres, migrated and seeded it, deployed, and ran the spec's acceptance checklist on the live URL. All eight checks passed.",
    derek: "Signed the Vercel CLI in, accepted the Neon terms, and added the key with one command so it never showed on screen.",
  },
  {
    phase: "9",
    title: "Behind the build and public repo",
    when: "Oct 16",
    claude: "Wrote this page and the README, scanned every commit for secrets, and published the repo.",
    derek: "Approved making the repo public after the secrets check passed.",
  },
];
