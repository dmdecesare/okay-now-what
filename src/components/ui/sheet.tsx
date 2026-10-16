"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A floating panel for chat and quick tools.
 * - "right": full-height panel on the right edge (rep chat).
 * - "bottom-left": a card that rises from the bottom-left corner (customer Ask).
 * Both become full-screen below 640px. Escape closes it, focus moves in on open and back on close.
 * It stays mounted while closed (hidden), so a conversation inside it keeps its state.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  placement = "right",
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  placement?: "right" | "bottom-left";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const target = panel?.querySelector<HTMLElement>("textarea, input, [data-autofocus]") ?? panel;
    target?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={typeof title === "string" ? title : undefined}
      tabIndex={-1}
      hidden={!open}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden border border-border bg-bg shadow-panel outline-none",
        "inset-0 max-sm:rounded-none",
        placement === "right" && "sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[420px] sm:rounded-2xl",
        placement === "bottom-left" &&
          "sm:inset-auto sm:bottom-20 sm:left-5 sm:h-[min(620px,calc(100dvh-7rem))] sm:w-[400px] sm:rounded-2xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs text-ink-muted">{subtitle}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {headerExtra}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="border-t border-border bg-bg">{footer}</div>}
    </div>
  );
}
