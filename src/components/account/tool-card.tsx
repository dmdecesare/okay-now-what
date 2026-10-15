"use client";

import { useState } from "react";
import type { ActionResult } from "@/app/actions/milestones";
import { AiButton } from "@/components/ai-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DraftEditor } from "@/components/ui/draft-editor";

/** One rep tool: an editable, copyable draft, generated live by Claude on demand. */
export function ToolCard({
  title,
  description,
  draft,
  version,
  writtenNote,
  generate,
}: {
  title: string;
  description: string;
  draft: string | null;
  /** Changes whenever a new draft is saved, so the editor reloads with it. */
  version: string;
  writtenNote?: string;
  generate: () => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        {writtenNote && <p className="mt-1 text-xs text-accent-ink">{writtenNote}</p>}
      </div>

      {open && draft && <DraftEditor key={version} initial={draft} label={`${title} draft`} />}

      <div className="mt-auto flex flex-wrap items-start gap-2 pt-1">
        {draft ? (
          <Button type="button" variant={open ? "ghost" : "secondary"} size="sm" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Open draft"}
          </Button>
        ) : null}
        <AiButton
          action={async () => {
            const res = await generate();
            if (res.ok) setOpen(true);
            return res;
          }}
          label={draft ? "Regenerate with Claude" : "Generate with Claude"}
          variant="primary"
        />
      </div>
    </Card>
  );
}
