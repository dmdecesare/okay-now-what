"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";

// The rep shell's mobile drawer state: the menu button lives in the top bar, the drawer wraps the sidebar.

const ShellContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <ShellContext.Provider value={{ open, setOpen }}>{children}</ShellContext.Provider>;
}

function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}

export function MenuButton() {
  const { setOpen } = useShell();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-strong hover:text-ink lg:hidden"
      aria-label="Open navigation"
    >
      <Menu className="size-5" />
    </button>
  );
}

/** Static column on large screens; an off-canvas drawer below that, closed on every navigation. */
export function SidebarFrame({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useShell();
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden", open ? "block" : "hidden")}
        onClick={close}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[264px] transition-transform duration-200 print:hidden lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Suspense fallback={null}>
          <CloseOnNavigate onNavigate={close} />
        </Suspense>
        {children}
      </aside>
    </>
  );
}

function CloseOnNavigate({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  useEffect(() => {
    onNavigate();
  }, [pathname, onNavigate]);
  return null;
}
