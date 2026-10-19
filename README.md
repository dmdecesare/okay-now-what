# Okay, Now What?

**A customer success platform for reps without a customer success team, focused on GitHub Copilot.**

Live app: **https://okay-now-what.vercel.app**

Walkthrough video: **https://www.loom.com/share/f07a39bbb16947089f3d2ec074383cdc**

Six-page overview: [docs/okay-now-what-overview.pdf](docs/okay-now-what-overview.pdf)

Designed by Derek DeCesare. Built with [Claude Code](https://claude.com/claude-code).

> All companies, people, usage, and spend in this app are fictional demo data. Not affiliated with GitHub.

---

## The problem

On GitHub's mid-market team there is no customer success function. The rep who closes the deal also owns onboarding, adoption, and renewal, on top of a full book and a prospecting number. With 40 accounts at different stages and spend levels, it's hard to keep track of them and impossible to onboard each one properly. Customers get generic docs, champions roll out AI to hundreds of developers alone, and low adoption shows up only at renewal.

## The solution

**For the rep:** a toolkit that does the work of a CS team.

- **Book of business:** a branded home with a plain-English summary of the week, *Needs attention* (risk) and *Expansion opportunities* (growth) panels, seat utilization, portfolio health, open help requests, a feed of what customers are asking the AI assistant, deadlines, and every account in one table.
- **Account pages:** a profile header with the customer's journey stage and key facts, plus tabs for overview, plan, adoption, spend, health and growth, customer questions, and tools.
- **Brief me:** a one-page call brief with what changed, a talk track, and what to ask for.
- **Log a call:** paste call notes, and Claude proposes updates to the account (milestones, people, dates) plus a follow-up email. The rep picks what to save.
- **Nudges:** found automatically from the account's data (overdue or due-soon milestones, teams slow to adopt, a quiet champion, a help request waiting). Each has a Claude-drafted email.
- **Help requests and developer pulse:** customers book a session or flag a blocker, and answer a five-second weekly pulse. Both land on the rep's account page.
- **Expansion play:** growth signals (teams near full adoption, fast-growing usage, a pilot beating targets) turned into a pitch.
- **Business review:** Claude writes an executive review from customer-visible data only; the rep previews it and publishes it to the customer's portal.
- **Ask AI:** a rep assistant for questions about the whole book, from any page (⌘J). It focuses on the account you have open.
- **Tools:** Claude-drafted launch email, session agenda, developer FAQ, check-in email, pilot readout, value summary, and a monthly exec digest for the champion to forward. Also prompt recipes for the customer and the assumptions behind their Value page.
- **Add account:** paste raw deal notes, and Claude builds the goals, people, concerns, plan, setup guide, champion kit, and the customer's portal in about 20 to 30 seconds. Accounts a rep creates can also be deleted.

**For each customer:** a private success portal on a long random link, covering the whole journey (set up, learn, adopt, prove value, grow).

- **Home:** their journey, goals, plan progress, and what's next, a **Heads up** card of automatic nudges, a **first-week checklist** for new developers, a weekly pulse, and **Request help**.
- A checkable plan synced with the rep; **learning paths** by role with hands-on challenges and a team leaderboard; **prompt recipes** written for their codebase; guides; official videos; a setup guide built around their concerns; a champion kit; progress; and the published business review.
- **Value:** a one-page report for their leadership with estimated savings, hours back, ROI, and payback, with charts.
- An **Ask** assistant floats on every page, answers in their context, and cites official GitHub docs.
- The customer view never shows health, risk, spend, rep notes, or the questions view.

## Where Claude runs live

| Feature | Input | Output |
|---|---|---|
| Build account | Basics plus raw deal notes | Validated JSON: goals, people, concerns, milestones, setup guide, champion kit, guide picks |
| Ask assistant | Customer question plus account context | Streamed answer citing verified docs, saved for the rep |
| Next best action | Usage by team, milestones | 1 to 3 specific actions |
| Risk explanation and recovery play | Signals plus account context | Plain-English reason and a play |
| Question themes | Saved customer questions | Grouped summary |
| Question topic | A customer's question | A topic tag, for the rep's questions view |
| Tools | Account context plus tool type | Editable draft (launch email, agenda, FAQ, check-in, pilot readout, value summary, monthly exec digest) |
| Rep assistant | The whole book plus the open account | Streamed answer with links to the right account tabs |
| Call brief | Account context plus the last 14 days of changes | One-page brief: what changed, talk track, questions, asks |
| Expansion play | Growth signals plus account context | Why now, what to propose, talking points, next step |
| Business review | Customer-visible data plus learning progress | Executive review, published to the customer's portal |
| Log a call | Call notes plus the account record | Proposed account updates and a follow-up email |
| Nudge email | One nudge plus account context | A short email to the champion |
| Prompt recipes | Customer-safe account context | 4 to 8 copy-ready Copilot prompts for their codebase |

Every prompt lives in one file: [`src/lib/ai/prompts.ts`](src/lib/ai/prompts.ts). Model and effort settings live in [`src/lib/ai/config.ts`](src/lib/ai/config.ts). The app uses **Claude Sonnet 5.5** with structured outputs (Zod-validated before saving) and prompt caching.

## Architecture

```
Browser                         Vercel (server)                       Services
-------                         ---------------                       --------
Rep view        ── HTTPS ──>    Next.js server components     ──>     Anthropic API (Claude Sonnet 5.5)
Customer view                   /api/ask      (customer answers)      Neon Postgres (via Drizzle)
                                /api/rep-chat (rep answers)
                                /api/accounts (builds accounts)
                                Server actions (check-offs, briefs, calls, nudges, reviews, drafts)
                                Rate limits, input checks

The Anthropic API key lives only in a server environment variable. It never reaches the browser.
```

## Tech stack

- **Next.js 16** (App Router, Cache Components, streaming) on **Vercel**
- **Neon Postgres** through Vercel's integration, with **Drizzle ORM**. Local development uses **PGlite**, a real Postgres in a folder, so no account is needed to run it.
- **Anthropic API** via the official TypeScript SDK
- **Tailwind CSS**, **Recharts**, **Zod**

## Safety and quality checks

| Command | What it checks |
|---|---|
| `npm run check` | TypeScript, ESLint, and the UI copy rule (no em dashes) |
| `npm run check:health` | The risk and growth rules still tell the demo story |
| `npm run check:leaks [url]` | Every customer page (12 per account), for any rep-only content. The Value page may show the customer's own dollar figures; every other rule still applies. Works against the live URL |
| `npm run check:links` | All 52 resource links load, stay on official GitHub sites, and match their titles. Videos come from GitHub's official channel |
| `npm run check:secrets` | Every file and every commit in history, for keys, tokens, database passwords, and private files |

Other protections: database-backed rate limits on every AI route, private links that are never indexed or sent as referrers, friendly fallbacks when AI is unavailable, and security headers.

## Run it locally

Requires Node.js 22 or newer.

```bash
git clone https://github.com/dmdecesare/okay-now-what.git
cd okay-now-what
npm install
cp .env.example .env.local      # then add your ANTHROPIC_API_KEY
npm run dev                     # http://localhost:3000
```

The local database creates and seeds itself on first run. Without an API key, everything works except the live AI features, which show a friendly message instead.

`npm run db:reset` restores the three demo accounts (stop the dev server first).

## Deploy

1. Create a Vercel project and connect **Neon** from the Storage tab, which sets `DATABASE_URL`.
2. Add `ANTHROPIC_API_KEY` as a Sensitive environment variable (`npm run vercel:add-key` copies it from `.env.local` without displaying it).
3. `vercel env pull .env.production.local --environment=production`
4. `npm run db:prod:migrate` and `npm run db:prod:reset`
5. `vercel deploy --prod`

## How Claude was used

- **claude.ai:** shaped the problem, the structure, and the build spec ([SPEC.md](SPEC.md)).
- **Claude Code:** built the first version in one session across nine reviewed phases, then a second session redesigned it into a customer success platform (new design system, made-up logos, rep assistant, call briefs, expansion plays, business reviews, learning paths, and a floating Ask). Later rounds added the rep workflow (log a call, help requests, developer pulse), the Value page, nudges, the first-week checklist, prompt recipes, and the exec digest. It planned each phase for approval, wrote and tested the code, verified every resource link, caught that the spec's billing terms were out of date, deployed to Vercel, and ran the acceptance checklist on the live URL. The session log is in [BUILD_LOG.md](BUILD_LOG.md).
- **Anthropic API:** powers 14 live features inside the app, listed above.

## Project layout

```
src/app/(rep)/          Rep side: home, account tabs, call brief, add account, customer content library
src/app/c/[token]/      Customer success portal (private link)
src/app/api/            Streaming routes: ask, rep-chat, accounts
src/app/actions/        Server actions: milestones, visits, learning, AI refreshes, reviews, drafts
src/components/         Shell, chat kit, logos, home panels, review, UI primitives
src/lib/ai/             Claude client, prompts, config, account builder, business review
src/lib/                Health and growth rules, learning paths, resource library, schemas
src/db/                 Drizzle schema, queries, seed data
scripts/                Seed, migrate, and the check scripts
```
