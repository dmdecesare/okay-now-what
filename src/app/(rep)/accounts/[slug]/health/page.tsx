import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badges";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { InsightCard } from "@/components/account/insight-card";
import { refreshInsightAction } from "@/app/actions/ai";

import { RULES } from "@/lib/health";
import { cn } from "@/lib/cn";
import { loadAccount } from "../load";

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
  const { account, health, insights } = await loadAccount(params);
  const fired = new Set(health.signals.map((s) => s.key));
  const riskPlay = insights.risk_play;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-3">
        <StatusPill status={health.status} />
        <p className="text-sm">{STATUS_COPY[health.status]}</p>
      </Card>

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

      <Card>
        <h2 className="font-semibold">Signals we watch</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Two or more signals means At risk. One means Watch. None means On track.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {RULES.map((rule) => {
            const signal = health.signals.find((s) => s.key === rule.key);
            return (
              <li key={rule.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    fired.has(rule.key) ? "bg-risk" : "bg-ok",
                  )}
                  aria-hidden
                />
                <div>
                  <p className={cn("text-sm", signal ? "font-semibold" : "text-ink-muted")}>
                    {signal ? signal.label : rule.text}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {signal ? signal.detail : "Clear"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
