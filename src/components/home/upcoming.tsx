import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { Badge } from "@/components/ui/badges";
import { CardHeader } from "@/components/ui/card";
import type { UpcomingItem } from "@/lib/activity";
import { cn } from "@/lib/cn";

const SOURCE: Record<UpcomingItem["kind"], string> = {
  milestone: "Plan milestone",
  pilot_end: "Pilot end date",
  renewal: "Contract date",
};

function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return { month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }), day: d.getUTCDate() };
}

function status(it: UpcomingItem): { text: string; tone: "risk" | "watch" | "neutral" } {
  if (it.overdue) return { text: `${Math.abs(it.inDays)} days overdue`, tone: "risk" };
  if (it.inDays === 0) return { text: "Due today", tone: "watch" };
  if (it.inDays <= 7) return { text: `Due in ${it.inDays} ${it.inDays === 1 ? "day" : "days"}`, tone: "watch" };
  return { text: `In ${it.inDays} days`, tone: "neutral" };
}

/** Deadlines across the book: overdue plan milestones first, then what's due next, pilot ends, and renewals. */
export function Upcoming({ items }: { items: UpcomingItem[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<CalendarDays className="size-4" />}
        title="Deadlines"
        description="From each account's plan, pilot end dates, and contract renewals."
      />
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing scheduled.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it, i) => {
            const { month, day } = dateParts(it.date);
            const s = status(it);
            return (
              <li key={i}>
                <Link
                  href={`/accounts/${it.slug}${it.kind === "milestone" ? "/plan" : ""}`}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface/70"
                >
                  <span
                    className={cn(
                      "flex w-11 shrink-0 flex-col items-center rounded-lg border py-1 leading-none",
                      it.overdue ? "border-risk/30 bg-risk-soft text-risk" : "border-border bg-surface text-ink",
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{month}</span>
                    <span className="mt-0.5 text-base font-semibold tabular-nums">{day}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{it.label}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                      <AccountLogo name={it.name} slug={it.slug} size={14} className="rounded-[3px] shadow-none" />
                      {it.name}
                      <span aria-hidden>·</span>
                      {SOURCE[it.kind]}
                    </p>
                  </div>
                  <Badge tone={s.tone} className="shrink-0">
                    {s.text}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
