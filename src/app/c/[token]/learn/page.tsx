import { Suspense } from "react";
import { GraduationCap, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { PortalHeader } from "@/components/customer/portal-header";
import { LearningPaths } from "@/components/customer/learning-paths";
import { getCustomerLearning } from "@/db/queries";
import { ROLE_LABELS } from "@/lib/learning";
import { loadCustomer } from "../data";

export default function LearnPage({ params, searchParams }: PageProps<"/c/[token]/learn">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Learn params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Learn({
  params,
  searchParams,
}: Pick<PageProps<"/c/[token]/learn">, "params" | "searchParams">) {
  const c = await loadCustomer(params);
  const preview = (await searchParams).preview === "1";
  const learning = (await getCustomerLearning(c.token)) ?? { learners: 0, completions: 0, leaders: [], progress: {} };

  return (
    <div className="space-y-6">
      <PortalHeader
        icon={<GraduationCap />}
        title="Learning paths"
        description={`Hands-on challenges for everyone at ${c.name}, by role. Each one links to the official GitHub docs, and your progress counts toward your team's total.`}
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LearningPaths token={c.token} preview={preview} progress={learning.progress} />
        </div>

        <Card className="p-0 lg:sticky lg:top-36">
          <CardHeader icon={<Trophy className="size-4" />} title="Team leaderboard" description={`${learning.learners} learners · ${learning.completions} challenges done`} />
          <CardBody>
            {learning.leaders.length === 0 ? (
              <p className="text-sm text-ink-muted">Be the first on the board.</p>
            ) : (
              <ol className="space-y-2.5">
                {learning.leaders.map((l, i) => (
                  <li key={`${l.name}-${i}`} className="flex items-center gap-3">
                    <span
                      className={
                        i < 3
                          ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
                          : "flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-strong text-xs font-semibold text-ink-muted"
                      }
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-ink-faint">{ROLE_LABELS[l.role].label}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{l.done}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
