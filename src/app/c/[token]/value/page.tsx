import { Suspense } from "react";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { PortalHeader } from "@/components/customer/portal-header";
import { ValueReport, type Productivity } from "@/components/review/value-report";
import { getCustomerLearning, getCustomerSupport, getCustomerValue } from "@/db/queries";
import { computeRoi } from "@/lib/roi";
import { loadCustomer } from "../data";

export default function ValuePage({ params }: PageProps<"/c/[token]/value">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Value params={params} />
    </Suspense>
  );
}

async function Value({ params }: { params: PageProps<"/c/[token]/value">["params"] }) {
  const c = await loadCustomer(params);
  const [value, learning, support] = await Promise.all([
    getCustomerValue(c.token),
    getCustomerLearning(c.token),
    getCustomerSupport(c.token),
  ]);
  const roi = value ? computeRoi(value) : null;

  if (!roi?.live) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-5" />}
        title="Your value report fills in once your team is live"
        body="As your developers start using Copilot each week, this page shows the hours and money it's saving you."
      />
    );
  }

  const done = c.milestones.filter((m) => m.status === "done").length;
  const productivity: Productivity = [
    { label: "Developers using Copilot", value: `${roi.activePct}%`, sub: `${roi.activeSeats} of ${c.seats} seats` },
    {
      label: "Weekly pulse",
      value: support?.pulse.average != null ? `${support.pulse.average} / 5` : "-",
      sub: support?.pulse.count ? `${support.pulse.count} answers this month` : "No answers yet",
    },
    { label: "Learning challenges done", value: String(learning?.completions ?? 0), sub: `${learning?.learners ?? 0} developers learning` },
    { label: "Plan milestones done", value: `${done} of ${c.milestones.length}`, sub: "From your onboarding plan" },
    ...c.profile.successCriteria
      .filter((s) => s.current)
      .slice(0, 2)
      .map((s) => ({ label: s.label, value: s.current!, sub: `Target: ${s.target}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PortalHeader
          icon={<BarChart3 />}
          title="Value"
          description="What Copilot is worth to your team right now, in one page you can share with your leadership."
          action={<PrintButton label="Print or save as PDF" />}
        />
      </div>
      <ValueReport name={c.name} logoId={c.logoId} roi={roi} productivity={productivity} />
    </div>
  );
}
