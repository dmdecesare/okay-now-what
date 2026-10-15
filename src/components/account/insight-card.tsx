import { cn } from "@/lib/cn";

/**
 * Frame for AI-written content on the rep side. Demo accounts ship with pre-written
 * insights; Phase 5 adds live generation behind the Refresh button.
 */
export function InsightCard({
  title,
  source,
  children,
  className,
}: {
  title: string;
  source?: "seed" | "live";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-accent/20 bg-accent-soft/50 p-5", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SparkIcon />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span>{source === "live" ? "Written by Claude" : "Claude's take"}</span>
          <button
            type="button"
            disabled
            title="Live refresh arrives with the AI features"
            className="rounded-md border border-border-strong bg-bg px-2 py-1 font-medium text-ink-muted disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-accent" aria-hidden>
      <path
        d="M8 1.5 9.4 6.6 14.5 8l-5.1 1.4L8 14.5 6.6 9.4 1.5 8l5.1-1.4L8 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
