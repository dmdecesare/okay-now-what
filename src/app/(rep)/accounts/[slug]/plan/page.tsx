import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar, Stat } from "@/components/ui/metrics";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { MilestoneList, displayStatus } from "@/components/account/milestone-list";
import { SuccessCriteriaList } from "@/components/account/success-criteria";
import { todayISO } from "@/lib/dates";
import { loadAccount } from "../load";

export default function PlanPage({ params }: PageProps<"/accounts/[slug]/plan">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Plan params={params} />
    </Suspense>
  );
}

async function Plan({ params }: { params: PageProps<"/accounts/[slug]/plan">["params"] }) {
  const { account, profile, milestones, stageDay } = await loadAccount(params);
  const today = todayISO();
  const statuses = milestones.map((m) => displayStatus(m, today));
  const done = statuses.filter((s) => s === "done").length;
  const overdue = statuses.filter((s) => s === "overdue").length;
  const byCustomer = milestones.filter((m) => m.completedBy === "customer").length;
  const isPilot = account.stage === "pilot" && account.pilotLengthDays;
  const daysLeft = isPilot ? Math.max(0, account.pilotLengthDays! - stageDay) : null;

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Stat label="Milestones done" value={`${done} of ${milestones.length}`} />
        <Stat label="Overdue" value={overdue} sub={overdue > 0 ? "Needs a follow-up" : "None"} />
        <Stat label="Checked off by customer" value={byCustomer} />
        {daysLeft != null ? (
          <Stat label="Pilot days left" value={daysLeft} sub={`Day ${stageDay} of ${account.pilotLengthDays}`} />
        ) : (
          <Stat label="Day" value={stageDay} sub="Since kickoff" />
        )}
        <ProgressBar
          className="col-span-2 sm:col-span-4"
          value={milestones.length ? (done / milestones.length) * 100 : 0}
          label="Plan progress"
        />
      </Card>

      {profile.successCriteria.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold">Pilot success criteria</h2>
          <SuccessCriteriaList criteria={profile.successCriteria} />
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Milestones</h2>
          <p className="text-sm text-ink-muted">Synced with what the customer checks off.</p>
        </div>
        <MilestoneList milestones={milestones} today={today} />
      </Card>
    </div>
  );
}
