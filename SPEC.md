# Okay, Now What? Build Spec

A post-sale toolkit for reps without a customer success team, focused on GitHub Copilot.

Owner: Derek DeCesare
Purpose: Anthropic AE take-home, Part 2 ("Claudified" workflow project)
Deliverables: (1) a working hosted web app built with Claude Code, (2) a 6-page PDF overview. A Loom walkthrough follows separately.

How to use this file: save it as SPEC.md in an empty project folder, open Claude Code in that folder, and say: "Read SPEC.md. Build this app in the phases listed in section 9. Stop after each phase so I can review it in the browser before moving on."

---

## 0. Setup (first-time Claude Code user)

Do these once, before building.

1. Install Claude Code using the official quickstart on Anthropic's docs site. It runs in the Terminal app on your Mac. Claude Code needs a paid Claude plan or API credits; the quickstart explains the options.
2. Create a Vercel account at vercel.com and choose "Continue with GitHub" so the two are linked.
3. Get an Anthropic API key for the app itself:
   - Sign up at console.anthropic.com
   - Add about $10 of prepaid credit under Billing
   - Set a monthly spend limit (for example $20)
   - Create a key under API Keys and store it somewhere safe. Never paste it into a chat, a document, or the app's code.
4. Make a new empty folder (for example ~/Projects/okay-now-what), put this SPEC.md inside it, and open Claude Code there.
5. Start a build log (see section 11). Keep it open the whole time.
6. Model for building: in Claude Code, select Claude Opus 5.5 at high effort for the main phases (planning, screens, database, AI features, deployment). Drop to medium effort for small tweaks like copy, colors, and spacing. Start phase 1 in plan mode so Claude Code lays out the plan before writing code, and approve it before it starts.

When Claude Code asks for the API key, it should tell you to add it as an environment variable in Vercel (and in a local .env file that is never committed). If it ever asks you to paste the key into code, say no.

---

## 1. The problem and objective (context for Claude Code)

Problem: at GitHub, the mid-market team has no customer success function. The rep who closes the deal also owns onboarding, adoption, and renewal, on top of a full book and a prospecting number. Derek carries 40 accounts at different stages and spend levels. It is hard to keep track of them, and impossible to properly onboard each one when they are at different stages with no CS support. Customers get generic docs, champions are left to roll out AI to hundreds of developers alone, and low adoption only surfaces at renewal.

Objective: give the rep a toolkit that does the work of a CS team (onboarding, adoption, account health, spend, materials), and give each customer a private, self-serve onboarding app with everything they need to onboard themselves.

---

## 2. Tech approach

- Framework: Next.js, deployed on Vercel. Claude Code may choose an equivalent if it has a strong reason, but must explain why.
- Database: the simplest hosted database Vercel offers through its integrations (for example Postgres or Redis). It stores accounts, milestones, usage, spend, customer questions, and generated materials so the rep and customer views stay in sync.
- AI: Anthropic API via the official SDK, called only from server-side routes.
  - Default model for all live features: Claude Sonnet 5.5 (model ID claude-sonnet-5-5). Chosen for speed and cost so the demo feels snappy.
  - Ask assistant: low or default effort, so answers come back fast.
  - "Build account from notes": start on Sonnet 5.5. Keep the model in one config setting so it can be switched to Claude Opus 5.5 (claude-opus-5-5) if generated plans feel thin.
  - Put all model IDs and effort settings in one config file. Claude Code should confirm the model IDs and effort parameter in Anthropic's docs before wiring them in.
- Hosting: Vercel, with a public URL. No login for the demo.

---

## 3. Non-negotiable rules

