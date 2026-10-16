import { Suspense } from "react";
import { FileBarChart } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { BusinessReviewView, reviewStats } from "@/components/review/business-review";
import { getCustomerLearning, getCustomerReview } from "@/db/queries";
import { loadCustomer } from "../data";

export default function ReviewPage({ params }: PageProps<"/c/[token]/review">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({ params }: { params: PageProps<"/c/[token]/review">["params"] }) {
  const c = await loadCustomer(params);
  const [review, learning] = await Promise.all([getCustomerReview(c.token), getCustomerLearning(c.token)]);

  // Always a normal page, even before a review is shared, so the link never breaks.
  if (!review) {
    return (
      <EmptyState
        icon={<FileBarChart className="size-5" />}
        title="Your business review isn't ready yet"
        body="Your account team will share a review of your results and the plan for the next 90 days here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex justify-end">
        <PrintButton label="Print or save as PDF for your leadership" />
      </div>
      <BusinessReviewView
        name={c.name}
        logoId={c.logoId}
        review={review.content}
        stats={reviewStats(c, learning ?? { learners: 0, completions: 0 })}
        date={(review.publishedAt ?? review.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      />
    </div>
  );
}
