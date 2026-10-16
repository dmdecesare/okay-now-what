import { Suspense } from "react";
import { CircleAlert, CircleCheck, CircleDot, FileText, HelpCircle, Lightbulb, ListOrdered, ShieldAlert, Target } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { PrintButton } from "@/components/ui/print-button";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { InsightCard } from "@/components/account/insight-card";
import { refreshInsightAction } from "@/app/actions/ai";
import { BRIEF_WINDOW_DAYS, recentChanges, type ChangeFact } from "@/lib/brief";
import type { CallBrief } from "@/lib/schemas";
import { cn } from "@/lib/cn";
import { loadAccount } from "../load";

export default function BriefPage({ params }: PageProps<"/accounts/[slug]/brief">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Brief params={params} />
    </Suspense>
  );
}

function briefToText(name: string, b: CallBrief): string {
  const list = (title: string, items: string[]) => (items.length ? `${title}\n${items.map((i) => `- ${i}`).join("\n")}\n` : "");
  return [
    `Call brief: ${name}`,
    "",
    b.headline,
    "",
    list("What changed", b.whatChanged),
    `Talk track\n${b.talkTrack.map((t, i) => `${i + 1}. ${t.topic}: ${t.say}`).join("\n")}\n`,
    list("Open questions", b.openQuestions),
    list("Risks", b.risks),
    list("Opportunities", b.opportunities),
    list("Asks", b.asks),
  ]
    .filter((s) => s !== "")
    .join("\n");
}

const TONE: Record<ChangeFact["tone"], { icon: typeof CircleDot; className: string }> = {
  good: { icon: CircleCheck, className: "text-ok" },
  bad: { icon: CircleAlert, className: "text-risk" },
  neutral: { icon: CircleDot, className: "text-ink-faint" },
};

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className="text-ink-faint">{icon}</span>
        {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-faint" aria-hidden />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

async function Brief({ params }: { params: PageProps<"/accounts/[slug]/brief">["params"] }) {
  const d = await loadAccount(params);
  const facts = recentChanges(d);
  const brief = d.insights.call_brief;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <FileText className="size-5" />
          </span>
          <div>
            <h2 className="text-title font-semibold">Call brief</h2>
            <p className="text-sm text-ink-muted">
              Everything you need before your next call with {d.account.name}, on one page.
            </p>
          </div>
        </div>
        {brief && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <CopyButton text={briefToText(d.account.name, brief.content)} label="Copy brief" />
            <PrintButton />
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:order-2">
          <CardHeader
            title={`Since ${BRIEF_WINDOW_DAYS} days ago`}
            description="Straight from the account data."
          />
          <CardBody>
            <ul className="space-y-3">
              {facts.map((f) => {
                const { icon: Icon, className } = TONE[f.tone];
                return (
                  <li key={f.text} className="flex gap-2.5 text-sm">
                    <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
                    {f.text}
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <InsightCard
          title="Your brief"
          source={brief?.source}
          generatedAt={brief?.generatedAt}
          refresh={refreshInsightAction.bind(null, d.account.slug, "call_brief")}
          className="lg:order-1 lg:col-span-2"
        >
          {!brief ? (
            <p className="text-sm text-ink-muted">
              Ask Claude to write a one-page brief from the account&apos;s latest data: what changed, what to say, and
              what to ask for.
            </p>
          ) : (
            <div className="space-y-6">
              <p className="text-base font-medium leading-relaxed">{brief.content.headline}</p>
              <Section icon={<CircleDot className="size-4" />} title="What changed" items={brief.content.whatChanged} />
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <ListOrdered className="size-4 text-ink-faint" />
                  Talk track
                </h3>
                <ol className="space-y-3">
                  {brief.content.talkTrack.map((t, i) => (
                    <li key={t.topic} className="flex gap-3 rounded-lg border border-border bg-surface/50 p-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{t.topic}</p>
                        <p className="mt-0.5 text-sm text-ink-muted">{t.say}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Section icon={<HelpCircle className="size-4" />} title="Find out" items={brief.content.openQuestions} />
                <Section icon={<Target className="size-4" />} title="Leave with" items={brief.content.asks} />
                <Section icon={<ShieldAlert className="size-4" />} title="Risks" items={brief.content.risks} />
                <Section icon={<Lightbulb className="size-4" />} title="Opportunities" items={brief.content.opportunities} />
              </div>
            </div>
          )}
        </InsightCard>
      </div>
    </div>
  );
}
