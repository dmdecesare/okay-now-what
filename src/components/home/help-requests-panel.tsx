import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import type { AccountDetail } from "@/db/queries";
import { AccountLogo } from "@/components/logos/account-logo";
import { Badge } from "@/components/ui/badges";
import { CardHeader } from "@/components/ui/card";
import { timeAgo } from "@/lib/activity";
import { HELP_KIND_LABELS } from "@/lib/support";

/** Every open help request across the book, oldest first, so nothing waits too long. */
export function HelpRequestsPanel({ book }: { book: AccountDetail[] }) {
  const open = book
    .flatMap((d) => d.helpRequests.filter((r) => r.status === "open").map((r) => ({ ...r, slug: d.account.slug, name: d.account.name })))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<LifeBuoy className="size-4" />}
        title="Help requests"
        description="Sessions and blockers customers raised in their portals."
        action={<Badge tone={open.length ? "watch" : "neutral"}>{open.length} open</Badge>}
      />
      {open.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-ink-muted">No open requests.</p>
      ) : (
        <ul className="divide-y divide-border">
          {open.map((r) => (
            <li key={r.id}>
              <Link href={`/accounts/${r.slug}`} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-surface/70">
                <AccountLogo name={r.name} slug={r.slug} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{r.message}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    <span className="font-medium">{r.name}</span>
                    {r.requesterName && <span>· {r.requesterName}</span>}
                    <span>· {timeAgo(r.createdAt)}</span>
                    <Badge tone={r.kind === "blocker" ? "watch" : "accent"}>{HELP_KIND_LABELS[r.kind].label}</Badge>
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-ink-faint group-hover:text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
