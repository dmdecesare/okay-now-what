"use client";

import { useId, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

/** Question box with a send button. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
  onSend,
  busy,
  placeholder,
  className,
}: {
  onSend: (q: string) => void;
  busy: boolean;
  placeholder: string;
  className?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const ready = !busy && value.trim().length >= 3;

  function send() {
    if (!ready) return;
    onSend(value);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className={cn("flex items-end gap-2 rounded-xl border border-border-strong bg-bg p-1.5 shadow-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15", className)}
    >
      <label htmlFor={id} className="sr-only">
        Your question
      </label>
      <textarea
        id={id}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        maxLength={1000}
        placeholder={placeholder}
        className="max-h-32 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-ink-faint [field-sizing:content]"
      />
      <button
        type="submit"
        disabled={!ready}
        aria-label={busy ? "Waiting for the answer" : "Send"}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent-hover disabled:bg-surface-strong disabled:text-ink-faint"
      >
        <ArrowUp className="size-4" />
      </button>
    </form>
  );
}
