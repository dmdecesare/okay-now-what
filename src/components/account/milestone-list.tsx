import type { Milestone } from "@/db/schema";
import { isOverdue } from "@/lib/health";
import { daysBetween } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type DisplayStatus = "done" | "in_progress" | "overdue" | "todo";

const CHIP: Record<DisplayStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "bg-ok-soft text-ok" },
  in_progress: { label: "In progress", className: "bg-accent-soft text-accent-ink" },
  overdue: { label: "Overdue", className: "bg-risk-soft text-risk" },
  todo: { label: "To do", className: "bg-surface-strong text-ink-muted" },
};

export function displayStatus(m: Pick<Milestone, "status" | "dueDate">, today: string): DisplayStatus {
  if (m.status === "done") return "done";
  if (isOverdue(m, today)) return "overdue";
  return m.status;
}

export function MilestoneList({ milestones, today }: { milestones: Milestone[]; today: string }) {
  return (
    <ol className="divide-y divide-border">
      {milestones.map((m) => {
        const status = displayStatus(m, today);
        const lateBy = status === "overdue" ? daysBetween(m.dueDate, today) : 0;
        return (
          <li key={m.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <StatusDot status={status} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className={cn("font-medium", status === "done" && "text-ink-muted")}>{m.title}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", CHIP[status].className)}>
                  {CHIP[status].label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-ink-muted">{m.description}</p>
              <p className="mt-1 text-xs text-ink-faint">
                {status === "done" && m.completedAt
                  ? `Done ${formatDate(m.completedAt.toISOString().slice(0, 10))}${m.completedBy === "customer" ? " by the customer" : ""}`
                  : status === "overdue"
                    ? `Was due ${formatDate(m.dueDate)}, ${lateBy} ${lateBy === 1 ? "day" : "days"} late`
                    : `Due ${formatDate(m.dueDate)}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusDot({ status }: { status: DisplayStatus }) {
  if (status === "done") {
    return (
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ok text-white" aria-hidden>
        <svg viewBox="0 0 16 16" className="size-3">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "mt-0.5 size-5 shrink-0 rounded-full border-2",
        status === "overdue" ? "border-risk" : status === "in_progress" ? "border-accent" : "border-border-strong",
      )}
      aria-hidden
    />
  );
}
