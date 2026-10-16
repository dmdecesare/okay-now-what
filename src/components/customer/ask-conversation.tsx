"use client";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatThread, StarterQuestions } from "@/components/chat/chat-thread";
import { sourcesIn } from "@/lib/ai/format";
import { docLinks } from "@/lib/resources";
import { cn } from "@/lib/cn";
import { DocLinkList } from "./doc-link-list";
import { useAsk } from "./ask-provider";

/** The customer's Ask conversation: starters, streamed answers with their sources, and the question box. */
export function AskConversation({ variant }: { variant: "panel" | "page" }) {
  const { turns, busy, ask, config } = useAsk();

  return (
    <div className={cn("flex flex-col", variant === "panel" ? "h-full" : "gap-5")}>
      <div className={cn(variant === "panel" && "min-h-0 flex-1 overflow-y-auto px-4 py-4")}>
        {turns.length === 0 ? (
          <div className="space-y-5">
            {variant === "panel" && (
              <div className="rounded-xl bg-gradient-to-br from-accent-soft to-bg p-4">
                <p className="text-sm font-semibold">Hi! Ask me anything about Copilot.</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Answers are written for your team and link to the official GitHub docs they come from.
                </p>
              </div>
            )}
            {config && <StarterQuestions starters={config.starters} onPick={(q) => void ask(q)} />}
          </div>
        ) : (
          <ChatThread
            turns={turns}
            renderAfter={(t) => <DocLinkList links={docLinks(sourcesIn(t.a))} heading="Sources" />}
          />
        )}
      </div>
      <div className={cn(variant === "panel" && "border-t border-border bg-bg p-3")}>
        <ChatComposer
          onSend={(q) => void ask(q)}
          busy={busy || !config}
          placeholder={turns.length ? "Ask a follow-up" : "Ask anything about Copilot"}
        />
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          Written by Claude, an AI model. Double-check anything important in the linked docs.
          {config?.preview ? " Preview: questions aren't saved." : ""}
        </p>
      </div>
    </div>
  );
}
