import { Suspense } from "react";
import { ListChecks } from "lucide-react";
import { PortalHeader } from "@/components/customer/portal-header";
import { Card } from "@/components/ui/card";
import { ProgressBar, Stat } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SuccessCriteriaList } from "@/components/account/success-criteria";
import { MilestoneChecklist } from "@/components/milestone-checklist";
import { setMilestoneDoneAsCustomer } from "@/app/actions/milestones";
import { todayISO } from "@/lib/dates";
import { loadCustomer } from "../data";

export default function CustomerPlanPage({ params }: PageProps<"/c/[token]/plan">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <CustomerPlan params={params} />
    </Suspense>
  );
}

async function CustomerPlan({ params }: { params: PageProps<"/c/[token]/plan">["params"] }) {
  const c = await loadCustomer(params);
  const done = c.milestones.filter((m) => m.status === "done").length;
  const daysLeft = c.pilotLengthDays ? Math.max(0, c.pilotLengthDays - c.stageDay) : null;

  return (
    <div className="space-y-6">
      <PortalHeader
        icon={<ListChecks />}
        title="Your plan"
        description="The milestones that get your team from setup to real results. Check them off as you go: your account team sees updates right away."
      />
      <Card className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Stat label="Done" value={`${done} of ${c.milestones.length}`} />
        {daysLeft != null ? (
          <Stat label="Pilot days left" value={daysLeft} sub={`Day ${c.stageDay} of ${c.pilotLengthDays}`} />
        ) : (
          <Stat label="Day" value={c.stageDay} sub="Since kickoff" />
        )}
        <ProgressBar
          className="col-span-2 sm:col-span-1 sm:self-end"
          value={c.milestones.length ? (done / c.milestones.length) * 100 : 0}
          label="Plan progress"
        />
      </Card>

      {c.profile.successCriteria.length > 0 && (
        <Card>
          <h2 className="font-semibold">Pilot success criteria</h2>
          <p className="mb-4 mt-1 text-sm text-ink-muted">What we agreed the pilot needs to show.</p>
          <SuccessCriteriaList criteria={c.profile.successCriteria} />
        </Card>
      )}

      <Card>
        <h2 className="font-semibold">Your plan</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          Check things off as you go. Your account team sees updates right away.
        </p>
        <MilestoneChecklist
          milestones={c.milestones}
          today={todayISO()}
          viewer="customer"
          onToggle={setMilestoneDoneAsCustomer.bind(null, c.token)}
        />
      </Card>
    </div>
  );
}
