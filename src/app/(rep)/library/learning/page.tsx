import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Clock } from "lucide-react";
import { getBook, getLearningForAccount } from "@/db/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { DocLinkList } from "@/components/customer/doc-link-list";
import { LibraryHeader } from "@/components/library/library-header";
import { CHALLENGES, LEARNING_ROLES, PATHS, ROLE_LABELS, type ChallengeId } from "@/lib/learning";
import { docLinks } from "@/lib/resources";

export const metadata: Metadata = { title: "Learning paths" };

export default function LibraryLearningPage() {
  return (
    <div className="space-y-6">
      <LibraryHeader
        active="/library/learning"
        description="The hands-on challenges developers work through in the portal, by role. The counts show how many people across your book have finished each one."
      />
      <Suspense fallback={<TabSkeleton />}>
        <Learning />
      </Suspense>
    </div>
  );
}

async function Learning() {
  await connection();
  const book = await getBook();
  const summaries = await Promise.all(book.map((d) => getLearningForAccount(d.account.id)));
  const doneCount = new Map<ChallengeId, number>();
  for (const s of summaries) {
    for (const ids of Object.values(s.progress)) for (const id of ids) doneCount.set(id, (doneCount.get(id) ?? 0) + 1);
  }
  const learners = summaries.reduce((n, s) => n + s.learners, 0);
  const completions = summaries.reduce((n, s) => n + s.completions, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Across your book: <span className="font-semibold text-ink">{learners} learners</span> and{" "}
        <span className="font-semibold text-ink">{completions} challenges completed</span>.
      </p>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {LEARNING_ROLES.map((role) => (
          <Card key={role} className="p-0">
            <CardHeader title={`${ROLE_LABELS[role].label} path`} description={ROLE_LABELS[role].blurb} />
            <CardBody>
              <ol className="space-y-4">
                {PATHS[role].map((id, i) => {
                  const c = CHALLENGES[id];
                  return (
                    <li key={id} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold">{c.title}</p>
                          <span className="text-xs text-ink-faint">
                            <Clock className="mr-1 inline size-3" aria-hidden />
                            {c.minutes} min · {doneCount.get(id) ?? 0} done
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-ink-muted">{c.why}</p>
                        <DocLinkList links={docLinks(c.docs)} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