1. API key stays server-side. It lives only in environment variables. It never appears in client code, the browser, the repo, or logs.
2. Real links only. Every video and doc link must come from official GitHub sources (docs.github.com, github.blog, resources.github.com, GitHub's official YouTube channel). Claude Code must check that each URL loads before adding it. No invented URLs.
3. No GitHub logos or branding. The app is clearly about Copilot but uses its own name and design.
4. All demo companies are fictional. Usage and spend numbers are fictional seed data.
5. The customer view never shows internal data: no health score, risk flags, spend, rep notes, or the customer questions view.
6. Customer links are private: each account gets a long random token URL (for example /c/8f3k...). Anyone with the link can view it; nothing else is discoverable.
7. Graceful fallback: the three demo accounts are fully pre-generated and load instantly. If an AI call fails, show a friendly message and keep the app usable.
8. Basic protection on AI routes: simple rate limiting so the public link can't drain the API budget.
9. Copy style in the UI: plain, friendly, no em dashes.

---

## 4. Look and feel

- Clean, light, modern. One confident accent color, lots of white space, readable type, works on a laptop screen first and is usable on a phone.
- Small playful touches that fit the name, without being goofy. Examples:
  - Empty state: "No accounts yet. Okay, now what? Add your first one."
  - After generating an account: "Done. Here's their plan."
- Rep side and customer side should feel related but distinct (for example, the customer side shows "[Customer name] x Copilot onboarding" at the top).

---

## 5. Rep side

### 5.1 Home: book of business
- At-risk panel at the top: every account with a risk signal, each with a one-line reason and a suggested play (AI-written).
- Account cards: company, industry, stage (Pilot, Onboarding, Rolling out), seats, % active, spend trend arrow, health status (On track, Watch, At risk).
- Add account button.

### 5.2 Add account
- Required fields: company name, industry, seats, stage (Pilot, Onboarding, Rolling out).
- A large box to paste raw deal notes.
- On submit, Claude reads the notes and generates: goals, champion, stakeholders, concerns, a pilot or onboarding plan with milestones, a setup guide, a champion kit, and a tailored guide selection. The customer app is created at the same time.
- Show progress while generating, then open the new account.
- New accounts start with empty usage and spend history and a note: "Usage data appears once the customer is live. Production version pulls from GitHub's Copilot usage and billing data."

### 5.3 Account detail (tabs)
- Overview: what we heard (goals in the customer's words), champion, stakeholders, concerns raised during the deal, original deal notes (collapsible).
- Plan: milestones with status (done, in progress, overdue), synced with what the customer checks off.
- Adoption: active seats vs. purchased, usage by team, trend chart over time, AI-written next best action.
- Spend: monthly trend chart, seat spend and usage-based spend (premium requests) shown separately, total, change vs. last month, a flag if spend is dropping.
- Health and risk: status, the signals behind it, and an AI-written recovery play when at risk.
- Customer questions: everything the customer asked the Ask assistant, newest first, plus an AI summary grouped by theme (for example, "3 questions about security this week").
- Tools: one-click generation, editable and copyable, of: launch email, enablement session agenda, developer FAQ, check-in email to the champion, pilot readout (pilot accounts), renewal or value summary.
- Share: copy the customer's private link.

### 5.4 At-risk logic
An account is flagged when any of these is true:
- % active seats down 10+ points over the last 30 days
- Total spend down 15%+ over the last two months
- Champion has not visited the customer app in 14+ days
- Two or more milestones overdue
- Three or more customer questions on security or compliance within 7 days

Health status: At risk if 2+ signals, Watch if 1, On track if 0. Claude writes the plain-English explanation and recovery play.

---

## 6. Customer side (private link)

Tabs:
1. Home: welcome, their goals, overall progress bar, what to do this week.
2. Plan: milestones they can check off (saves to the database and shows in the rep view). For the pilot account, also shows success criteria and days remaining.
3. Videos: short official videos grouped by topic (getting started, Copilot Chat, agent mode and coding agent, code review, admin setup). A "Send to my devs" button drafts a ready-to-send email or Slack message with the right videos for their current stage.
4. Guides: organized by level, each written for this customer's situation and linking to official docs:
   - 101 Getting started: install in your IDE, first suggestions, using Chat, what Copilot is good and bad at
   - 201 Everyday use: better prompts, writing tests, explaining and refactoring code, code review
   - 301 Advanced: agent mode, the coding agent, custom instructions, MCP, managing premium requests
   - Role tracks: developers, team leads, admins, security teams
5. Setup guide: admin and security steps built around the concerns from their deal (policies, content exclusions, public code filter, seat management, premium request budgets, usage metrics).
6. Champion kit: launch announcement, enablement session agenda, developer FAQ (including "will this replace me?" and "is our code used for training?"). Editable and copyable.
7. Progress: adoption numbers in a customer-friendly view. For the pilot: progress against each success criterion.
8. Ask: a chat assistant that answers questions in the context of this customer (company, industry, seats, stage, concerns, plan). It points to the official docs it draws on. Every question is saved so the rep can see it.

---

## 6b. "Behind the build" page (showcase)

A page in the app, linked from the rep side footer and nav, that shows the work behind the app. This is part of the demo, not hidden documentation.

- What it is: one-paragraph summary of the problem and the solution.
- Architecture diagram: browser (rep view, customer view) to Vercel server routes to the Anthropic API and the database. Make clear the API key lives only on the server.
- Tech stack: Next.js, Vercel hosting, hosted database, Anthropic API (Claude Sonnet), GitHub repo, all built with Claude Code.
- Where Claude runs live: the table from section 7, with a "View the prompt" toggle that shows each prompt.
- How it was built: a short timeline from the build log (phases, time spent, what Claude Code did, what Derek decided).
- By the numbers: build time, number of Claude Code sessions, approximate lines of code generated, number of verified official resources, AI features live.
- Links: live app, GitHub repo.
- Builder line: "Designed by Derek DeCesare. Built with Claude Code."

Code on GitHub: push the project to a public GitHub repo with a clear README (problem, features, architecture, how to run it, how Claude was used). Confirm no secrets are in the repo or its history before making it public.

---

## 7. Where live AI is used

| Feature | Input | Output |
|---|---|---|
| Build account | Basics + raw deal notes | Structured JSON: goals, champion, stakeholders, concerns, milestones, setup steps, champion kit, guide selection |
| Ask assistant | Customer question + account context | Answer with doc links |
| Next best action | Usage by team, milestones | 1 to 3 specific actions |
| Risk explanation and recovery play | Signals, account context | Plain-English reason and a play |
| Question themes | Saved customer questions | Grouped summary |
| Tools | Account context + tool type | Editable draft |

Claude Code should keep these prompts in one clearly organized file so they're easy to show in the Loom and describe in the PDF. Structured outputs should be validated before saving.

---

## 8. Demo accounts (fictional seed data)

Pricing assumption for demo math: Copilot Enterprise at $39 per seat per month, plus usage-based premium requests. Label it as a demo assumption.

### Account 1: Harborline Payments (Pilot)
- Industry: payments. About 1,800 employees. 600 developers in scope.
- Stage: 60-day paid pilot, 100 seats, currently day 24.
- Champion: Priya Nair, Director of Platform Engineering. Economic buyer: CTO. Security reviewer: Head of AppSec.
- Success criteria: 70% weekly active pilot users; 20% faster PR cycle time on pilot teams; developer satisfaction 4 out of 5 or better; security sign-off on data handling.
- Usage: 82 of 100 active, trending up (61, 74, 82 over the last three check-ins).
- Spend per month: seats $3,900; premium requests rising $180, $290, $410.
- Health: On track.
- Deal notes:
  > call w/ Priya + 2 eng managers. they've had Cursor trial on a couple teams, mixed feelings, legal didn't love it. want one vendor. CTO wants hard numbers before buying 600 seats, PR cycle time is the metric he keeps saying. AppSec (Marcus?) worried about code leaving env + PCI scope, need clean answer on data retention. pilot = 100 seats, 4 teams (checkout, risk, mobile, internal tools). mobile team skeptical, "autocomplete on steroids." Priya wants readout deck for CTO end of pilot. timeline: decision before Q1 budget lock.

### Account 2: Copperleaf Lending (Onboarding)
- Industry: digital lending. About 1,400 employees.
- Stage: purchased 550 seats, day 10 of onboarding.
- Champion: Dan Okafor, VP Engineering. Stakeholders: CISO, Head of Developer Experience, CFO (signed off on spend).
- Usage: 190 of 550 active (expected this early).
- Spend per month: seats $21,450; premium requests $600.
- Health: On track.
- Deal notes:
  > Dan drove this, rolled out to 2 teams informally before buying. CISO concerned about loan decisioning repo + anything touching credit models, wants it excluded. regulators (state + CFPB exam stuff) came up, need audit story. dev ex team will run enablement but are 3 people. Dan's goal: every dev using it weekly by end of Q1, and onboarding new hires faster (ramp takes ~3 months now). CFO wants to see value at 6 months or they cut seats. mostly VS Code, some JetBrains.

### Account 3: Bluestone Assurance (Rolling out, shows risk)
- Industry: insurtech. About 2,000 employees.
- Stage: purchased 700 seats, day 75.
- Champion: Elena Ruiz, Senior Director of Engineering (last visited the customer app 22 days ago).
- Usage: 71% active, down from an 84% peak. Claims platform team dropped sharply; policy admin and data teams are strong.
- Spend per month: seats $27,300; premium requests $2,900, then $2,650, then $2,380 (down about 18% over two months).
- Milestones: two overdue (claims team enablement session, custom instructions rollout).
- Health: At risk.
- Deal notes:
  > Elena + CIO bought for whole eng org. big goal is modernizing legacy claims system (lots of old Java). claims team lead was skeptical from day one. Elena wants a monthly adoption update she can forward to CIO. security asked about public code filter + IP indemnity, resolved. heard Elena may be taking on a bigger reorg project in Q4, bandwidth risk. renewal in ~9 months.

### Customer questions to seed (Copperleaf and Bluestone)
- Copperleaf: "How do I exclude our loan decisioning repo from Copilot?", "What do I tell our CISO about where code goes?", "Is there an audit log for Copilot usage?"
- Bluestone: "Our claims team says suggestions are bad on old Java. Any tips?", "How do I set custom instructions for one repo?"

---

## 9. Build phases (stop and review after each)

1. Project skeleton, design system, seeded database with the three demo accounts.
2. Rep home (book of business, at-risk panel) and account detail tabs with seed data and charts.
3. Customer app: all tabs, private links, milestone check-off syncing to the rep view.
4. Curated resource library: find and verify official videos and docs for every guide topic in section 6.
5. Live AI: Ask assistant, next best action, risk explanation, question themes, tools.
6. Add account flow: paste notes, generate everything, create the customer app.
7. Polish: empty states, loading states, error fallbacks, mobile check, rate limiting.
8. Deploy to Vercel, add the API key as an environment variable, test the live URL end to end.
9. Behind the build page, README, and public GitHub repo (after a secrets check).

---

## 10. Demo flow (for testing and the Loom)

1. Open the rep home: 3 accounts, Bluestone in the at-risk panel.
2. Open Bluestone: adoption drop on the claims team, spend down 18%, champion quiet, recovery play.
3. Open Copperleaf: customer questions about security, themes summary.
4. Open Copperleaf's customer link: plan, guides, videos, Ask. Type a new question live.
5. Check off a milestone as the customer, then show it updated in the rep view.
6. Open Harborline: pilot success criteria, generate the pilot readout for the CTO.
7. Add a new account live: paste notes, watch the full customer app get built.

### Acceptance checklist
- [ ] Live URL works in a fresh browser
- [ ] API key is not visible anywhere in the browser (check page source and network tab)
- [ ] Every video and doc link loads
- [ ] Customer view shows no internal data
- [ ] Milestone check-off syncs both ways
- [ ] Adding an account works end to end in under about a minute
- [ ] Ask assistant answers in context and saves the question
- [ ] App still usable if an AI call fails

---

## 11. Build log (Derek keeps this; it feeds PDF pages 5 and 6)

For each session, a few lines:
- Date and time spent
- What I asked Claude Code to do
- What worked on the first try
- What broke and how we fixed it
- Anything that surprised me about Claude
- Screenshot to capture for the PDF

---

## 12. PDF overview (6 pages)

Build after the app is live. Clean, matches the app's look. Screenshots from the live app.

Page 1: cover, problem, objective
- Title: Okay, Now What? A post-sale toolkit for reps without a customer success team
- Derek DeCesare, date, live app URL, and a QR code linking to the app
- Problem, including the real data point: 40 accounts at different stages and spend levels, hard to track, impossible to onboard everyone with no CS support
- Objective (one line plus the measures: rep hours on post-sale work, % seats active at day 30/60/90, time to first team live, renewal and expansion)

Page 2: why it matters, and the solution at a glance
- For the customer, the rep, the business
- Tie-in: Anthropic's mid-market AEs own post-sale with no CSM, so this is the tool I'd want on day one
- Simple flow diagram: rep adds account, Claude builds the customer app, customer onboards, rep sees adoption, spend, and risk

Page 3: how it works, rep side
- Screenshots: book of business with at-risk panel, adoption and spend tabs, customer questions view, with short captions

Page 4: how it works, customer side
- Screenshots: plan, guides, videos, Ask assistant
- Callout: paste notes, and a full customer app is built in under a minute

Page 5: how I used Claude to build it (show the full stack of work)
- Planning in claude.ai (shaping the problem, structure, this spec)
- Building with Claude Code as a non-developer (from the build log)
- Working with the Anthropic API: getting a key, setting a spend limit, keeping the key server-side, choosing a model
- Shipping a real website: GitHub repo, Vercel deployment, hosted database, live URL
- Architecture diagram (same as the Behind the build page)
- Claude inside the app (section 7), with one example prompt
- By the numbers: time spent, sessions, lines of code I didn't write, AI features live

Page 6: what I learned, and what's next
- What surprised me, where Claude struggled and how I worked around it, what I learned about prompting
- What this means for selling Claude to customers
- What's next: real Copilot usage and billing data, CRM integration, the same model for Claude Enterprise and Claude Code rollouts
