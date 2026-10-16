import { Check } from "lucide-react";
import type { Stage } from "@/lib/schemas";
import { cn } from "@/lib/cn";

// The customer's journey with Copilot, in their words. Shown on the portal home. No dates or
// contract terms here: those belong to the account team.

const STEPS = [
  { key: "setup", label: "Set up", body: "Admin settings, policies, and seats" },
  { key: "learn", label: "Learn", body: "Enablement sessions and guides" },
  { key: "adopt", label: "Adopt", body: "Weekly use across every team" },
  { key: "prove", label: "Prove value", body: "Measure results against your goals" },
  { key: "grow", label: "Grow", body: "Roll out further and go deeper" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function journeyStep(stage: Stage, stageDay: number, pilotLengthDays: number | null, planDone: number): StepKey {
  if (stage === "pilot") return pilotLengthDays && stageDay / pilotLengthDays >= 0.5 ? "prove" : "adopt";
  if (stage === "onboarding") return planDone < 0.35 ? "setup" : "learn";
  return "adopt";
}

export function Journey({ current }: { current: StepKey }) {
  const at = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="Your journey with Copilot">
      {STEPS.map((s, i) => {
        const done = i < at;
        const active = i === at;
        return (
          <li
            key={s.key}
            aria-current={active ? "step" : undefined}
            className={cn(
              "relative rounded-xl border p-3.5 transition-colors",
              active ? "border-accent/40 bg-bg shadow-card ring-4 ring-accent/10" : "border-border bg-bg/60",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-accent text-white",
                  active && "bg-accent-soft text-accent-ink ring-2 ring-accent",
                  !done && !active && "bg-surface-strong text-ink-faint",
                )}
                aria-hidden
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("text-sm font-semibold", !done && !active && "text-ink-muted")}>{s.label}</span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-ink-muted">{s.body}</p>
            {active && (
              <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                You are here
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
