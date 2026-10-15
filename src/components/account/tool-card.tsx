"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";

/** One rep tool: shows an editable, copyable draft when one exists. Generate goes live in Phase 5. */
export function ToolCard({
  title,
  description,
  draft,
}: {
  title: string;
  description: string;
  draft: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(draft ?? "");

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>

      {open && (
        <div className="space-y-2">
          <label className="sr-only" htmlFor={`draft-${title}`}>
            {title} draft
          </label>
          <textarea
            id={`draft-${title}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-border-strong bg-bg p-3 font-mono text-sm leading-relaxed focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={text} label="Copy draft" variant="primary" />
            {draft && text !== draft && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setText(draft)}>
                Undo my edits
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {draft ? (
          <Button type="button" variant={open ? "ghost" : "secondary"} size="sm" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Open draft"}
          </Button>
        ) : null}
        <Button type="button" size="sm" disabled title="Live generation arrives with the AI features">
          {draft ? "Regenerate" : "Generate"}
        </Button>
      </div>
    </Card>
  );
}
