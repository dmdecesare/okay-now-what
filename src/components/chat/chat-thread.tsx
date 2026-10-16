"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { AnswerText } from "./answer-text";
import type { Turn } from "./use-streaming-chat";
import { cn } from "@/lib/cn";

/** The message list for a chat: question bubbles, streamed answers, and anything to show under an answer. */
export function ChatThread({
  turns,
  internalHrefs,
  renderAfter,
  className,
}: {
  turns: Turn[];
  internalHrefs?: ReadonlySet<string>;
  renderAfter?: (turn: Turn) => React.ReactNode;
  className?: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  return (
    <div className={cn("space-y-5", className)}>
      {turns.map((t, i) => (
        <div key={i} className="space-y-3">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-white shadow-sm">{t.q}</p>
          </div>
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden>
              <Sparkles className="size-3.5" />
            </span>
            <div
              className={cn(
                "min-w-0 max-w-[92%] rounded-2xl rounded-tl-md border px-3.5 py-2.5",
                t.status === "error" ? "border-watch/25 bg-watch-soft" : "border-border bg-surface/70",
              )}
            >
              {t.a ? (
                <AnswerText text={t.a} internalHrefs={internalHrefs} />
              ) : (
                <p className="flex items-center gap-1.5 py-1 text-sm text-ink-faint" aria-live="polite">
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-faint" />
                  <span className="sr-only">Thinking</span>
                </p>
              )}
              {t.status === "done" && renderAfter?.(t)}
            </div>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

/** Suggested first questions, shown before the conversation starts. */
export function StarterQuestions({
  starters,
  onPick,
  label = "Try asking",
}: {
  starters: string[];
  onPick: (q: string) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-faint">{label}</p>
      <div className="flex flex-col gap-2">
        {starters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-bg px-3 py-2 text-left text-sm text-ink-muted shadow-card transition-colors hover:border-accent/40 hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
