"use client";

import Link from "next/link";
import { useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Friendly fallback for error boundaries. Never shows error details: in production
 * Next.js replaces server error messages with a digest anyway.
 */
export function ErrorState({
  title = "Something went sideways",
  body = "Okay, now what? Give it another try. If it keeps happening, wait a minute and come back.",
  retry,
  homeHref = "/",
  homeLabel = "Go to the book of business",
}: {
  title?: string;
  body?: string;
  retry: () => void;
  homeHref?: string | null;
  homeLabel?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div role="alert" className="mx-auto max-w-md rounded-xl border border-border bg-surface px-6 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => retry())}
          className={buttonClasses("primary", "md")}
        >
          {pending ? "Trying again..." : "Try again"}
        </button>
        {homeHref && (
          <Link href={homeHref} className={buttonClasses("secondary", "md")}>
            {homeLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
