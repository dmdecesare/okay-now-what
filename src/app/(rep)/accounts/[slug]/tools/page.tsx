import { Suspense } from "react";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { ToolCard } from "@/components/account/tool-card";
import type { AccountProfile, MaterialKind } from "@/lib/schemas";
import { loadAccount } from "../load";

type Tool = { kind: MaterialKind; title: string; description: string; pilotOnly?: boolean };

const TOOLS: Tool[] = [
  { kind: "launch_email", title: "Launch email", description: "Announcement the champion sends to developers." },
  { kind: "enablement_agenda", title: "Enablement session agenda", description: "A ready-to-run hands-on session." },
  { kind: "developer_faq", title: "Developer FAQ", description: "Straight answers, including \"will this replace me?\"" },
  { kind: "checkin_email", title: "Check-in email to the champion", description: "Short update with numbers and one ask." },
  {
    kind: "pilot_readout",
    title: "Pilot readout",
    description: "Results against each success criterion, for the decision maker.",
    pilotOnly: true,
  },
  { kind: "value_summary", title: "Renewal and value summary", description: "Adoption, wins, and the case for renewal." },
];

/** Drafts that already exist in the champion kit, until Phase 5 can generate the rest. */
function starterDraft(kind: MaterialKind, profile: AccountProfile): string | null {
  const kit = profile.championKit;
  switch (kind) {
    case "launch_email":
      return kit.launchAnnouncement;
    case "enablement_agenda":
      return kit.enablementAgenda;
    case "developer_faq":
      return kit.developerFaq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
    default:
      return null;
  }
}

export default function ToolsPage({ params }: PageProps<"/accounts/[slug]/tools">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Tools params={params} />
    </Suspense>
  );
}

async function Tools({ params }: { params: PageProps<"/accounts/[slug]/tools">["params"] }) {
  const { account, profile } = await loadAccount(params);
  const tools = TOOLS.filter((t) => !t.pilotOnly || account.stage === "pilot");

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        One-click drafts written for {account.name}. Edit them here, then copy them anywhere.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <ToolCard
            key={t.kind}
            title={t.title}
            description={t.description}
            draft={starterDraft(t.kind, profile)}
          />
        ))}
      </div>
    </div>
  );
}
