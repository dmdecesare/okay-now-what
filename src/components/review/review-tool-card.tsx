import { ExternalLink, FileBarChart } from "lucide-react";
import { generateReviewAction } from "@/app/actions/ai";
import { AiButton } from "@/components/ai-button";
import { Badge } from "@/components/ui/badges";
import { buttonClasses } from "@/components/ui/button";
import type { CustomerView, StoredReview } from "@/db/queries";
import type { LearningSummary } from "@/lib/learning";
import { BusinessReviewView, reviewStats } from "./business-review";
import { PublishToggle } from "./publish-toggle";

/** On the rep's Tools tab: write the customer-facing business review, preview it, and publish it. */
export function ReviewToolCard({
  slug,
  token,
  view,
  review,
  learning,
}: {
  slug: string;
  token: string;
  view: CustomerView;
  review: StoredReview | null;
  learning: LearningSummary;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-gradient-to-b from-accent-soft/60 to-bg px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
            <FileBarChart className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Business review</h2>
              {review && (
                <Badge tone={review.status === "published" ? "ok" : "neutral"}>
                  {review.status === "published" ? "Published to portal" : "Draft, only you can see it"}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 max-w-xl text-sm text-ink-muted">
              A polished review for {view.name}&apos;s executives: goals, adoption, wins, and the next 90 days. Claude
              writes it only from what the customer can already see, so nothing internal ends up in it.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <AiButton action={generateReviewAction.bind(null, slug)} label={review ? "Rewrite" : "Write the review"} />
          {review && <PublishToggle slug={slug} published={review.status === "published"} />}
          {review?.status === "published" && (
            <a href={`/c/${token}/review?preview=1`} target="_blank" rel="noopener" className={buttonClasses("ghost", "sm")}>
              <ExternalLink />
              View on portal
            </a>
          )}
        </div>
      </div>
      {review ? (
        <details className="group" open={review.status === "draft"}>
          <summary className="cursor-pointer list-none px-5 py-3 text-sm font-medium text-accent hover:text-accent-hover">
            <span className="group-open:hidden">Show the review</span>
            <span className="hidden group-open:inline">Hide the review</span>
          </summary>
          <div className="bg-surface/60 p-4 sm:p-6">
            <BusinessReviewView name={view.name} logoId={view.logoId} review={review.content} stats={reviewStats(view, learning)} />
          </div>
        </details>
      ) : (
        <p className="px-5 py-4 text-sm text-ink-muted">No review yet. Write one when there are results worth sharing.</p>
      )}
    </section>
  );
}
