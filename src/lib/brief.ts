import type { AccountDetail } from "@/db/queries";
import { pct, sortSnapshots, teamTrends } from "./adoption";
import { daysBetween, todayISO } from "./dates";
import { displayStatus } from "./milestones";
import { summarizeSpend } from "./spend";

// What changed on an account recently, computed from the data (no AI). The call brief page
// shows these facts next to Claude's brief, and the brief prompt is built on top of them.

export const BRIEF_WINDOW_DAYS = 14;

export type ChangeFact = { tone: "good" | "bad" | "neutral"; text: string };

export function recentChanges(d: AccountDetail, now: Date = new Date()): ChangeFact[] {
  const facts: ChangeFact[] = [];
  const today = todayISO(now);
  const within = (date: Date | string) => daysBetween(date, now) <= BRIEF_WINDOW_DAYS;

  // Milestones finished in the window, and who finished them.
  for (const m of d.milestones) {
    if (m.status === "done" && m.completedAt && within(m.completedAt)) {
      facts.push({
        tone: "good",
        text: `${m.completedBy === "customer" ? "The customer checked off" : "You marked done"} "${m.title}" ${daysBetween(m.completedAt, now)} days ago.`,
      });
    }
  }

  // Milestones that slipped.
  for (const m of d.milestones) {
    if (displayStatus(m, today) === "overdue") {
      facts.push({ tone: "bad", text: `"${m.title}" is ${daysBetween(m.dueDate, today)} days overdue.` });
    }
  }

  // Adoption over the window, overall and for the team that moved most.
  const usage = sortSnapshots(d.usage);
  const latest = usage.at(-1);
  if (latest) {
    const then = [...usage].reverse().find((u) => daysBetween(u.date, latest.date) >= BRIEF_WINDOW_DAYS) ?? usage[0];
    if (then && then !== latest) {
      const change = pct(latest.activeSeats, d.account.seats) - pct(then.activeSeats, d.account.seats);
      if (change !== 0) {
        facts.push({
          tone: change > 0 ? "good" : "bad",
          text: `Active seats ${change > 0 ? "up" : "down"} ${Math.abs(change)} points since ${daysBetween(then.date, latest.date)} days ago, now ${pct(latest.activeSeats, d.account.seats)}%.`,
        });
      }
    }
    const mover = teamTrends(usage)
      .filter((t) => t.change != null && Math.abs(t.change) >= 5)
      .sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!))[0];
    if (mover) {
      facts.push({
        tone: mover.change! > 0 ? "good" : "bad",
        text: `${mover.team} is ${mover.change! > 0 ? "up" : "down"} ${Math.abs(mover.change!)} points (${mover.pct}% active).`,
      });
    }
  }

  // Questions the customer asked.
  const recentQs = d.questions.filter((q) => within(q.askedAt));
  if (recentQs.length) {
    const topics = [...new Set(recentQs.map((q) => q.topic))].join(", ");
    facts.push({
      tone: "neutral",
      text: `${recentQs.length} new ${recentQs.length === 1 ? "question" : "questions"} in the portal (${topics}).`,
    });
  }

  // Champion engagement.
  const champion = d.profile.champion.name ?? "The champion";
  if (d.account.championLastVisitAt) {
    const days = daysBetween(d.account.championLastVisitAt, now);
    facts.push({
      tone: days >= 14 ? "bad" : "good",
      text: days === 0 ? `${champion} opened the portal today.` : `${champion} last opened the portal ${days} days ago.`,
    });
  } else {
    facts.push({ tone: "bad", text: `${champion} hasn't opened the portal yet.` });
  }

  // Spend.
  const spend = summarizeSpend(d.spend);
  if (spend.changeVsLastMonth != null && spend.changeVsLastMonth !== 0) {
    facts.push({
      tone: "neutral",
      text: `Monthly spend ${spend.changeVsLastMonth > 0 ? "up" : "down"} ${Math.abs(spend.changeVsLastMonth)}% vs last month.`,
    });
  }

  return facts;
}
