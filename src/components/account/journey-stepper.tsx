import { Check } from "lucide-react";
import type { Stage } from "@/lib/schemas";
import { STAGE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";

// Stage keys stay as stored ("rolling_out"); the label the rep sees is "Adoption".
const STEPS: { key: Stage; label: string }[] = [
  { key: "pilot", label: "Pilot" },
  { key: "onboarding", label: "Onboarding" },
  { key: "rolling_out", label: STAGE_LABELS.rolling_out },
];

/** Where the account sits in the post-sale journey: pilot, onboarding, then adoption. */
export function JourneyStepper({
  stage,
  stageDay,
  pilotLengthDays,
}: {
  stage: Stage;
  stageDay: number;
  pilotLengthDays: number | null;
}) {
  const current = STEPS.findIndex((s) => s.key === stage);

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Account stage">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const note = active
          ? pilotLengthDays
            ? `Day ${stageDay} of ${pilotLengthDays}`
            : `Day ${stageDay}`
          : done
            ? s.key === "pilot"
              ? "Before purchase"
              : "Done"
            : "Up next";
        const fill = active && pilotLengthDays ? Math.min(100, (stageDay / pilotLengthDays) * 100) : active ? 50 : done ? 100 : 0;
        return (
          <li key={s.key} aria-current={active ? "step" : undefined} className="min-w-0">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div className={cn("h-full rounded-full", done || active ? "bg-accent" : "")} style={{ width: `${fill}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  done && "bg-accent text-white",
                  active && "bg-accent-soft text-accent-ink ring-2 ring-accent",
                  !done && !active && "bg-surface-strong text-ink-faint",
                )}
                aria-hidden
              >
                {done ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("truncate text-xs font-semibold", active ? "text-ink" : done ? "text-ink-muted" : "text-ink-faint")}>
                {s.label}
              </span>
            </div>
            <p className="mt-0.5 truncate pl-[22px] text-xs text-ink-faint">{note}</p>
          </li>
        );
      })}
    </ol>
  );
}
