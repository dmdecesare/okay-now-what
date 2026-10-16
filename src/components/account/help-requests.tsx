import { LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badges";
import { CardBody, CardHeader } from "@/components/ui/card";
import type { HelpRequest } from "@/db/schema";
import { timeAgo } from "@/lib/activity";
import { HELP_KIND_LABELS } from "@/lib/support";
import { ResolveRequest } from "./resolve-request";

/** Help the customer asked for in their portal, open first. */
export function HelpRequests({ slug, requests }: { slug: string; requests: HelpRequest[] }) {
  const sorted = [...requests].sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved"));
  const open = requests.filter((r) => r.status === "open").length;
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader
        icon={<LifeBuoy className="size-4" />}
        title="Help requests"
        description={open ? `${open} open, from the customer's portal` : "From the customer's portal"}
      />
      <CardBody>
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-muted">No requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.slice(0, 5).map((r) => (
              <li key={r.id} className={r.status === "resolved" ? "opacity-60" : undefined}>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                  <Badge tone={r.kind === "blocker" ? "watch" : "accent"}>{HELP_KIND_LABELS[r.kind].label}</Badge>
                  {r.requesterName && <span>{r.requesterName}</span>}
                  <span>{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm">{r.message}</p>
                <div className="mt-1.5">
                  <ResolveRequest slug={slug} id={r.id} resolved={r.status === "resolved"} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </section>
  );
}
