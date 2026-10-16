import { Suspense } from "react";
import { NotebookPen } from "lucide-react";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { LogCallForm } from "@/components/account/log-call-form";
import { CallHistory } from "@/components/account/call-history";
import { todayISO } from "@/lib/dates";
import { loadAccount } from "../load";

export default function LogCallPage({ params }: PageProps<"/accounts/[slug]/log-call">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <LogCall params={params} />
    </Suspense>
  );
}

async function LogCall({ params }: { params: PageProps<"/accounts/[slug]/log-call">["params"] }) {
  const d = await loadAccount(params);
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <NotebookPen className="size-5" />
        </span>
        <div>
          <h2 className="text-title font-semibold">Log a call</h2>
          <p className="text-sm text-ink-muted">
            Paste your notes from a call with {d.account.name}. Claude updates the plan and people, and drafts the follow-up.
          </p>
        </div>
      </div>
      <LogCallForm slug={d.account.slug} today={todayISO()} milestones={d.milestones.map((m) => ({ id: m.id, title: m.title }))} />
      <CallHistory calls={d.calls} />
    </div>
  );
}
