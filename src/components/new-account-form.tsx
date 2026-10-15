"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/constants";
import { STAGES, newAccountInputSchema, type Stage } from "@/lib/schemas";
import type { BuildEvent, BuildStep } from "@/lib/build-events";
import { cn } from "@/lib/cn";

// Fictional example for demos (SPEC rule 4: all demo companies are fictional).
const EXAMPLE = {
  name: "Northwind Freight",
  industry: "Logistics",
  seats: "300",
  stage: "pilot" as Stage,
  employees: "1100",
  pilotLengthDays: "45",
  stageDay: "1",
  renewalMonths: "",
  notes: `kickoff w/ Maya Chen (VP Eng) + Jordan (platform lead). ~400 devs, piloting 300 seats for 45 days across routing, warehouse systems, driver app. biggest pain = slow code reviews, PRs sit 2-3 days, Maya wants review turnaround cut in half. CISO (Raj?) asked where code goes + wants the pricing engine repo excluded. warehouse systems = lots of old C#, that team is skeptical. driver app team already using personal Copilot accounts, want them under org policy. finance nervous about AI spend, wants a hard cap. Maya needs a one-pager for the CFO before budget review in Jan.`,
};

type Form = {
  name: string;
  industry: string;
  seats: string;
  stage: Stage;
  employees: string;
  pilotLengthDays: string;
  stageDay: string;
  renewalMonths: string;
  notes: string;
};

const EMPTY: Form = {
  name: "",
  industry: "",
  seats: "",
  stage: "pilot",
  employees: "",
  pilotLengthDays: "60",
  stageDay: "1",
  renewalMonths: "",
  notes: "",
};

const STEPS: { key: BuildStep | "read"; label: string }[] = [
  { key: "read", label: "Reading your notes" },
  { key: "plan", label: "Plan and people" },
  { key: "kit", label: "Setup guide and champion kit" },
  { key: "app", label: "Customer app created" },
];

const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

