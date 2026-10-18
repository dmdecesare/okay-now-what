"use client";

import { useSyncExternalStore } from "react";
import { Check, Rocket } from "lucide-react";
import { docLinks, type DocKey } from "@/lib/resources";
import { cn } from "@/lib/cn";

// A personal first-week checklist for each developer. Progress is kept in this browser only, so
// it's private to the person and needs no sign-in.

const DAYS: { day: string; title: string; detail: string; doc: DocKey }[] = [
  { day: "Day 1", title: "Install Copilot and accept a suggestion", detail: "Set it up in your editor and let it finish a line or two.", doc: "ide-quickstart" },
  { day: "Day 2", title: "Ask Chat to explain some code", detail: "Pick a file you didn't write and ask what it does.", doc: "chat-in-ide" },
  { day: "Day 3", title: "Write tests for one function", detail: "Ask Copilot for unit tests, run them, keep what's useful.", doc: "write-tests" },
  { day: "Day 4", title: "Clean up something with Copilot", detail: "Refactor a small piece of code you've been putting off.", doc: "refactor-cookbook" },
  { day: "Day 5", title: "Get a Copilot review on a pull request", detail: "Request a review before a teammate looks.", doc: "code-review" },
];

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const key = (token: string) => `onw-first-week:${token.slice(0, 8)}`;
function read(token: string): string {
  try {
    return window.localStorage.getItem(key(token)) ?? "";
  } catch {
    return "";
  }
}
function write(token: string, done: number[]) {
  try {
    window.localStorage.setItem(key(token), done.join(","));
  } catch {
    // Private mode: progress just isn't remembered.
  }
  listeners.forEach((l) => l());
}

export function FirstWeek({ token }: { token: string }) {
  const raw = useSyncExternalStore(subscribe, () => read(token), () => "");
  const done = raw ? raw.split(",").map(Number) : [];
  const count = done.length;

  return (
    <section className="rounded-xl border border-border bg-bg p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Rocket className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">Your first week with Copilot</h2>
            <p className="text-sm text-ink-muted">Five small things, one a day. Your progress is saved on this device.</p>
          </div>
        </div>
        <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink-muted">
          {count} of {DAYS.length} done
        </span>
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-5">
        {DAYS.map((d, i) => {
          const isDone = done.includes(i);
          const link = docLinks([d.doc])[0];
          return (
            <li key={d.day} className={cn("flex flex-col rounded-lg border p-3", isDone ? "border-ok/30 bg-ok-soft/40" : "border-border")}>
              <button
                type="button"
                onClick={() => write(token, isDone ? done.filter((x) => x !== i) : [...done, i].sort())}
                aria-pressed={isDone}
                className="flex items-center gap-2 text-left"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border",
                    isDone ? "border-ok bg-ok text-white" : "border-border-strong bg-bg",
                  )}
                  aria-hidden
                >
                  {isDone && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="text-xs font-semibold text-ink-faint">{d.day}</span>
              </button>
              <p className="mt-2 text-sm font-medium leading-snug">{d.title}</p>
              <p className="mt-1 flex-1 text-xs text-ink-muted">{d.detail}</p>
              {link && (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-medium text-accent hover:text-accent-hover">
                  How to do it
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
