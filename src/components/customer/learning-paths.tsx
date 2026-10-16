"use client";

import Link from "next/link";
import { useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import { Check, Clock, PlayCircle, Shield, UserCog, Users, Code2 } from "lucide-react";
import { setChallengeDone } from "@/app/actions/learning";
import { Button } from "@/components/ui/button";
import {
  CHALLENGES,
  LEARNING_ROLES,
  PATHS,
  ROLE_LABELS,
  nameKey,
  type ChallengeId,
  type LearningRole,
} from "@/lib/learning";
import { docLinks } from "@/lib/resources";
import { cn } from "@/lib/cn";
import { DocLinkList } from "./doc-link-list";

// The learner is remembered in this browser only (there is no login). Their check-offs are saved
// on the server under the name they chose, so the team leaderboard can count them.

type Learner = { name: string; role: LearningRole };

const ROLE_ICONS: Record<LearningRole, typeof Code2> = {
  developer: Code2,
  team_lead: Users,
  admin: UserCog,
  security: Shield,
};

function storageKey(token: string) {
  return `onw-learn:${token.slice(0, 8)}`;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function readLearner(token: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(token));
  } catch {
    return null;
  }
}
function writeLearner(token: string, learner: Learner | null) {
  try {
    if (learner) window.localStorage.setItem(storageKey(token), JSON.stringify(learner));
    else window.localStorage.removeItem(storageKey(token));
  } catch {
    // Private mode: the learner just isn't remembered between visits.
  }
  listeners.forEach((l) => l());
}

function parseLearner(raw: string | null): Learner | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Learner;
    return typeof v.name === "string" && (LEARNING_ROLES as readonly string[]).includes(v.role) ? v : null;
  } catch {
    return null;
  }
}

export function LearningPaths({
  token,
  preview,
  progress,
}: {
  token: string;
  preview: boolean;
  /** Challenge ids done, by nameKey. */
  progress: Record<string, ChallengeId[]>;
}) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readLearner(token),
    () => null,
  );
  const learner = parseLearner(raw);

  if (!learner) return <JoinForm onJoin={(l) => writeLearner(token, l)} />;
  return (
    <Path
      token={token}
      preview={preview}
      learner={learner}
      done={progress[nameKey(learner.name)] ?? []}
      onSwitch={() => writeLearner(token, null)}
      onRole={(role) => writeLearner(token, { ...learner, role })}
    />
  );
}

function JoinForm({ onJoin }: { onJoin: (l: Learner) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<LearningRole>("developer");
  const valid = /^[\p{L}\p{N} .'-]{2,24}$/u.test(name.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onJoin({ name: name.trim(), role });
      }}
      className="rounded-2xl border border-border bg-bg p-6 shadow-card"
    >
      <h2 className="text-title font-semibold">Start your learning path</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Pick your role and we&apos;ll give you a short list of hands-on challenges. Each one takes 5 to 20 minutes.
      </p>
      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">Your role</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEARNING_ROLES.map((r) => {
            const Icon = ROLE_ICONS[r];
            return (
              <label
                key={r}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors",
                  role === r ? "border-accent bg-accent-soft/60 ring-2 ring-accent/15" : "border-border hover:border-border-strong",
                )}
              >
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                <Icon className="size-5 text-accent" aria-hidden />
                <span className="text-sm font-semibold">{ROLE_LABELS[r].label}</span>
                <span className="text-xs text-ink-muted">{ROLE_LABELS[r].blurb}</span>
                <span className="mt-1 text-xs text-ink-faint">{PATHS[r].length} challenges</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex-1 sm:max-w-xs">
          <span className="mb-1.5 block text-sm font-medium">Your name for the team leaderboard</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="First name and last initial"
            className="h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>
        <Button type="submit" disabled={!valid}>
          Start learning
        </Button>
      </div>
      <p className="mt-2 text-xs text-ink-faint">Your teammates on this portal can see your name and how many challenges you&apos;ve done.</p>
    </form>
  );
}

function Path({
  token,
  preview,
  learner,
  done,
  onSwitch,
  onRole,
}: {
  token: string;
  preview: boolean;
  learner: Learner;
  done: ChallengeId[];
  onSwitch: () => void;
  onRole: (r: LearningRole) => void;
}) {
  const [optimistic, setOptimistic] = useOptimistic(new Set(done), (state: Set<ChallengeId>, change: { id: ChallengeId; done: boolean }) => {
    const next = new Set(state);
    if (change.done) next.add(change.id);
    else next.delete(change.id);
    return next;
  });
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const path = PATHS[learner.role];
  const finished = path.filter((id) => optimistic.has(id)).length;
  const pct = Math.round((finished / path.length) * 100);

  function toggle(id: ChallengeId, next: boolean) {
    if (preview) return;
    setError(null);
    startTransition(async () => {
      setOptimistic({ id, done: next });
      const res = await setChallengeDone(token, { name: learner.name, role: learner.role, challengeId: id, done: next });
      if (!res.ok) setError(res.message);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-bg p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">
              Hi {learner.name.split(" ")[0]}.{" "}
              <button type="button" onClick={onSwitch} className="font-medium text-accent hover:text-accent-hover">
                Not you?
              </button>
            </p>
            <h2 className="text-title font-semibold">{ROLE_LABELS[learner.role].label} path</h2>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1 text-xs font-medium" role="group" aria-label="Choose a path">
            {LEARNING_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRole(r)}
                aria-pressed={learner.role === r}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors",
                  learner.role === r ? "bg-bg text-ink shadow-card" : "text-ink-muted hover:text-ink",
                )}
              >
                {ROLE_LABELS[r].label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Path progress">
            <div className="h-full rounded-full bg-chart-1 transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {finished} of {path.length}
          </span>
        </div>
        {preview && <p className="mt-3 text-xs text-ink-faint">Rep preview: check-offs aren&apos;t saved.</p>}
        {error && (
          <p role="alert" className="mt-3 text-sm text-watch">
            {error}
          </p>
        )}
      </div>

      <ol className="space-y-3">
        {path.map((id, i) => {
          const c = CHALLENGES[id];
          const isDone = optimistic.has(id);
          return (
            <li
              key={id}
              className={cn(
                "rounded-xl border bg-bg p-5 shadow-card transition-colors",
                isDone ? "border-ok/25 bg-ok-soft/30" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isDone ? "bg-ok text-white" : "bg-accent-soft text-accent-ink",
                    )}
                    aria-hidden
                  >
                    {isDone ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{c.why}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                  <Clock className="size-3.5" aria-hidden /> {c.minutes} min
                </span>
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-[3.25rem] text-sm">
                {c.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3 pl-10">
                <div className="min-w-0">
                  <DocLinkList links={docLinks(c.docs)} />
                  {c.videoGroup && (
                    <Link
                      href={`/c/${token}/videos${preview ? "?preview=1" : ""}`}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
                    >
                      <PlayCircle className="size-4" /> Watch the short video
                    </Link>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isDone ? "secondary" : "primary"}
                  disabled={preview}
                  onClick={() => toggle(id, !isDone)}
                >
                  {isDone ? "Done. Undo?" : "Mark done"}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
