import type { MilestoneStatus } from "./schemas";
import { isOverdue } from "./health";

export type DisplayStatus = "done" | "in_progress" | "overdue" | "todo";

/** What both the rep and customer checklists need. No account IDs or internal fields. */
export type ChecklistMilestone = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  completedAt: Date | null;
  completedBy: "rep" | "customer" | null;
};

export function displayStatus(m: Pick<ChecklistMilestone, "status" | "dueDate">, today: string): DisplayStatus {
  if (m.status === "done") return "done";
  if (isOverdue(m, today)) return "overdue";
  return m.status;
}

export function toChecklist(m: ChecklistMilestone): ChecklistMilestone {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    dueDate: m.dueDate,
    status: m.status,
    completedAt: m.completedAt,
    completedBy: m.completedBy,
  };
}
