"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatThread, StarterQuestions } from "@/components/chat/chat-thread";
import { useStreamingChat } from "@/components/chat/use-streaming-chat";
import { AccountLogo } from "@/components/logos/account-logo";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";

// The rep's assistant. It lives in the rep layout, so the conversation carries on across pages.
// On an account page it focuses on that account; the rep can switch to the whole book.

type AccountRef = { slug: string; name: string; atRisk: boolean };

const RepChatContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function useRepChat() {
  const ctx = useContext(RepChatContext);
  if (!ctx) throw new Error("useRepChat must be used inside RepChatProvider");
  return ctx;
}

export function RepChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <RepChatContext.Provider value={{ open, setOpen }}>{children}</RepChatContext.Provider>;
}

/** The "Ask AI" button for the top bar. */
export function AskClaudeButton({ className }: { className?: string }) {
  const { open, setOpen } = useRepChat();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={cn(
        "group inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-bg pl-2 pr-2.5 text-sm font-medium text-ink shadow-card transition-colors hover:border-accent/40",
        className,
      )}
    >
      <span className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-[#14b8a6] to-accent text-white">
        <Sparkles className="size-3" />
      </span>
      <span className="max-sm:sr-only">Ask AI</span>
      <kbd className="hidden rounded border border-border bg-surface px-1 font-sans text-[10px] text-ink-faint lg:inline">⌘J</kbd>
    </button>
  );
}

const BOOK_STARTERS = [
  "Which accounts need me this week, and why?",
  "Where is my best expansion opportunity?",
  "Which champions have gone quiet?",
  "Summarize my book in three bullets for my manager.",
];

function accountStarters(a: AccountRef): string[] {
  return [
    `What should I cover on my next call with ${a.name}?`,
    a.atRisk ? `Why is ${a.name} at risk, and what's the fastest fix?` : `What's going well at ${a.name}?`,
    `Draft a short check-in note to the champion at ${a.name}.`,
  ];
}

/** The chat panel itself. Mounted once in the rep layout; reads the open account from the URL. */
export function RepChatPanel({ accounts }: { accounts: AccountRef[] }) {
  const { open, setOpen } = useRepChat();
  const pathname = usePathname();
  const pageSlug = pathname.match(/^\/accounts\/([a-z0-9-]+)/)?.[1];
  const pageAccount = pageSlug && pageSlug !== "new" ? accounts.find((a) => a.slug === pageSlug) : undefined;
  // "Whole book" is remembered per account page, so opening another account focuses on it again.
  const [bookWideOn, setBookWideOn] = useState<string | null>(null);
  const bookWide = !!pageSlug && bookWideOn === pageSlug;
  const setBookWide = (on: boolean) => setBookWideOn(on && pageSlug ? pageSlug : null);
  const focus = pageAccount && !bookWide ? pageAccount : undefined;

  const internalHrefs = useMemo(() => {
    const tabs = ["", "/plan", "/adoption", "/spend", "/health", "/questions", "/tools", "/brief"];
    return new Set(accounts.flatMap((a) => tabs.map((t) => `/accounts/${a.slug}${t}`)));
  }, [accounts]);

  const { turns, busy, ask, reset } = useStreamingChat({
    endpoint: "/api/rep-chat",
    historyTurns: 6,
    body: (question, history) => ({ question, history, focus: focus?.slug ?? null }),
  });
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Sheet
      open={open}
      onClose={close}
      placement="right"
      title={
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-[#14b8a6] to-accent text-white">
            <Sparkles className="size-3.5" />
          </span>
          Ask AI about your book
        </span>
      }
      subtitle="Answers from your accounts' live data"
      headerExtra={
        turns.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Start a new conversation"
            title="New conversation"
          >
            <RotateCcw className="size-4" />
          </button>
        )
      }
      footer={
        <div className="space-y-2 p-3">
          {pageAccount && (
            <div className="flex items-center gap-1 rounded-lg bg-surface p-1 text-xs font-medium" role="group" aria-label="What to ask about">
              <button
                type="button"
                onClick={() => setBookWide(false)}
                aria-pressed={!bookWide}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 transition-colors",
                  !bookWide ? "bg-bg text-ink shadow-card" : "text-ink-muted hover:text-ink",
                )}
              >
                <AccountLogo name={pageAccount.name} slug={pageAccount.slug} size={14} className="rounded-[3px] shadow-none" />
                <span className="truncate">{pageAccount.name}</span>
              </button>
              <button
                type="button"
                onClick={() => setBookWide(true)}
                aria-pressed={bookWide}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 transition-colors",
                  bookWide ? "bg-bg text-ink shadow-card" : "text-ink-muted hover:text-ink",
                )}
              >
                Whole book
              </button>
            </div>
          )}
          <ChatComposer
            onSend={(q) => void ask(q)}
            busy={busy}
            placeholder={focus ? `Ask about ${focus.name}` : "Ask about your accounts"}
          />
          <p className="text-center text-[11px] text-ink-faint">Claude can make mistakes. Check the account before you act.</p>
        </div>
      }
    >
      <div
        className="px-4 py-4"
        onClickCapture={(e) => {
          // On phones the panel covers the page, so following a link in an answer closes it.
          if ((e.target as HTMLElement).closest("a") && window.matchMedia("(max-width: 639px)").matches) close();
        }}
      >
        {turns.length === 0 ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-accent-soft to-bg p-4">
              <p className="text-sm font-semibold">{focus ? `Ask me about ${focus.name}` : "Ask me about your book"}</p>
              <p className="mt-1 text-sm text-ink-muted">
                I can see every account&apos;s health, adoption, spend, plan, and customer questions. Nothing you ask here is
                saved.
              </p>
            </div>
            <StarterQuestions starters={focus ? accountStarters(focus) : BOOK_STARTERS} onPick={(q) => void ask(q)} />
          </div>
        ) : (
          <ChatThread turns={turns} internalHrefs={internalHrefs} />
        )}
      </div>
    </Sheet>
  );
}

/** The bright "Ask AI" button for the home hero. */
export function HeroAskClaude() {
  const { setOpen } = useRepChat();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3.5 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-white/90"
    >
      <Sparkles className="size-4 text-accent" />
      Ask AI about your book
    </button>
  );
}
