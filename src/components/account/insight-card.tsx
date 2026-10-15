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
    <section className={cn("rounded-xl border border-accent/20 bg-accent-soft/50 p-5", className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <SparkIcon />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="flex items-start gap-3 text-xs text-ink-muted">
          <span className="pt-2">
            {source === "live" && generatedAt ? `Written by Claude ${ago(generatedAt)}` : source ? "Claude's take" : ""}
          </span>
          {refresh && <AiButton action={refresh} label={source ? "Refresh" : "Write it"} />}
        </div>
      </div>
      {children}
    </section>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-accent" aria-hidden>
      <path d="M8 1.5 9.4 6.6 14.5 8l-5.1 1.4L8 14.5 6.6 9.4 1.5 8l5.1-1.4L8 1.5Z" fill="currentColor" />
    </svg>
  );
}