export function NewAccountForm() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [phase, setPhase] = useState<"idle" | "building" | "done" | "error">("idle");
  const [done, setDone] = useState<Set<BuildStep>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(0);

  useEffect(() => {
    if (phase !== "building") return;
    const t = window.setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 500);
    return () => window.clearInterval(t);
  }, [phase]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      industry: form.industry,
      seats: num(form.seats) ?? NaN,
      stage: form.stage,
      notes: form.notes,
      employees: num(form.employees),
      pilotLengthDays: form.stage === "pilot" ? num(form.pilotLengthDays) : undefined,
      stageDay: num(form.stageDay),
      renewalMonths: form.stage !== "pilot" ? num(form.renewalMonths) : undefined,
    };
    const check = newAccountInputSchema.safeParse(payload);
    if (!check.success) {
      const next: Partial<Record<keyof Form, string>> = {};
      for (const issue of check.error.issues) {
        const key = issue.path[0] as keyof Form;
        next[key] ??= issue.message.startsWith("Invalid") || issue.message.startsWith("Too") ? "Check this field" : issue.message;
      }
      setErrors(next);
      return;
    }

    setPhase("building");
    setDone(new Set());
    setMessage(null);
    started.current = Date.now();
    setElapsed(0);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check.data),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done: finished, value } = await reader.read();
        if (finished) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as BuildEvent;
          if (event.type === "step") setDone((d) => new Set(d).add(event.step));
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "done") {
            setPhase("done");
            window.setTimeout(() => router.push(`/accounts/${event.slug}?new=1`), 900);
            return;
          }
        }
      }
      throw new Error("The build stopped before it finished. Please try again.");
    } catch (err) {
      setPhase("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const busy = phase === "building" || phase === "done";

  if (busy) {
    return (
      <Card className="mx-auto max-w-xl space-y-5 py-8">
        <div className="text-center">
          <p className="text-title font-semibold">
            {phase === "done" ? "Done. Here's their plan." : `Building ${form.name}...`}
          </p>
          <p className="mt-1 text-sm text-ink-muted tabular-nums">
            {phase === "done" ? `Built in ${elapsed} seconds` : `${elapsed}s · Claude is reading your notes and writing everything`}
          </p>
        </div>
        <ol className="mx-auto max-w-sm space-y-3">
          {STEPS.map((s) => {
            const complete = s.key === "read" ? true : done.has(s.key);
            const active = !complete && (s.key === "app" ? done.has("plan") && done.has("kit") : true);
            return (
              <li key={s.key} className="flex items-center gap-3">
                {complete ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-ok text-white" aria-hidden>
                    <svg viewBox="0 0 16 16" className="size-3.5">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
                    </svg>
                  </span>
                ) : (
                  <span
                    className={cn(
                      "size-6 rounded-full border-2",
                      active ? "animate-spin border-accent border-t-transparent" : "border-border-strong",
                    )}
                    aria-hidden
                  />
                )}
                <span className={cn("text-sm", complete ? "font-medium" : "text-ink-muted")}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {phase === "error" && message && (
        <div role="alert" className="rounded-xl border border-watch/30 bg-watch-soft px-5 py-4 text-sm">
          <p className="font-semibold">That didn&apos;t work this time.</p>
          <p className="mt-1">{message} Everything you typed is still here.</p>
        </div>
      )}

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">The basics</h2>
          <button
            type="button"
            onClick={() => {
              setForm(EXAMPLE);
              setErrors({});
            }}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Try example notes
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errors.name}>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Industry" error={errors.industry}>
            <input value={form.industry} onChange={(e) => set("industry", e.target.value)} className={inputClass} placeholder="e.g. Payments" />
          </Field>
          <Field label="Copilot seats" error={errors.seats}>
            <input value={form.seats} onChange={(e) => set("seats", e.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
          <Field label="Stage" error={errors.stage}>
            <select value={form.stage} onChange={(e) => set("stage", e.target.value as Stage)} className={inputClass}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-ink-muted hover:text-ink">More details (optional)</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Employees" error={errors.employees}>
              <input value={form.employees} onChange={(e) => set("employees", e.target.value)} inputMode="numeric" className={inputClass} />
            </Field>
            <Field label="Today is day" error={errors.stageDay}>
              <input value={form.stageDay} onChange={(e) => set("stageDay", e.target.value)} inputMode="numeric" className={inputClass} />
            </Field>
            {form.stage === "pilot" ? (
              <Field label="Pilot length (days)" error={errors.pilotLengthDays}>
                <input value={form.pilotLengthDays} onChange={(e) => set("pilotLengthDays", e.target.value)} inputMode="numeric" className={inputClass} />
              </Field>
            ) : (
              <Field label="Renewal in (months)" error={errors.renewalMonths}>
                <input value={form.renewalMonths} onChange={(e) => set("renewalMonths", e.target.value)} inputMode="numeric" className={inputClass} />
              </Field>
            )}
          </div>
        </details>
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="font-semibold">Deal notes</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Paste them as they are, shorthand and all. Claude pulls out the goals, people, concerns, and plan.
          </p>
        </div>
        <Field label="Deal notes" hideLabel error={errors.notes}>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={10}
            placeholder="call w/ champion + eng managers. want to cut PR review time. security asked about..."
            className={cn(inputClass, "h-auto py-3 leading-relaxed")}
          />
        </Field>
        <p className="text-right text-xs text-ink-faint tabular-nums">{form.notes.length} / 8,000</p>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="text-sm text-ink-muted">Takes about a minute. Builds the plan and the customer&apos;s app.</p>
        <Button type="submit">{phase === "error" ? "Try again" : "Build account"}</Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm focus:border-accent focus:outline-none";

function Field({
  label,
  error,
  hideLabel,
  children,
}: {
  label: string;
  error?: string;
  hideLabel?: boolean;
  children: React.ReactElement;
}) {
  return (
    <label className="block">
      <span className={cn("mb-1.5 block text-sm font-medium", hideLabel && "sr-only")}>{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-risk">{error}</span>}
    </label>
  );
}
