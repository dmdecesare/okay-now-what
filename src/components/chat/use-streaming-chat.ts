"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { STREAM_ERROR_MARKER } from "@/lib/ask";

export type Turn = { q: string; a: string; status: "streaming" | "done" | "error" };

/**
 * Shared by the customer Ask assistant and the rep chat. Posts a question with recent history to
 * a streaming route and grows the answer as text arrives. A route that can't answer ends its stream
 * with STREAM_ERROR_MARKER and a friendly message.
 */
export function useStreamingChat({
  endpoint,
  body,
  historyTurns = 4,
}: {
  endpoint: string;
  /** Builds the request body. Read at send time, so it can depend on the latest props. */
  body: (question: string, history: { q: string; a: string }[]) => Record<string, unknown> | null;
  historyTurns?: number;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(body);
  const turnsRef = useRef(turns);
  useLayoutEffect(() => {
    bodyRef.current = body;
    turnsRef.current = turns;
  });

  const update = useCallback((index: number, patch: Partial<Turn>) => {
    setTurns((t) => t.map((turn, i) => (i === index ? { ...turn, ...patch } : turn)));
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      const current = turnsRef.current;
      const history = current
        .filter((t) => t.status === "done")
        .slice(-historyTurns)
        .map(({ q, a }) => ({ q, a }));
      const payload = bodyRef.current(q, history);
      if (!payload) return;

      setBusy(true);
      const index = current.length;
      setTurns((t) => [...t, { q, a: "", status: "streaming" }]);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
          const markerAt = text.indexOf(STREAM_ERROR_MARKER);
          if (markerAt >= 0) {
            update(index, { a: text.slice(markerAt + STREAM_ERROR_MARKER.length), status: "error" });
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
    },
    [busy, endpoint, historyTurns, update],
  );

  const reset = useCallback(() => setTurns([]), []);

  return { turns, busy, ask, reset };
}
