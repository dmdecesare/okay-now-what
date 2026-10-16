import Link from "next/link";
import { CheckCircle2, Eye, MessageCircleQuestion, PlusCircle, Radio } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { CardHeader } from "@/components/ui/card";
import { timeAgo, type ActivityEvent, type ActivityKind } from "@/lib/activity";
import { cn } from "@/lib/cn";

const ICONS: Record<ActivityKind, { icon: typeof Eye; className: string }> = {
  milestone_customer: { icon: CheckCircle2, className: "bg-ok-soft text-ok" },
  milestone_rep: { icon: CheckCircle2, className: "bg-surface-strong text-ink-muted" },
  question: { icon: MessageCircleQuestion, className: "bg-accent-soft text-accent" },
  visit: { icon: Eye, className: "bg-growth-soft text-growth" },
  account_added: { icon: PlusCircle, className: "bg-surface-strong text-ink-muted" },
};

const LINK_FOR: Record<ActivityKind, string> = {
  milestone_customer: "/plan",
  milestone_rep: "/plan",
  question: "/questions",
  visit: "",
  account_added: "",
};

/** What customers did recently across the book: check-offs, questions, portal visits. */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<Radio className="size-4" />}
        title="Customer activity"
        description="What your customers did in their success portals."
      />
      {events.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing yet. Activity shows up as customers use their portals.</p>
      ) : (
        <ol className="relative px-5 py-4">
          <span className="absolute bottom-6 left-[35px] top-6 w-px bg-border" aria-hidden />
          {events.map((e, i) => {
            const { icon: Icon, className } = ICONS[e.kind];
            return (
              <li key={i} className="relative flex gap-3 py-2.5">
                <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-bg", className)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <Link href={`/accounts/${e.slug}${LINK_FOR[e.kind]}`} className="text-sm font-medium hover:text-accent">
                      {e.text}
                    </Link>
                    <span className="text-xs text-ink-faint">{timeAgo(e.at)}</span>
                  </div>
                  {e.detail && (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-muted">
                      <AccountLogo name={e.name} slug={e.slug} size={14} className="rounded-[3px] shadow-none" />
                      <span className="truncate">{e.detail}</span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
