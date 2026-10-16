import type { AccountDetail } from "@/db/queries";
import { daysBetween, todayISO } from "./dates";
import type { QuestionTopic } from "./schemas";

// What customers are asking across the book, and what's coming up. Pure: built from data already loaded.

export type CustomerQuestionItem = {
  id: string;
  at: Date;
  slug: string;
  name: string;
  question: string;
  topic: QuestionTopic;
  answered: boolean;
};

/** The latest questions customers asked the Ask assistant, across every account. */
export function recentQuestions(book: AccountDetail[], limit = 6): CustomerQuestionItem[] {
  return book
    .flatMap((d) =>
      d.questions.map((q) => ({
        id: q.id,
        at: q.askedAt,
        slug: d.account.slug,
        name: d.account.name,
        question: q.question,
        topic: q.topic,
        answered: !!q.answer,
      })),
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}

/** Questions asked in the last 7 days, by topic. */
export function questionTopicsThisWeek(book: AccountDetail[], now: Date = new Date()): Partial<Record<QuestionTopic, number>> {
  const out: Partial<Record<QuestionTopic, number>> = {};
  for (const d of book) {
    for (const q of d.questions) {
      if (daysBetween(q.askedAt, now) <= 7) out[q.topic] = (out[q.topic] ?? 0) + 1;
    }
  }
  return out;
}

export type UpcomingKind = "pilot_end" | "renewal" | "milestone";

export type UpcomingItem = {
  date: string;
  inDays: number;
  slug: string;
  name: string;
  kind: UpcomingKind;
  label: string;
  overdue: boolean;
};

/** Pilot end dates, renewals, and the next open milestones, soonest first. Overdue milestones lead. */
export function upcoming(book: AccountDetail[], limit = 6, now: Date = new Date()): UpcomingItem[] {
  const today = todayISO(now);
  const items: UpcomingItem[] = [];
  for (const d of book) {
    const { slug, name, pilotLengthDays, stageStartDate, renewalDate } = d.account;
    if (pilotLengthDays) {
      const end = new Date(`${stageStartDate}T00:00:00Z`);
      end.setUTCDate(end.getUTCDate() + pilotLengthDays - 1);
      const date = end.toISOString().slice(0, 10);
      items.push({ date, inDays: daysBetween(today, date), slug, name, kind: "pilot_end", label: "Pilot ends: readout to the decision maker", overdue: false });
    }
    if (renewalDate && daysBetween(today, renewalDate) <= 365) {
      items.push({ date: renewalDate, inDays: daysBetween(today, renewalDate), slug, name, kind: "renewal", label: "Contract renewal", overdue: false });
    }
    const open = d.milestones.filter((m) => m.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    for (const m of open.slice(0, 2)) {
      items.push({
        date: m.dueDate,
        inDays: daysBetween(today, m.dueDate),
        slug,
        name,
        kind: "milestone",
        label: m.title,
        overdue: m.dueDate < today,
      });
    }
  }
  return items
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function timeAgo(at: Date, now: Date = new Date()): string {
  const mins = Math.round((now.getTime() - at.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}
