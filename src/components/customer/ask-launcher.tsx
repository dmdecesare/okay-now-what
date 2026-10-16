"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { AskConversation } from "./ask-conversation";
import { useAsk } from "./ask-provider";

/** The floating Ask button in the bottom-left corner of every portal page, and its chat panel. */
export function AskLauncher({ token, starters }: { token: string; starters: string[] }) {
  const { setConfig, open, setOpen, turns } = useAsk();
  const preview = useSearchParams().get("preview") === "1";
  const pathname = usePathname();
  const onAskPage = pathname.endsWith("/ask");
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    setConfig({ token, starters, preview });
  }, [setConfig, token, starters, preview]);

  // The full Ask page shows the same conversation, so the floating panel steps aside there.
  useEffect(() => {
    if (onAskPage) setOpen(false);
  }, [onAskPage, setOpen]);

  if (onAskPage) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-[#0b1a17] pl-3 pr-4 text-sm font-semibold text-white shadow-panel ring-1 ring-white/10 transition-transform hover:-translate-y-0.5",
          "mb-[env(safe-area-inset-bottom)] print:hidden",
          open && "max-sm:hidden",
        )}
      >
        <span className="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#14b8a6] to-accent">
          <Sparkles className="size-4" />
          {turns.length === 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#5eead4] ring-2 ring-[#0b1a17]" aria-hidden />
          )}
        </span>
        {open ? "Close" : "Ask about Copilot"}
      </button>

      <Sheet
        open={open}
        onClose={close}
        placement="bottom-left"
        title={
          <span className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-white">
              <Sparkles className="size-3.5" />
            </span>
            Copilot assistant
          </span>
        }
        subtitle="Answers for your team, from official GitHub docs"
      >
        <AskConversation variant="panel" />
      </Sheet>
    </>
  );
}
