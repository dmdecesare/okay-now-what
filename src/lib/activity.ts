import type { AccountDetail } from "@/db/queries";
import { daysBetween, todayISO } from "./dates";
import { seedLogoId } from "./logos";

// What happened recently across the book, and what's coming up. Pure: built from data already loaded.

export type ActivityKind = "milestone_customer" | "milestone_rep" | "question" | "visit" | "account_added";

export type ActivityEvent = {
  at: Date;
  slug: string;
  name: string;
  kind: ActivityKind;
  text: string;
  detail?: string;
};

export function recentActivity(book: AccountDetail[], limit = 7, now: Date = new Date()): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const d of book) {
    const { slug, name } = d.account;
    const champion = d.profile.champion.name ?? "The champion";
    for (const m of d.milestones) {
      if (m.status !== "done" || !m.completedAt) continue;
      events.push({
        at: m.completedAt,
        slug,
        name,
        kind: m.completedBy === "customer" ? "milestone_customer" : "milestone_rep",
        text: m.completedBy === "customer" ? `${name} checked off a milestone` : "Milestone marked done",
        detail: m.title,
      });
    }
    for (const q of d.questions) {
      events.push({ at: q.askedAt, slug, name, kind: "question", text: `${name} asked the Ask assistant`, detail: q.question });
    }
    if (d.account.championLastVisitAt) {
      events.push({
        at: d.account.championLastVisitAt,
        slug,
        name,
        kind: "visit",
        text: `${champion} opened the success portal`,
      });
    }
    // Demo accounts are re-created on every reset, so "added" is only news for accounts built from notes.
    if (!seedLogoId(slug)) {
      events.push({ at: d.account.createdAt, slug, name, kind: "account_added", text: `${name} added to your book` });
    }
  }
  return events
    .filter((e) => e.at.getTime() <= now.getTime())
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
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
      items.push({ date, inDays: daysBetween(today, date), slug, name, kind: "pilot_end", label: "Pilot ends, readout due", overdue: false });
    }
    if (renewalDate) {
      items.push({ date: renewalDate, inDays: daysBetween(today, renewalDate), slug, name, kind: "renewal", label: "Renewal", overdue: false });
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
