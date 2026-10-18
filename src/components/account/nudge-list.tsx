"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BellRing, Mail } from "lucide-react";
import { draftNudgeEmail } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import { DraftEditor } from "@/components/ui/draft-editor";
import type { Nudge } from "@/lib/nudges";
import { cn } from "@/lib/cn";

const TAB: Record<Nudge["target"], string> = {
  plan: "/plan",
  learn: "/adoption",
  videos: "/adoption",
  home: "/adoption",
  questions: "/questions",
  overview: "",
  adoption: "/adoption",
};

function NudgeRow({ slug, nudge }: { slug: string; nudge: Nudge }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-2.5">
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", nudge.tone === "warn" ? "bg-watch" : "bg-chart-1")} aria-hidden />
        <div className="min-w-0 flex-1">
          <Link href={`/accounts/${slug}${TAB[nudge.target]}`} className="text-sm hover:text-accent">
            {nudge.rep}
          </Link>
          {!nudge.repOnly && <p className="mt-0.5 text-xs text-ink-faint">The customer sees this on their portal too.</p>}
          {!draft && (
            <Button
              type="button"
              size="xs"
              variant="secondary"
              className="mt-2"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  const res = await draftNudgeEmail(slug, nudge.key);
                  if (res.ok) setDraft(res.text);
                  else setError(res.message);
                })
              }
            >
              <Mail />
              {pending ? "Writing..." : "Draft email"}
            </Button>
          )}
          {error && <p role="alert" className="mt-1 text-xs text-watch">{error}</p>}
          {draft && (
            <div className="mt-2">
              <DraftEditor initial={draft} label="Nudge email" rows={8} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** Automatic nudges for one account, each with a one-click email draft. */
export function NudgeList({ slug, nudges }: { slug: string; nudges: Nudge[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <div className="flex items-start gap-2.5 border-b border-border px-5 py-4">
        <BellRing className="mt-0.5 size-4 text-ink-faint" />
        <div>
          <h2 className="text-sm font-semibold">Nudges</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Things that need a push, found automatically.</p>
        </div>
      </div>
      <div className="p-5">
        {nudges.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing needs a nudge right now.</p>
        ) : (
          <ul className="divide-y divide-border">
            {nudges.slice(0, 6).map((n) => (
              <NudgeRow key={n.key} slug={slug} nudge={n} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
