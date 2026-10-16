"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Activity } from "lucide-react";
import { submitPulse } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { PULSE_LABELS } from "@/lib/pulse";
import { pulseWeekKey } from "@/lib/support";
import { cn } from "@/lib/cn";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
function answeredThisWeek(token: string) {
  try {
    return window.localStorage.getItem(pulseWeekKey(token)) === "1";
  } catch {
    return false;
  }
}

/** The weekly developer pulse: one tap, an optional blocker, anonymous. */
export function PulseCard({ token, average, count }: { token: string; average: number | null; count: number }) {
  const preview = useSearchParams().get("preview") === "1";
  const answered = useSyncExternalStore(subscribe, () => answeredThisWeek(token), () => false);
  const [score, setScore] = useState<number | null>(null);
  const [blocker, setBlocker] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="flex flex-col rounded-xl border border-border bg-bg p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Activity className="size-4" />
        </span>
        <div>
          <h2 className="font-semibold">Weekly pulse</h2>
          <p className="text-sm text-ink-muted">Anonymous. Takes five seconds, and helps us fix what&apos;s slowing your team down.</p>
        </div>
      </div>

      {answered ? (
        <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
          <p className="font-medium">Thanks for answering this week.</p>
          {average != null && (
            <p className="mt-1 text-ink-muted">
              Your team&apos;s average this month: <span className="font-semibold text-ink">{average} out of 5</span> from {count}{" "}
              {count === 1 ? "answer" : "answers"}.
            </p>
          )}
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (score == null) return;
            setError(null);
            start(async () => {
              const res = await submitPulse(token, { score, blocker }, preview);
              if (!res.ok) return setError(res.message);
              try {
                if (!preview) window.localStorage.setItem(pulseWeekKey(token), "1");
              } catch {
                // Private mode: they may be asked again next visit.
              }
              listeners.forEach((l) => l());
              if (preview) setScore(null);
            });
          }}
        >
          <p className="text-sm font-medium">How useful has Copilot been for you this week?</p>
          <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Usefulness from 1 to 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={score === n}
                onClick={() => setScore(n)}
                className={cn(
                  "flex flex-col items-center rounded-lg border px-1 py-2 text-xs transition-colors",
                  score === n ? "border-accent bg-accent text-white" : "border-border hover:border-accent/40",
                )}
              >
                <span className="text-base font-semibold">{n}</span>
                <span className={cn("mt-0.5 leading-tight", score === n ? "text-white/85" : "text-ink-faint")}>{PULSE_LABELS[n]}</span>
              </button>
            ))}
          </div>
          {score != null && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm text-ink-muted">Anything blocking you? (optional)</span>
                <textarea
                  value={blocker}
                  onChange={(e) => setBlocker(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-lg border border-border-strong bg-bg p-2.5 text-sm outline-none focus:border-accent"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-watch">
                  {error}
                </p>
              )}
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Sending..." : "Send"}
              </Button>
              {preview && <p className="text-xs text-ink-faint">Rep preview: answers aren&apos;t saved.</p>}
            </>
          )}
        </form>
      )}
    </section>
  );
}
