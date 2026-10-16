"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ActionResult } from "@/app/actions/milestones";
import { displayStatus, type ChecklistMilestone, type DisplayStatus } from "@/lib/milestones";
import { daysBetween } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type Viewer = "rep" | "customer";

const CHIP: Record<Viewer, Record<DisplayStatus, { label: string; className: string }>> = {
  rep: {
    done: { label: "Done", className: "bg-ok-soft text-ok" },
    in_progress: { label: "In progress", className: "bg-accent-soft text-accent-ink" },
    overdue: { label: "Overdue", className: "bg-risk-soft text-risk" },
    todo: { label: "To do", className: "bg-surface-strong text-ink-muted" },
  },
  // Customers get the same facts with gentler words.
  customer: {
    done: { label: "Done", className: "bg-ok-soft text-ok" },
    in_progress: { label: "In progress", className: "bg-accent-soft text-accent-ink" },
    overdue: { label: "Past due date", className: "bg-watch-soft text-watch" },
    todo: { label: "Coming up", className: "bg-surface-strong text-ink-muted" },
  },
};

function doneBy(viewer: Viewer, by: ChecklistMilestone["completedBy"]): string {
  if (!by) return "";
  if (viewer === "rep") return by === "customer" ? " by the customer" : " by you";
  return by === "customer" ? " by your team" : " by your account team";
}

/**
 * Checkable milestone list shared by the rep Plan tab and the customer Plan tab.
 * The tick shows instantly; if saving fails it rolls back and says so.
 */
export function MilestoneChecklist({
  milestones,
  today,
  viewer,
  onToggle,
}: {
  milestones: ChecklistMilestone[];
  today: string;
  viewer: Viewer;
  onToggle: (milestoneId: string, done: boolean) => Promise<ActionResult>;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    milestones,
    (current, change: { id: string; done: boolean }) =>
      current.map((m) =>
        m.id === change.id
          ? {
              ...m,
              status: change.done ? ("done" as const) : ("todo" as const),
              completedAt: change.done ? new Date() : null,
              completedBy: change.done ? viewer : null,
            }
          : m,
      ),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string, done: boolean) {
    setError(null);
    startTransition(async () => {
      setOptimistic({ id, done });
      const result = await onToggle(id, done);
      if (!result.ok) setError(result.message);
    });
  }

  if (optimistic.length === 0) {
    return (
      <p className="rounded-lg bg-surface px-4 py-6 text-center text-sm text-ink-muted">
        {viewer === "rep" ? "No milestones yet. Refresh the plan or add them with the customer." : "Your plan is being put together. Check back soon."}
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">
          {error}
        </p>
      )}
      <ol className="divide-y divide-border">
        {optimistic.map((m) => {
          const status = displayStatus(m, today);
          const chip = CHIP[viewer][status];
          const lateBy = status === "overdue" ? daysBetween(m.dueDate, today) : 0;
          const done = status === "done";
          return (
            <li key={m.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <input
                type="checkbox"
                id={`ms-${m.id}`}
                checked={done}
                onChange={(e) => toggle(m.id, e.target.checked)}
                className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[var(--accent)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <label
                    htmlFor={`ms-${m.id}`}
                    className={cn("cursor-pointer font-medium", done && "text-ink-muted line-through decoration-ink-faint")}
                  >
                    {m.title}
                  </label>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", chip.className)}>
                    {chip.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">{m.description}</p>
                <p className="mt-1 text-xs text-ink-faint">
                  {done && m.completedAt
                    ? `Done ${formatDate(new Date(m.completedAt).toISOString().slice(0, 10))}${doneBy(viewer, m.completedBy)}`
                    : status === "overdue"
                      ? `Was due ${formatDate(m.dueDate)}, ${lateBy} ${lateBy === 1 ? "day" : "days"} ago`
                      : `Due ${formatDate(m.dueDate)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
