import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Card, SectionHeader } from "@/components/ui/card";
import { ArchitectureDiagram } from "@/components/behind/architecture-diagram";
import { countAiCalls } from "@/db/queries";
import { allResources } from "@/lib/resources";
import { BUILD_TIMELINE } from "@/lib/build-timeline";
import { formatNumber } from "@/lib/format";
import {
  ASK_SYSTEM,
  BUILD_KIT_SYSTEM,
  BUILD_PLAN_SYSTEM,
  CLASSIFY_SYSTEM,
  NEXT_BEST_ACTION_SYSTEM,
  QUESTION_THEMES_SYSTEM,
  RISK_PLAY_SYSTEM,
  TOOLS_SYSTEM,
} from "@/lib/ai/prompts";
import stats from "@/lib/build-stats.json";

export const metadata: Metadata = { title: "Behind the build" };

const LIVE_URL = "https://okay-now-what.vercel.app";
const REPO_URL = "https://github.com/dmdecesare/okay-now-what";

// SPEC section 7, with the real prompts from src/lib/ai/prompts.ts.
const LIVE_AI: { feature: string; input: string; output: string; prompts: { label: string; text: string }[] }[] = [
  {
    feature: "Build account",
    input: "Basics plus raw deal notes",
    output: "Goals, people, concerns, milestones, setup guide, champion kit, guide picks (validated JSON)",
    prompts: [
      { label: "Plan and people", text: BUILD_PLAN_SYSTEM },
      { label: "Setup guide and champion kit", text: BUILD_KIT_SYSTEM },
    ],
  },
  {
    feature: "Ask assistant",
    input: "Customer question plus account context",
    output: "Answer citing verified GitHub docs, saved for the rep",
    prompts: [
      { label: "Ask", text: ASK_SYSTEM },
      { label: "Question topic", text: CLASSIFY_SYSTEM },
    ],
  },
  {
    feature: "Next best action",
    input: "Usage by team, milestones",
    output: "1 to 3 specific actions",
    prompts: [{ label: "Next best action", text: NEXT_BEST_ACTION_SYSTEM }],
  },
  {
    feature: "Risk explanation and recovery play",
    input: "Signals plus account context",
    output: "Plain-English reason and a play",
    prompts: [{ label: "Risk play", text: RISK_PLAY_SYSTEM }],
  },
  {
    feature: "Question themes",
    input: "Saved customer questions",
    output: "Grouped summary",
    prompts: [{ label: "Question themes", text: QUESTION_THEMES_SYSTEM }],
  },
  {
    feature: "Tools",
    input: "Account context plus tool type",
    output: "Editable draft: launch email, agenda, FAQ, check-in, pilot readout, value summary",
    prompts: [{ label: "Tools", text: TOOLS_SYSTEM }],
  },
];

const STACK = [
  ["Next.js 16", "App Router, server components, streaming"],
  ["Vercel", "Hosting, serverless functions, environment variables"],
  ["Neon Postgres", "Hosted database through Vercel, with Drizzle ORM"],
  ["Anthropic API", "Claude Sonnet 5.5 with structured outputs and prompt caching"],
  ["GitHub", "Public repo, with deploys on every push"],
  ["Claude Code", "Planned, wrote, tested, and deployed all of it"],
];

export default function BehindTheBuildPage() {
  const resources = allResources();
  const videos = resources.filter((r) => r.kind === "video").length;

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-accent-ink">Behind the build</p>
        <h1 className="mt-1 text-display font-semibold">How this was made</h1>
        <p className="mt-3 text-ink-muted">
          GitHub&apos;s mid-market reps close the deal and then own onboarding, adoption, and renewal with no
          customer success team, across 40 accounts at different stages. Customers get generic docs and low adoption
          shows up only at renewal. Okay, Now What? gives the rep a toolkit that does the work of a CS team, and gives
          every customer a private, self-serve onboarding app built from the rep&apos;s own deal notes.
        </p>
      </header>

      <section>
        <SectionHeader title="By the numbers" description="From the git history and the app itself." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Number label="Build time" value={`~${stats.activeHours} hrs`} sub={`estimated from commits, ${stats.calendarDays} days`} />
          <Number label="Claude Code sessions" value="1" sub="one continuous session" />
          <Number label="Lines of code" value={formatNumber(stats.linesOfCode)} sub="written by Claude Code" />
          <Number label="Official resources" value={String(resources.length)} sub={`${resources.length - videos} docs, ${videos} videos, all verified`} />
          <Number label="AI features live" value="6" sub="plus a question tagger" />
          <Suspense fallback={<Number label="Live Claude calls" value="..." sub="served so far" />}>
            <LiveCalls />
          </Suspense>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Architecture"
          description="Every Claude call happens on the server. The browser only ever talks to this app."
        />
        <Card>
          <ArchitectureDiagram />
        </Card>
      </section>

      <section>
        <SectionHeader title="Tech stack" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map(([name, what]) => (
            <Card key={name} className="p-4">
              <p className="font-semibold">{name}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{what}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Where Claude runs live"
          description="Six features, each with its exact prompt. Open any one to read it."
        />
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {LIVE_AI.map((f) => (
              <li key={f.feature} className="p-5">
                <div className="grid gap-2 md:grid-cols-[14rem_1fr_1fr] md:gap-6">
                  <p className="font-semibold">{f.feature}</p>
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink">In: </span>
                    {f.input}
                  </p>
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink">Out: </span>
                    {f.output}
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {f.prompts.map((p) => (
                    <details key={p.label} className="group rounded-lg border border-border">
                      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-accent hover:text-accent-hover">
                        <span className="group-open:hidden">View the prompt: {p.label}</span>
                        <span className="hidden group-open:inline">Hide the prompt: {p.label}</span>
                      </summary>
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap border-t border-border bg-surface p-3 font-mono text-xs leading-relaxed text-ink-muted">
                        {p.text}
                      </pre>
                    </details>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionHeader title="How it was built" description="What Claude Code did, and what Derek decided, phase by phase." />
        <ol className="relative space-y-4 border-l border-border pl-6">
          {BUILD_TIMELINE.map((t) => (
            <li key={t.phase} className="relative">
              <span className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-accent" aria-hidden>
                <span className="size-1.5 rounded-full bg-white" />
              </span>
              <Card className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {t.phase === "Plan" ? "Planning" : `Phase ${t.phase}`}: {t.title}
                  </p>
                  <p className="text-xs text-ink-faint">{t.when}</p>
                </div>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                  <p className="text-ink-muted">
                    <span className="font-medium text-ink">Claude: </span>
                    {t.claude}
                  </p>
                  <p className="text-ink-muted">
                    <span className="font-medium text-ink">Derek: </span>
                    {t.derek}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHeader title="Links" />
        <div className="flex flex-wrap gap-3">
          <a href={LIVE_URL} className="font-medium text-accent hover:text-accent-hover">
            Live app: okay-now-what.vercel.app
          </a>
          <span className="text-ink-faint" aria-hidden>·</span>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:text-accent-hover">
            Code on GitHub: dmdecesare/okay-now-what
          </a>
        </div>
      </section>

      <p className="border-t border-border pt-6 text-sm font-medium">Designed by Derek DeCesare. Built with Claude Code.</p>
    </div>
  );
}

function Number({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>
    </Card>
  );
}

async function LiveCalls() {
  await connection();
  const n = await countAiCalls().catch(() => null);
  return <Number label="Live Claude calls" value={n == null ? "-" : formatNumber(n)} sub="served so far" />;
}
