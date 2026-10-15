"use client";

import { useId, useState } from "react";
import { Button } from "./button";
import { CopyButton } from "./copy-button";

/** Editable, copyable text draft. Edits stay in the browser; copy them anywhere. */
export function DraftEditor({ initial, label, rows = 12 }: { initial: string; label: string; rows?: number }) {
  const [text, setText] = useState(initial);
  const id = useId();

  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-border-strong bg-bg p-3 text-sm leading-relaxed focus:border-accent focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        <CopyButton text={text} label="Copy" variant="primary" />
        {text !== initial && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setText(initial)}>
            Undo my edits
          </Button>
        )}
      </div>
    </div>
  );
}
