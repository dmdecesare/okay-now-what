"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DraftEditor } from "@/components/ui/draft-editor";

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

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>

      {open && draft && <DraftEditor initial={draft} label={`${title} draft`} />}

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
