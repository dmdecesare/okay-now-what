"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useStreamingChat } from "@/components/chat/use-streaming-chat";

// One Ask conversation per customer portal visit. It lives in the portal layout, so it carries on
// when the customer moves between tabs, and the floating panel and the full Ask page share it.

type AskConfig = { token: string; starters: string[]; preview: boolean };

type AskContextValue = ReturnType<typeof useStreamingChat> & {
  config: AskConfig | null;
  setConfig: (c: AskConfig) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AskContext = createContext<AskContextValue | null>(null);

export function AskProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<AskConfig | null>(null);
  const [open, setOpen] = useState(false);
  const chat = useStreamingChat({
    endpoint: "/api/ask",
    body: (question, history) =>
      config ? { token: config.token, question, history, preview: config.preview } : null,
  });
  const setConfig = useCallback((c: AskConfig) => {
    setConfigState((prev) =>
      prev && prev.token === c.token && prev.preview === c.preview && prev.starters.join("|") === c.starters.join("|") ? prev : c,
    );
  }, []);

  return <AskContext.Provider value={{ ...chat, config, setConfig, open, setOpen }}>{children}</AskContext.Provider>;
}

export function useAsk() {
  const ctx = useContext(AskContext);
  if (!ctx) throw new Error("useAsk must be used inside AskProvider");
  return ctx;
}
