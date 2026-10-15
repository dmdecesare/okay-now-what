import { Suspense } from "react";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badges";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { InsightCard } from "@/components/account/insight-card";
import { daysBetween } from "@/lib/dates";
import type { QuestionTopic } from "@/lib/schemas";
import { loadAccount } from "../load";

const TOPIC_LABELS: Record<QuestionTopic, string> = {
  security: "Security",
  compliance: "Compliance",
  setup: "Setup",
  usage: "Usage",
  other: "Other",
};

function askedAgo(d: Date): string {
  const days = daysBetween(d, new Date());
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function QuestionsPage({ params }: PageProps<"/accounts/[slug]/questions">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Questions params={params} />
    </Suspense>
  );
}

async function Questions({ params }: { params: PageProps<"/accounts/[slug]/questions">["params"] }) {
  const { questions, insights } = await loadAccount(params);
  const themes = insights.question_themes;

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        body="Everything the customer asks in their Ask tab shows up here, newest first, so you can see what's on their mind."
      />
    );
  }

  return (
    <div className="space-y-6">
      {themes && (
        <InsightCard title="What they're asking about" source={themes.source}>
          <p className="text-sm">{themes.content.summary}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {themes.content.themes.map((t) => (
              <li key={t.theme} className="rounded-lg bg-bg p-3">
                <p className="font-semibold">
                  {t.theme} <span className="font-normal text-ink-muted">· {t.count}</span>
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{t.note}</p>
              </li>
            ))}
          </ul>
        </InsightCard>
      )}

      <Card>
        <h2 className="mb-1 font-semibold">Customer questions</h2>
        <p className="mb-4 text-sm text-ink-muted">From the Ask tab in their onboarding app, newest first.</p>
        <ul className="divide-y divide-border">
          {questions.map((q) => (
            <li key={q.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                <Badge>{TOPIC_LABELS[q.topic]}</Badge>
                <span>{askedAgo(q.askedAt)}</span>
              </div>
              <p className="mt-2 font-medium">{q.question}</p>
              {q.answer && (
                <details className="group mt-2">
                  <summary className="cursor-pointer list-none text-sm font-medium text-accent hover:text-accent-hover">
                    <span className="group-open:hidden">Show the answer they got</span>
                    <span className="hidden group-open:inline">Hide answer</span>
                  </summary>
                  <p className="mt-2 rounded-lg bg-surface p-3 text-sm text-ink-muted">{q.answer}</p>
                </details>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
