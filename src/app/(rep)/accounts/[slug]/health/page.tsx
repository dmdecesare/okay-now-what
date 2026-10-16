import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { ExpansionPill, StatusPill } from "@/components/ui/badges";
import { CardBody, CardHeader } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";
import { EXPANSION_RULES } from "@/lib/expansion";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { InsightCard } from "@/components/account/insight-card";
import { refreshInsightAction } from "@/app/actions/ai";

import { RULES } from "@/lib/health";
import { cn } from "@/lib/cn";
import { loadAccount } from "../load";

const GROWTH_COPY = {
  strong: "Two or more growth signals. Time to talk about more seats or a wider rollout.",
  emerging: "One growth signal. Keep an eye on it and line up the proof points.",
  none: "No growth signals yet. They appear when teams near full adoption or usage climbs.",
};

const STATUS_COPY = {
  on_track: "No risk signals right now. Nothing to fix, so keep the momentum going.",
  watch: "One risk signal. Worth a look before it turns into two.",
  at_risk: "Two or more risk signals. This account needs a recovery play.",
};

export default function HealthPage({ params }: PageProps<"/accounts/[slug]/health">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Health params={params} />
    </Suspense>
  );
}

async function Health({ params }: { params: PageProps<"/accounts/[slug]/health">["params"] }) {
  const { account, health, expansion, insights } = await loadAccount(params);
  const riskPlay = insights.risk_play;
  const pitch = insights.expansion_pitch;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-muted">
            <Activity className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-faint">Health</p>
            <div className="mt-1">
              <StatusPill status={health.status} />
            </div>
            <p className="mt-2 text-sm text-ink-muted">{STATUS_COPY[health.status]}</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-growth-soft text-growth">
            <TrendingUp className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-faint">Growth</p>
            <div className="mt-1">
              {expansion.level === "none" ? (
                <span className="text-sm font-medium text-ink-muted">No signal yet</span>
              ) : (
                <ExpansionPill level={expansion.level} />
              )}
            </div>
            <p className="mt-2 text-sm text-ink-muted">{GROWTH_COPY[expansion.level]}</p>
          </div>
        </Card>
      </div>

      {health.status !== "on_track" && (
        <InsightCard
          title="Recovery play"
          source={riskPlay?.source}
          generatedAt={riskPlay?.generatedAt}
          refresh={refreshInsightAction.bind(null, account.slug, "risk_play")}
        >
          {riskPlay ? (
            <div className="space-y-4">
              <p className="text-sm">{riskPlay.content.explanation}</p>
              <div>
                <p className="font-semibold">{riskPlay.content.play.title}</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                  {riskPlay.content.play.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              No play written yet. Ask Claude to write one from the signals below.
            </p>
          )}
        </InsightCard>
      )}

      {expansion.level !== "none" && (
        <div id="growth" className="scroll-mt-20">
          <InsightCard
            title="Expansion play"
            source={pitch?.source}
            generatedAt={pitch?.generatedAt}
            refresh={refreshInsightAction.bind(null, account.slug, "expansion_pitch")}
          >
            {pitch ? (
              <div className="space-y-4">
                <p className="text-base font-semibold">{pitch.content.headline}</p>
                <p className="text-sm">{pitch.content.why}</p>
                <div className="rounded-lg border border-growth/20 bg-growth-soft/60 p-3 text-sm">
                  <span className="font-semibold text-growth">Propose: </span>
                  {pitch.content.proposal}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {pitch.content.talkingPoints.map((tp) => (
                    <li key={tp} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-growth" aria-hidden />
                      {tp}
                    </li>
                  ))}
                </ul>
                <p className="text-sm">
                  <span className="font-semibold">Next step: </span>
                  {pitch.content.nextStep}
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Ask Claude to turn the growth signals into an expansion play.</p>
            )}
          </InsightCard>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <CardHeader
            icon={<Activity className="size-4" />}
            title="Risk signals we watch"
            description="Two or more means At risk. One means Watch."
          />
          <CardBody>
            <RuleList rules={RULES} fired={(key) => health.signals.find((s) => s.key === key)} tone="risk" />
          </CardBody>
        </Card>

        <Card className="scroll-mt-20 p-0" id={expansion.level === "none" ? "growth" : undefined}>
          <CardHeader
            icon={<TrendingUp className="size-4" />}
            title="Growth signals we watch"
            description="Two or more means Expansion ready. One means Growth signal."
          />
          <CardBody>
            <RuleList
              rules={EXPANSION_RULES}
              fired={(key) => expansion.signals.find((s) => s.key === key)}
              tone="growth"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function RuleList<K extends string>({
  rules,
  fired,
  tone,
}: {
  rules: { key: K; text: string }[];
  fired: (key: K) => { label: string; detail: string } | undefined;
  tone: "risk" | "growth";
}) {
  return (
    <ul className="divide-y divide-border">
      {rules.map((rule) => {
        const signal = fired(rule.key);
        return (
          <li key={rule.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={cn(
                "mt-1.5 size-2.5 shrink-0 rounded-full",
                signal ? (tone === "risk" ? "bg-risk" : "bg-growth") : "bg-border-strong",
              )}
              aria-hidden
            />
            <div>
              <p className={cn("text-sm", signal ? "font-semibold" : "text-ink-muted")}>
                {signal ? signal.label : rule.text}
              </p>
              <p className="text-sm text-ink-muted">{signal ? signal.detail : "Not triggered"}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
