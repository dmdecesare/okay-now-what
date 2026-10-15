# Build log

A few lines per session. This feeds pages 5 and 6 of the PDF.

## Template

**Date and time spent:**
**What I asked Claude Code to do:**
**What worked on the first try:**
**What broke and how we fixed it:**
**Anything that surprised me about Claude:**
**Screenshot to capture for the PDF:**

---

## Session 1: setup and Phase 1 (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Read the spec, set up the project, and build Phase 1 (skeleton, design system, seeded database).
**What worked on the first try:**
**What broke and how we fixed it:**
- Node.js wasn't installed, and the admin installer needed a password. Claude Code installed the official Node.js LTS into my home folder after checking its checksum. No admin password needed.
- The project starter asked for a Next.js version that wasn't published yet. Claude Code pinned the latest published version.
**Anything that surprised me about Claude:**
- It found two places where my spec contradicted itself (Bluestone's spend math and Copperleaf's question count) and proposed fixes before writing code.
**Screenshot to capture for the PDF:** Book of business with Bluestone marked At risk.

## Session 2: Phase 2, rep home and account tabs (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Plan and build the book of business with the at-risk panel, and the account detail tabs (overview, plan, adoption, spend, health, questions, tools) with charts.
**What worked on the first try:**
**What broke and how we fixed it:**
- The app's teal looked too gray for chart marks, according to Claude's color checker. Charts now use a brighter teal with amber, which passed the colorblind and contrast checks.
- Premium request spend is under a tenth of seat spend, so its 18% drop disappeared in a stacked chart. Claude split it into its own chart so the drop is obvious.
**Anything that surprised me about Claude:**
**Screenshot to capture for the PDF:** Book of business with the Needs attention panel; Bluestone's Adoption tab (peak 84%, claims team down 41 points); Bluestone's Spend tab.

## Session 3: Phase 3, customer app and milestone sync (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Plan and build the customer onboarding app (all eight tabs), private links, and milestone check-off that syncs both ways with the rep view.
**What worked on the first try:** Two-way sync. Checking off a milestone as the customer updated the rep's plan, overdue count, and health signals.
**What broke and how we fixed it:**
- My leak checker flagged every customer page for "dollar amounts." They turned out to be internal markers in the page data, not prices. Claude narrowed the check so it still catches real leaks.
- Team names and counts swapped sides on phones. Claude simplified the layout.
- One setup step told the customer their usage was falling, which felt like rep-only insight. Claude reworded it.
**Anything that surprised me about Claude:** It thought about my demo: opening a customer link as the rep would have reset Elena's "quiet for 22 days" signal, so it added a rep preview mode.
**Screenshot to capture for the PDF:** Customer Plan tab with checkboxes; Bluestone's customer home ("Welcome, Elena"); the rep Plan tab showing "Done by the customer".

## Session 4: Phase 4, verified resource library (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Find and verify official videos and docs for every guide topic and video group.
**What worked on the first try:** Pulling candidate pages straight from GitHub Docs' own page index, and confirming each video's channel with YouTube's oEmbed endpoint. Every pick is an official GitHub source.
**What broke and how we fixed it:**
- GitHub Docs rate-limited us after a bulk download. Claude built the link checker to go one request at a time and back off when told to.
- The checker first read every docs title as blank, because the title tag has an attribute. Fixed the pattern; four guessed titles were then corrected to GitHub's real ones.
**Anything that surprised me about Claude:** It found that my spec was out of date. GitHub replaced premium requests with usage-based billing in AI credits on June 1, 2026, and renamed the coding agent to the cloud agent. I chose to update the app to the current terms. It also quoted GitHub's exact wording on training ("GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models") instead of paraphrasing.
**Numbers:** 52 links verified: 41 docs.github.com pages and 11 videos from GitHub's official YouTube channel (7 from 2026). Re-run any time with `npm run check:links`.
**Screenshot to capture for the PDF:** Customer Videos tab; Setup guide step with "Read the docs" links; terminal output of `npm run check:links`.

## Session 5: Phase 5, live AI (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Turn on live Claude for the Ask assistant, next best action, risk play, question themes, and the six rep tools.
**What worked on the first try:** The Ask assistant answered a Copperleaf compliance question in about 7 seconds, tailored to their CISO and regulators, citing two verified GitHub docs. Saving the question re-tagged it and refreshed the rep's theme summary in the background. The Harborline pilot readout came out decision-ready, with placeholders instead of invented numbers.
**What broke and how we fixed it:**
- I didn't know how to make an API key. Claude walked me through the Anthropic Console, and I pasted the key into a local file myself so it never touched the chat.
- Answers showed raw markdown (backticks, a code block, sub-bullets). Claude extended the small formatter instead of adding a library.
- Claude caught that blocked requests were counting toward the rate limit and fixed it.
**Anything that surprised me about Claude:** It tested the failure path on purpose with a fake key, so I know the app degrades gracefully instead of hoping it does.
**Numbers:** All live testing cost about $0.13 on Claude Sonnet 5.5.
**Screenshot to capture for the PDF:** Ask tab answer with Sources; rep Questions tab showing the live theme summary; Harborline pilot readout draft.

## Session 6: Phase 6, add account from deal notes (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Build the add-account flow: paste deal notes, Claude builds the plan, setup guide, champion kit, and the customer's app.
**What worked on the first try:** The Northwind Freight example (messy shorthand notes) became a full account in under 30 seconds: goals quoted from the notes, people only from the notes ("Raj, name unconfirmed"), measurable pilot criteria, 9 dated milestones ending in a readout, and a setup guide linked to verified docs. An onboarding-stage test produced enablement waves instead of pilot criteria.
**What broke and how we fixed it:**
- To stay under a minute, Claude split generation into two calls that run at the same time. Builds took 19 to 28 seconds.
- The leak checker caught Claude copying a sentence from my deal notes into customer-facing materials, plus a mention of renewal timing. Claude added a "who sees what" rule to the prompts, rebuilt, and the check passed.
**Anything that surprised me about Claude:** The leak checker it wrote in Phase 3 caught a real problem in Phase 6. Testing paid off.
**Numbers:** About $0.065 per account built (Claude Sonnet 5.5).
**Screenshot to capture for the PDF:** The build progress checklist mid-build; the new account Overview with "Done. Here's their plan."
