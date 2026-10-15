"use client";

import { useEffect, useRef, useState } from "react";
import { ASK_ERROR_MARKER } from "@/lib/ask";
import { sourcesIn } from "@/lib/ai/format";
import { docLinks } from "@/lib/resources";
import { AnswerText } from "./answer-text";
import { DocLinkList } from "./doc-link-list";
import { cn } from "@/lib/cn";

type Turn = { q: string; a: string; status: "streaming" | "done" | "error" };

/** The customer's Ask assistant. Streams answers from /api/ask; follow-ups keep recent context. */
export function AskChat({ token, starters }: { token: string; starters: string[] }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  function update(index: number, patch: Partial<Turn>) {
    setTurns((t) => t.map((turn, i) => (i === index ? { ...turn, ...patch } : turn)));
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput("");
    const index = turns.length;
    const history = turns.filter((t) => t.status === "done").slice(-4).map(({ q, a }) => ({ q, a }));
    setTurns((t) => [...t, { q, a: "", status: "streaming" }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, question: q, history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        update(index, { a: data.error ?? "Something went wrong. Please try again.", status: "error" });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const markerAt = text.indexOf(ASK_ERROR_MARKER);
        if (markerAt >= 0) {
          update(index, { a: text.slice(markerAt + ASK_ERROR_MARKER.length), status: "error" });
          return;
        }
        update(index, { a: text });
      }
      update(index, { a: text, status: "done" });
    } catch {
      update(index, { a: "We couldn't reach the assistant. Check your connection and try again.", status: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-border-strong px-3 py-1.5 text-left text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {turns.map((t, i) => (
        <div key={i} className="space-y-3">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2 text-sm text-white">{t.q}</p>
          </div>
          <div
            className={cn(
              "max-w-[95%] rounded-2xl rounded-bl-sm px-4 py-3",
              t.status === "error" ? "bg-watch-soft text-ink" : "bg-surface",
            )}
          >
            {t.a ? (
              <AnswerText text={t.a} />
            ) : (
              <p className="text-sm text-ink-faint" aria-live="polite">
                Thinking...
              </p>
            )}
            {t.status === "done" && <DocLinkList links={docLinks(sourcesIn(t.a))} heading="Sources" />}
          </div>
        </div>
      ))}
      <div ref={endRef} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="flex gap-2 border-t border-border pt-4"
      >
        <label htmlFor="ask-input" className="sr-only">
          Your question
        </label>
        <input
          id="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder={turns.length ? "Ask a follow-up" : "Ask anything about Copilot"}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border-strong bg-bg px-3 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 3}
          className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? "Asking..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
