import { PhoneCall } from "lucide-react";
import { CardBody, CardHeader } from "@/components/ui/card";
import type { CallLog } from "@/db/schema";
import { formatDate } from "@/lib/format";

/** Logged calls with their summaries, newest first. Rep-only. */
export function CallHistory({ calls, limit, compact }: { calls: CallLog[]; limit?: number; compact?: boolean }) {
  const shown = limit ? calls.slice(0, limit) : calls;
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <CardHeader icon={<PhoneCall className="size-4" />} title="Call log" description={compact ? undefined : "Every call you've logged, with Claude's summary."} />
      <CardBody>
        {shown.length === 0 ? (
          <p className="text-sm text-ink-muted">No calls logged yet.</p>
        ) : (
          <ol className="space-y-4">
            {shown.map((c) => (
              <li key={c.id} className="border-l-2 border-accent/30 pl-3">
                <p className="text-xs font-medium text-ink-faint">{formatDate(c.occurredOn)}</p>
                <p className="mt-0.5 text-sm">{c.summary}</p>
                {!compact && (
                  <details className="mt-1 text-sm">
                    <summary className="cursor-pointer text-xs font-medium text-accent hover:text-accent-hover">Show my notes</summary>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface p-2.5 font-mono text-xs text-ink-muted">{c.notes}</p>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </section>
  );
}
