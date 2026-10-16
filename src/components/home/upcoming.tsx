import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { CardHeader } from "@/components/ui/card";
import type { UpcomingItem } from "@/lib/activity";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<UpcomingItem["kind"], string> = {
  pilot_end: "Pilot",
  renewal: "Renewal",
  milestone: "Milestone",
};

function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return {
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    day: d.getUTCDate(),
  };
}

/** Dates that matter across the book: overdue work first, then pilots, milestones, and renewals. */
export function Upcoming({ items }: { items: UpcomingItem[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader icon={<CalendarDays className="size-4" />} title="Coming up" description="Deadlines, readouts, and renewals." />
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing scheduled.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it, i) => {
            const { month, day } = dateParts(it.date);
            return (
              <li key={i}>
                <Link
                  href={`/accounts/${it.slug}${it.kind === "milestone" ? "/plan" : ""}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface/70"
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
                    <p className="truncate text-sm font-medium">{it.label}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-ink-muted">
                      <AccountLogo name={it.name} slug={it.slug} size={14} className="rounded-[3px] shadow-none" />
                      {it.name} · {KIND_LABEL[it.kind]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium tabular-nums",
                      it.overdue ? "text-risk" : it.inDays <= 14 ? "text-watch" : "text-ink-faint",
                    )}
                  >
                    {it.overdue ? `${Math.abs(it.inDays)}d overdue` : it.inDays === 0 ? "Today" : `In ${it.inDays}d`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
