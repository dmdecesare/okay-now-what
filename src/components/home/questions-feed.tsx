import Link from "next/link";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { Badge } from "@/components/ui/badges";
import { CardHeader } from "@/components/ui/card";
import { timeAgo, type CustomerQuestionItem } from "@/lib/activity";
import type { QuestionTopic } from "@/lib/schemas";

const TOPIC_LABELS: Record<QuestionTopic, string> = {
  security: "Security",
  compliance: "Compliance",
  setup: "Setup",
  usage: "Usage",
  other: "Other",
};

/** What customers asked the Ask assistant in their portals, newest first. */
export function QuestionsFeed({
  questions,
  topics,
}: {
  questions: CustomerQuestionItem[];
  topics: Partial<Record<QuestionTopic, number>>;
}) {
  const topicEntries = (Object.entries(topics) as [QuestionTopic, number][]).sort((a, b) => b[1] - a[1]);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<MessageCircleQuestion className="size-4" />}
        title="What customers are asking"
        description="Questions from the Ask assistant in each success portal. Answers are saved too."
        action={
          topicEntries.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {topicEntries.map(([t, n]) => (
                <Badge key={t} tone={t === "security" || t === "compliance" ? "watch" : "neutral"}>
                  {TOPIC_LABELS[t]} {n}
                </Badge>
              ))}
              <span className="self-center text-xs text-ink-faint">this week</span>
            </div>
          )
        }
      />
      {questions.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">No questions yet. They show up as customers use Ask.</p>
      ) : (
        <ul className="divide-y divide-border">
          {questions.map((q) => (
            <li key={q.id}>
              <Link href={`/accounts/${q.slug}/questions`} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-surface/70">
                <AccountLogo name={q.name} slug={q.slug} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">&ldquo;{q.question}&rdquo;</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    <span className="font-medium text-ink-muted">{q.name}</span>
                    <span aria-hidden>·</span>
                    <span>{timeAgo(q.at)}</span>
                    <Badge tone={q.topic === "security" || q.topic === "compliance" ? "watch" : "neutral"}>{TOPIC_LABELS[q.topic]}</Badge>
                    {!q.answered && <Badge tone="risk">Needs a reply</Badge>}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
