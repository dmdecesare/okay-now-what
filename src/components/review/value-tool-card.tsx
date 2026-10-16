import { BarChart3, ExternalLink } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { formatNumber, formatUSD } from "@/lib/format";
import type { Roi } from "@/lib/roi";
import { RoiAssumptionsForm } from "./roi-assumptions-form";

/** On the rep's Tools tab: the numbers on the customer's Value page, and the assumptions behind them. */
export function ValueToolCard({ slug, token, roi }: { slug: string; token: string; roi: Roi }) {
  const stats = [
    { label: "Estimated value / month", value: formatUSD(roi.valueSaved) },
    { label: "Hours back / month", value: formatNumber(roi.hoursSaved) },
    { label: "ROI", value: roi.roiMultiple != null ? `${roi.roiMultiple}x` : "-" },
    { label: "Payback", value: roi.paybackDays != null ? `${roi.paybackDays} days` : "-" },
  ];
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-gradient-to-b from-growth-soft/60 to-bg px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-growth text-white">
            <BarChart3 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Value report</h2>
            <p className="mt-0.5 max-w-xl text-sm text-ink-muted">
              The customer&apos;s Value page shows these estimates to their leadership, live. Adjust the assumptions to match what you agreed with them.
            </p>
          </div>
        </div>
        <a href={`/c/${token}/value?preview=1`} target="_blank" rel="noopener" className={buttonClasses("secondary", "sm")}>
          <ExternalLink />
          Open their Value page
        </a>
      </div>
      <div className="space-y-4 p-5">
        {roi.live ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface/60 p-3">
                <dt className="text-xs text-ink-muted">{s.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-ink-muted">No usage yet, so the Value page shows a friendly empty state for now.</p>
        )}
        <RoiAssumptionsForm slug={slug} hours={roi.assumptions.hoursSavedPerWeek} rate={roi.assumptions.hourlyCost} />
      </div>
    </section>
  );
}
