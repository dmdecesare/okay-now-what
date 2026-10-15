"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/app/actions/milestones";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Runs a live AI server action, shows a thinking state, and a friendly message if it fails. */
export function AiButton({
  action,
  label,
  variant = "secondary",
  className,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className={cn("inline-flex flex-col items-end gap-1", className)}>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await action();
            if (!res.ok) setError(res.message);
          });
        }}
        className={buttonClasses(variant, "sm")}
      >
        {pending ? (
          <>
            <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            Thinking...
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <span role="alert" className="max-w-xs text-right text-xs text-watch">
          {error}
        </span>
      )}
    </span>
  );
}
