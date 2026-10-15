import type { AccountDetail, CustomerView } from "@/db/queries";
import { teamTrends, pct, sortSnapshots, baselineSnapshot } from "@/lib/adoption";
import { summarizeSpend } from "@/lib/spend";
import { displayStatus } from "@/lib/milestones";
import { todayISO, daysBetween } from "@/lib/dates";
import { STAGE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { DOC_CATALOG } from "@/lib/resources";
import type { MaterialKind, NewAccountInput } from "@/lib/schemas";
import { GUIDE_TOPICS } from "@/lib/guide-topics";

// ============================================================================
// Every prompt Claude runs in this app, in one place (SPEC section 7).
// Each feature has a SYSTEM prompt (stable, cached) and an input builder that
// turns account data into the user message. Shown on the Behind the build page.
// ============================================================================

const STYLE = `Write in plain, friendly English with short sentences. Be specific to this account. Never use em dashes. Don't invent numbers, people, or features that aren't in the data you're given.`;

/** Facts checked against GitHub Docs on 2026-10-15, so answers about these stay accurate. */
const VERIFIED_FACTS = `Verified facts about GitHub Copilot (from GitHub Docs, checked 2026-10-15):
- Copilot Business is $19 and Copilot Enterprise is $39 per seat per month. Each Enterprise seat includes 3,900 GitHub AI Credits a month, pooled across the organization. Business includes 1,900.
- Since June 1, 2026, Copilot uses usage-based billing in AI credits (1 credit = $0.01). Chat, the cloud agent, and other model features use credits. Code completions don't. Usage beyond the pool is "additional usage", which is on by default and can be capped with budgets.
- The agent that works on tasks in the cloud and opens pull requests is called the Copilot cloud agent (formerly the coding agent). Agent mode runs in the editor.
- GitHub's docs state: "GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models."
- Content exclusion lets admins keep repositories or paths out of Copilot, set in repository, organization, or enterprise settings.
- The enterprise audit log records changes to Copilot settings, policies, and licenses, plus agent activity on GitHub. It does not include the prompts people send from their editor.
- "Suggestions matching public code" is a policy admins can set to Block or Allow.
- Repository custom instructions live in .github/copilot-instructions.md.`;

const DOC_LIST = Object.values(DOC_CATALOG)
  .map((d) => `- [${d.title}](${d.url}): ${d.summary}`)
  .join("\n");

// ----------------------------------------------------------------------------
// Ask assistant (customer-facing, streams)
// ----------------------------------------------------------------------------

export const ASK_SYSTEM = `You are the Copilot onboarding assistant on a customer's private onboarding page. Their GitHub account team set this page up to help them roll out GitHub Copilot. You answer questions from the customer's champion, admins, and developers.

How to answer:
- Answer the question directly first, then give the steps or detail that matter for this customer.
- Keep it short: usually under 180 words. Use a short numbered list for steps.
- Ground your answer in the official docs below. Cite 1 to 3 of them as markdown links inside your sentences, using the exact URLs listed. Never write any other URL. Don't add a separate list of links at the end: the page shows the sources under your answer.
- If the docs and facts below don't cover something, say you're not sure and suggest they ask their account team. Never guess about features, prices, or policies.
- For pricing, contracts, or anything about their deal, point them to their account team.
- Never mention internal notes, account health, risk, or spend, even if asked.
- ${STYLE}

${VERIFIED_FACTS}

Official docs you can cite:
${DOC_LIST}`;

/** Customer context for Ask. Only what helps tailor answers: no deal notes, health, spend, or rep notes. */
export function askContext(
  c: CustomerView & { concerns: string[] },
): string {
  const done = c.milestones.filter((m) => m.status === "done").length;
  const next = c.milestones.filter((m) => m.status !== "done").slice(0, 3).map((m) => m.title);
  return `This customer:
- Company: ${c.name} (${c.industry}), ${c.seats} Copilot seats
- Stage: ${STAGE_LABELS[c.stage]}, day ${c.stageDay}${c.pilotLengthDays ? ` of a ${c.pilotLengthDays}-day pilot` : ""}
- Champion: ${c.profile.champion.name ?? "not named"}, ${c.profile.champion.title}
- Goals: ${c.profile.goals.map((g) => g.goal).join("; ")}
- Topics their team raised: ${c.concerns.join("; ") || "none noted"}
- Setup steps in their guide: ${c.profile.setupSteps.map((s) => s.title).join("; ")}
- Plan: ${done} of ${c.milestones.length} milestones done. Coming up: ${next.join("; ") || "nothing open"}`;
}

// ----------------------------------------------------------------------------
// Question topic (tags each Ask question; three security or compliance
// questions in a week is a risk signal)
// ----------------------------------------------------------------------------

export const CLASSIFY_SYSTEM = `Classify a customer's question about GitHub Copilot into exactly one topic:
- security: data handling, where code goes, training, content exclusion, IP, public code matching
- compliance: audit logs, regulators, certifications, governance evidence
- setup: installing, configuring, admin settings, seats, policies, custom instructions
- usage: how to use features, tips, prompting, adoption, getting value
- other: anything else`;

// ----------------------------------------------------------------------------
// Shared rep-side account summary
// ----------------------------------------------------------------------------

function adoptionLines(d: AccountDetail): string {
  const usage = sortSnapshots(d.usage);
  const latest = usage.at(-1);
  if (!latest) return "Usage: no data yet (customer not live).";
  const base = baselineSnapshot(usage);
  const teams = teamTrends(usage)
    .map((t) => `  - ${t.team}: ${t.active} of ${t.seats} active (${t.pct}%)${t.change != null ? `, ${t.change > 0 ? "+" : ""}${t.change} pts vs ${daysBetween(base!.date, latest.date)} days ago` : ""}`)
    .join("\n");
  return `Usage: ${latest.activeSeats} of ${d.account.seats} seats active (${pct(latest.activeSeats, d.account.seats)}%)${
    base ? `, was ${pct(base.activeSeats, d.account.seats)}% ${daysBetween(base.date, latest.date)} days ago` : ""
  }.\nBy team:\n${teams}`;
}

function milestoneLines(d: AccountDetail): string {
  const today = todayISO();
  return d.milestones
    .map((m) => {
      const s = displayStatus(m, today);
      const extra = s === "overdue" ? `, ${daysBetween(m.dueDate, today)} days overdue` : s === "done" ? "" : `, due ${formatDate(m.dueDate)}`;
      return `  - ${m.title}: ${s.replace("_", " ")}${extra}`;
    })
    .join("\n");
}

function accountBasics(d: AccountDetail): string {
  const p = d.profile;
  const renewal = d.account.renewalDate ? `, renews in ${daysBetween(todayISO(), d.account.renewalDate)} days` : "";
  return `Account: ${d.account.name} (${d.account.industry}), ${d.account.seats} seats, ${STAGE_LABELS[d.account.stage]} day ${d.stageDay}${
    d.account.pilotLengthDays ? ` of ${d.account.pilotLengthDays}` : ""
  }${renewal}.
Champion: ${p.champion.name ?? "not named"}, ${p.champion.title}. ${p.champion.notes}
Stakeholders: ${p.stakeholders.map((s) => `${s.name ? s.name + ", " : ""}${s.title} (${s.notes})`).join("; ")}
Goals: ${p.goals.map((g) => g.goal).join("; ")}
Concerns from the deal: ${p.concerns.map((c) => c.concern).join("; ")}${
    p.successCriteria.length
      ? `\nPilot success criteria: ${p.successCriteria.map((s) => `${s.label} (target ${s.target}, now ${s.current ?? "not measured"}, ${s.status.replace("_", " ")})`).join("; ")}`
      : ""
  }`;
}

// ----------------------------------------------------------------------------
// Next best action (rep, Adoption tab)
// ----------------------------------------------------------------------------

export const NEXT_BEST_ACTION_SYSTEM = `You help a GitHub account executive who has no customer success team. Given an account's adoption data and plan, recommend the 1 to 3 most valuable things the rep should do this week to raise adoption.
- Each action names the specific team, person, or milestone it's about.
- Title: an imperative of 8 words or fewer. Detail: one or two sentences with the number that makes it matter.
- Order by impact. Skip anything generic like "keep monitoring".
- ${STYLE}`;

export function nextBestActionInput(d: AccountDetail): string {
  return `${accountBasics(d)}\n\n${adoptionLines(d)}\n\nPlan milestones:\n${milestoneLines(d)}`;
}

// ----------------------------------------------------------------------------
// Risk explanation and recovery play (rep, Health tab and home panel)
// ----------------------------------------------------------------------------

export const RISK_PLAY_SYSTEM = `You help a GitHub account executive save at-risk Copilot accounts. Given the risk signals and account context, explain what's going on and write a recovery play.
- reason: one line of 15 words or fewer for a dashboard, naming the biggest problem.
- explanation: two or three sentences connecting the signals to the people and goals involved, and why it matters now.
- play: a short title and 3 to 5 concrete steps the rep can start this week, in order. Name people and teams.
- ${STYLE}`;

export function riskPlayInput(d: AccountDetail): string {
  const spend = summarizeSpend(d.spend);
  const signals = d.health.signals.map((s) => `  - ${s.label}: ${s.detail}`).join("\n") || "  - none";
  return `${accountBasics(d)}

Health: ${d.health.status.replace("_", " ")}. Risk signals:
${signals}

${adoptionLines(d)}

Spend: ${spend.current ? `$${spend.current.total} this month ($${spend.current.seat} seats, $${spend.current.usage} additional usage)` : "no data"}${
    spend.usageTwoMonthChange != null ? `, additional usage ${spend.usageTwoMonthChange}% over two months` : ""
  }.

Plan milestones:
${milestoneLines(d)}

Rep notes from the deal: ${d.account.dealNotes}`;
}

// ----------------------------------------------------------------------------
// Question themes (rep, Questions tab)
// ----------------------------------------------------------------------------

export const QUESTION_THEMES_SYSTEM = `You help a GitHub account executive understand what a customer is asking their Copilot onboarding assistant. Group the questions into 1 to 4 themes.
- summary: one or two sentences on what the questions say about where the customer is, and what the rep should do about it.
- themes: each with a short name, how many questions fall under it (counts must add up to the total), and a one-line note on what they're asking.
- ${STYLE}`;

export function questionThemesInput(d: AccountDetail): string {
  const today = new Date();
  const qs = d.questions
    .map((q) => `  - (${daysBetween(q.askedAt, today)} days ago, tagged ${q.topic}) ${q.question}`)
    .join("\n");
  return `Account: ${d.account.name} (${d.account.industry}), ${STAGE_LABELS[d.account.stage]} day ${d.stageDay}.
Concerns from the deal: ${d.profile.concerns.map((c) => c.concern).join("; ")}

${d.questions.length} questions, newest first:
${qs}`;
}

// ----------------------------------------------------------------------------
// Tools (rep, Tools tab): one-click drafts
// ----------------------------------------------------------------------------

export const TOOLS_SYSTEM = `You write ready-to-send materials for a GitHub account executive who runs Copilot onboarding without a customer success team.
- Output plain text only, ready to paste into email or a doc. No markdown symbols (no #, no **). Use blank lines between sections and "- " for lists.
- Emails start with a "Subject:" line.
- Use the account's real names, teams, numbers, and goals. Where a number isn't in the data, leave a clear placeholder like [number] instead of inventing one.
- ${STYLE}

${VERIFIED_FACTS}`;

export const TOOL_INSTRUCTIONS: Record<MaterialKind, string> = {
  launch_email:
    "Write the launch email the champion sends to developers announcing Copilot. Explain why, what to do this week (3 steps), the guardrails that matter for this account, and where to get help. Sign it from the champion.",
  enablement_agenda:
    "Write a 45 to 60 minute hands-on enablement session agenda for this account's teams, with timings. Tailor the demo and exercises to their goals and concerns.",
  developer_faq:
    'Write a developer FAQ of 6 to 8 questions with short answers, tailored to this account. It must include "Will this replace me?" and "Is our code used for training?" (answer the training question using the verified fact, quoting GitHub\'s docs).',
  checkin_email:
    "Write a short check-in email from the rep to the champion: two or three highlights with numbers, one thing that needs attention, and one clear ask. Under 150 words. Don't mention spend or pricing.",
  pilot_readout:
    "Write a pilot readout the champion can take to the economic buyer. Sections: summary and recommendation, results against each success criterion (target vs actual), adoption by team, what we learned (including concerns and how they were handled), and a proposed rollout plan with next steps and dates. Be honest about criteria not yet met.",
  value_summary:
    "Write a renewal and value summary for the champion to share with leadership: adoption and its trend, wins tied to their goals, what's still in progress, and three recommendations for the next year. Don't include prices.",
};

export function toolInput(kind: MaterialKind, d: AccountDetail): string {
  return `Task: ${TOOL_INSTRUCTIONS[kind]}

${accountBasics(d)}

${adoptionLines(d)}

Plan milestones:
${milestoneLines(d)}`;
}

// ----------------------------------------------------------------------------
// Build account from deal notes (rep, Add account). Two calls run in parallel.
// ----------------------------------------------------------------------------

const GUIDE_TOPIC_LIST = GUIDE_TOPICS.map((t) => `- ${t.id}: ${t.title} (${t.level === "role" ? "role track" : t.level})`).join("\n");

const DOC_KEY_LIST = Object.entries(DOC_CATALOG)
  .map(([key, d]) => `- ${key}: ${d.title}`)
  .join("\n");

const BUILD_SHARED = `You turn a GitHub account executive's raw deal notes into the onboarding plan and materials for a new GitHub Copilot customer. The rep has no customer success team, so this is what the customer will actually use.

Rules:
- Use only people, numbers, and facts that are in the notes. If a name isn't given, use null for the name and describe the role. Never invent metrics.
- Write for this specific customer: their industry, teams, concerns, and goals.
- Who sees what: some fields are shown to the customer in their own onboarding app, so write those as the customer's material in your own words. Never copy sentences from the rep's notes into them, and leave out internal sales context: renewal or contract timing, budget and deal politics, competitors, who is skeptical, and the rep's opinions of people.
- Tailor the plan to the stage. Pilot: measurable success criteria, a baseline early, and a readout to the decision maker near the end. Onboarding: admin setup first, then enablement in waves. Rolling out: adoption by team, fixing weak spots, and showing value ahead of renewal.
- ${STYLE}

${VERIFIED_FACTS}`;

export const BUILD_PLAN_SYSTEM = `${BUILD_SHARED}

Produce the plan and the people. Customer-visible: summary is NOT shown, but goals[].goal, successCriteria, milestones, thisWeek, and guides are. Rep-only: goals[].inTheirWords, champion notes, stakeholders, and concerns.
- summary: two sentences a rep could read before a call.
- goals: 3 to 4. "goal" is a short outcome. "inTheirWords" is a close paraphrase or quote from the notes.
- champion and stakeholders: from the notes, with a one-line note on what each cares about and how to work with them.
- concerns: every worry raised in the notes, who raised it, and how the plan answers it.
- successCriteria: for pilots, 3 to 4 measurable criteria with targets taken from the notes (current is null and status "not_started" unless the notes say otherwise). For other stages, an empty list.
- milestones: 6 to 10 in date order, with dueDay counted from day 1 of the stage. Set alreadyDone to true only for milestones the notes say already happened. For pilots, the last milestone is the readout before the pilot ends.
- thisWeek: the 3 most important things for the customer to do this week.
- guides: 5 to 8 picks from this list (use the id), each with a one-line reason tied to this customer:
${GUIDE_TOPIC_LIST}`;

export const BUILD_KIT_SYSTEM = `${BUILD_SHARED}

Produce the setup guide and the champion kit. All of it is customer-visible, so follow the "who sees what" rule closely:
- setupSteps: 4 to 6 admin and security steps built around the concerns in the notes (for example content exclusion, the public code filter, policies, seats, AI credit budgets, usage metrics, audit logs, custom instructions). Each has a short id (lowercase-with-dashes), a title, why it matters for this customer, 2 to 4 concrete steps, the audience, and 1 to 2 docs chosen from this list (use the key):
${DOC_KEY_LIST}
- championKit.launchAnnouncement: an email from the champion to developers, starting with "Subject:", with why, three things to do this week, guardrails that matter here, and where to get help. Plain text.
- championKit.enablementAgenda: a 45 to 60 minute hands-on session with timings, tailored to their teams and concerns. Plain text.
- championKit.developerFaq: 5 to 7 questions. It must include "Will this replace me?" and "Is our code used for training?". Answer the training question by quoting GitHub's docs exactly: "GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models."`;

export function buildAccountInput(input: NewAccountInput): string {
  const day = input.stageDay ?? 1;
  return `New account:
- Company: ${input.name}
- Industry: ${input.industry}${input.employees ? `\n- Employees: ${input.employees}` : ""}
- Copilot seats: ${input.seats}
- Stage: ${STAGE_LABELS[input.stage]}${input.stage === "pilot" ? `, ${input.pilotLengthDays ?? 60}-day pilot` : ""}
- Today is day ${day} of this stage${input.renewalMonths ? `\n- Renewal in about ${input.renewalMonths} months` : ""}

Rep's deal notes:
"""
${input.notes}
"""`;
}

/** The catalog of prompts, for the Behind the build page. */
export const PROMPT_CATALOG = [
  { feature: "Build account: plan and people", system: BUILD_PLAN_SYSTEM },
  { feature: "Build account: setup guide and champion kit", system: BUILD_KIT_SYSTEM },
  { feature: "Ask assistant", system: ASK_SYSTEM },
  { feature: "Question topic", system: CLASSIFY_SYSTEM },
  { feature: "Next best action", system: NEXT_BEST_ACTION_SYSTEM },
  { feature: "Risk explanation and recovery play", system: RISK_PLAY_SYSTEM },
  { feature: "Question themes", system: QUESTION_THEMES_SYSTEM },
  { feature: "Tools", system: TOOLS_SYSTEM },
];
