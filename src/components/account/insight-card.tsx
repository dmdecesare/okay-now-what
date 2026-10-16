import type { ActionResult } from "@/app/actions/milestones";
import { AiButton } from "@/components/ai-button";
import { cn } from "@/lib/cn";

function ago(d: Date): string {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/**
 * Frame for AI-written content on the rep side. Demo accounts ship with pre-written
 * insights ("Claude's take"); Refresh asks Claude for a live version.
 */
export function InsightCard({
  title,
  source,
  generatedAt,
  refresh,
  children,
  className,
}: {
  title: string;
  source?: "seed" | "live";
  generatedAt?: Date;
  refresh?: () => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-accent/20 bg-bg shadow-card",
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-accent before:via-[#14b8a6] before:to-growth",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-accent/10 bg-gradient-to-b from-accent-soft/70 to-bg px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent text-white">
            <SparkIcon />
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span>
            {source === "live" && generatedAt ? `Written by Claude ${ago(generatedAt)}` : source ? "Claude's take" : ""}
          </span>
          {refresh && <AiButton action={refresh} label={source ? "Refresh" : "Write it"} />}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path d="M8 1.5 9.4 6.6 14.5 8l-5.1 1.4L8 14.5 6.6 9.4 1.5 8l5.1-1.4L8 1.5Z" fill="currentColor" />
    </svg>
  );
}
