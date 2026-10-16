"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { applyCallUpdate, proposeCallUpdate } from "@/app/actions/calls";
import { Button } from "@/components/ui/button";
import { DraftEditor } from "@/components/ui/draft-editor";
import type { CallUpdate } from "@/lib/schemas";
import { cn } from "@/lib/cn";

type Milestone = { id: string; title: string };

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
        checked ? "border-accent/40 bg-accent-soft/40" : "border-border bg-bg hover:border-border-strong",
      )}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      {note && <p className="mb-2 text-xs text-ink-faint">{note}</p>}
      <div className={cn("space-y-2", !note && "mt-2")}>{children}</div>
    </div>
  );
}

/** Paste call notes, review what Claude proposes, then save the ticked changes to the account. */
export function LogCallForm({ slug, today, milestones }: { slug: string; today: string; milestones: Milestone[] }) {
  const [notes, setNotes] = useState("");
  const [occurredOn, setOccurredOn] = useState(today);
  const [proposal, setProposal] = useState<CallUpdate | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reading, startReading] = useTransition();
  const [saving, startSaving] = useTransition();
  const title = (id: string) => milestones.find((m) => m.id === id)?.title ?? "Milestone";
  const on = (key: string) => picked[key] !== false;
  const toggle = (key: string) => (v: boolean) => setPicked((p) => ({ ...p, [key]: v }));

  if (saved) {
    return (
      <div className="rounded-xl border border-ok/25 bg-ok-soft/50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-ok" />
        <p className="mt-2 font-semibold">Saved to the account.</p>
        <p className="mt-1 text-sm text-ink-muted">The plan, people, and call log are updated. Customer-facing milestones now show in their portal.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={`/accounts/${slug}`} className="text-sm font-medium text-accent hover:text-accent-hover">
            Back to the account
          </Link>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startReading(async () => {
            const res = await proposeCallUpdate(slug, notes, occurredOn);
            if (!res.ok) return setError(res.message);
            setProposal(res.proposal);
            setSummary(res.proposal.summary);
            setPicked({});
          });
        }}
        className="space-y-4 rounded-xl border border-border bg-bg p-5 shadow-card"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-semibold">Your call notes</p>
            <p className="text-sm text-ink-muted">Paste them as they are, shorthand and all. Claude proposes the updates, and you choose what to save.</p>
          </div>
          <label className="text-sm">
            <span className="mr-2 text-ink-muted">Call date</span>
            <input
              type="date"
              value={occurredOn}
              max={today}
              onChange={(e) => setOccurredOn(e.target.value)}
              className="h-9 rounded-lg border border-border-strong bg-bg px-2 text-sm"
            />
          </label>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          maxLength={8000}
          placeholder="call w/ Elena + claims lead. agreed to run the legacy java session next thurs. custom instructions file is drafted, needs review. CIO wants the monthly update by friday..."
          className="w-full rounded-lg border border-border-strong bg-bg p-3 font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {error ? <p role="alert" className="text-sm text-watch">{error}</p> : <span className="text-xs text-ink-faint">{notes.length} / 8,000</span>}
          <Button type="submit" disabled={reading || notes.trim().length < 20}>
            <Sparkles />
            {reading ? "Claude is reading your notes..." : "Read my notes"}
          </Button>
        </div>
      </form>
    );
  }

  const p = proposal;
  const nothing =
    !p.completedMilestoneIds.length &&
    !p.startedMilestoneIds.length &&
    !p.rescheduledMilestones.length &&
    !p.newMilestones.length &&
    !p.newConcerns.length &&
    !p.newStakeholders.length &&
    !p.championNote;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      <div className="space-y-5 rounded-xl border border-border bg-bg p-5 shadow-card lg:col-span-3">
        <div>
          <p className="font-semibold">Proposed updates</p>
          <p className="text-sm text-ink-muted">Untick anything you don&apos;t want. Nothing is saved until you click Save.</p>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold">Call summary</p>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-strong bg-bg p-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        {nothing && <p className="text-sm text-ink-muted">No plan or people changes in these notes. The summary still goes in the call log.</p>}
        {(p.completedMilestoneIds.length > 0 || p.startedMilestoneIds.length > 0 || p.rescheduledMilestones.length > 0) && (
          <Group title="Plan progress">
            {p.completedMilestoneIds.map((id) => (
              <Check key={`done-${id}`} checked={on(`done-${id}`)} onChange={toggle(`done-${id}`)}>
                Mark <span className="font-medium">{title(id)}</span> as done
              </Check>
            ))}
            {p.startedMilestoneIds.map((id) => (
              <Check key={`start-${id}`} checked={on(`start-${id}`)} onChange={toggle(`start-${id}`)}>
                Mark <span className="font-medium">{title(id)}</span> as in progress
              </Check>
            ))}
            {p.rescheduledMilestones.map((r) => (
              <Check key={`move-${r.id}`} checked={on(`move-${r.id}`)} onChange={toggle(`move-${r.id}`)}>
                Move <span className="font-medium">{title(r.id)}</span> to {r.dueInDays === 0 ? "today" : `${r.dueInDays} ${r.dueInDays === 1 ? "day" : "days"} from now`}
              </Check>
            ))}
          </Group>
        )}
        {p.newMilestones.length > 0 && (
          <Group title="New milestones" note="These show in the customer's portal.">
            {p.newMilestones.map((m, i) => (
              <Check key={`ms-${i}`} checked={on(`ms-${i}`)} onChange={toggle(`ms-${i}`)}>
                <span className="font-medium">{m.title}</span>
                <span className="block text-ink-muted">{m.description}</span>
                <span className="block text-xs text-ink-faint">Due in {m.dueInDays} {m.dueInDays === 1 ? "day" : "days"}</span>
              </Check>
            ))}
          </Group>
        )}
        {p.newConcerns.length > 0 && (
          <Group title="New concerns" note="Only you see these.">
            {p.newConcerns.map((c, i) => (
              <Check key={`c-${i}`} checked={on(`c-${i}`)} onChange={toggle(`c-${i}`)}>
                <span className="font-medium">{c.concern}</span> <span className="text-ink-faint">· {c.raisedBy}</span>
                <span className="block text-ink-muted">Our plan: {c.response}</span>
              </Check>
            ))}
          </Group>
        )}
        {(p.newStakeholders.length > 0 || p.championNote) && (
          <Group title="People" note="Only you see these.">
            {p.newStakeholders.map((s, i) => (
              <Check key={`s-${i}`} checked={on(`s-${i}`)} onChange={toggle(`s-${i}`)}>
                Add <span className="font-medium">{s.name ? `${s.name}, ${s.title}` : s.title}</span>
                <span className="block text-ink-muted">{s.notes}</span>
              </Check>
            ))}
            {p.championNote && (
              <Check checked={on("champion")} onChange={toggle("champion")}>
                Update the champion note
                <span className="block text-ink-muted">{p.championNote}</span>
              </Check>
            )}
          </Group>
        )}
        {error && (
          <p role="alert" className="text-sm text-watch">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={() => setProposal(null)}>
            Edit notes
          </Button>
          <Button
            type="button"
            disabled={saving || !summary.trim()}
            onClick={() =>
              startSaving(async () => {
                setError(null);
                const res = await applyCallUpdate(slug, {
                  notes,
                  occurredOn,
                  summary,
                  completedMilestoneIds: p.completedMilestoneIds.filter((id) => on(`done-${id}`)),
                  startedMilestoneIds: p.startedMilestoneIds.filter((id) => on(`start-${id}`)),
                  rescheduledMilestones: p.rescheduledMilestones.filter((r) => on(`move-${r.id}`)),
                  newMilestones: p.newMilestones.filter((_, i) => on(`ms-${i}`)),
                  newConcerns: p.newConcerns.filter((_, i) => on(`c-${i}`)),
                  newStakeholders: p.newStakeholders.filter((_, i) => on(`s-${i}`)),
                  championNote: p.championNote && on("champion") ? p.championNote : null,
                });
                if (!res.ok) setError(res.message ?? "Couldn't save. Please try again.");
                else setSaved(true);
              })
            }
          >
            <CheckCircle2 />
            {saving ? "Saving..." : "Save to account"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg p-5 shadow-card lg:col-span-2">
        <p className="font-semibold">Follow-up email</p>
        <p className="mb-3 text-sm text-ink-muted">Written by Claude from your notes. Edit it, then copy it into your email.</p>
        <DraftEditor initial={p.followUpEmail} label="Follow-up email" rows={16} />
      </div>
    </div>
  );
}
