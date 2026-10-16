import { Suspense } from "react";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { ToolCard } from "@/components/account/tool-card";
import { generateToolAction } from "@/app/actions/ai";
import type { AccountProfile, MaterialKind } from "@/lib/schemas";
import { getAccountReview, getCustomerView, getLearningForAccount } from "@/db/queries";
import { ReviewToolCard } from "@/components/review/review-tool-card";
import { ValueToolCard } from "@/components/review/value-tool-card";
import { computeRoi } from "@/lib/roi";
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

/** Drafts that already exist in the champion kit, shown until Claude writes a fresh one. */
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
  const { account, profile, materials, usage, spend } = await loadAccount(params);
  const roi = computeRoi({ seats: account.seats, usage, spend, assumptions: profile.roiAssumptions });
  const tools = TOOLS.filter((t) => !t.pilotOnly || account.stage === "pilot");
  const [view, review, learning] = await Promise.all([
    getCustomerView(account.customerToken),
    getAccountReview(account.id),
    getLearningForAccount(account.id),
  ]);

  return (
    <div className="space-y-6">
      <ValueToolCard slug={account.slug} token={account.customerToken} roi={roi} />
      {view && (
        <ReviewToolCard slug={account.slug} token={account.customerToken} view={view} review={review} learning={learning} />
      )}
      <p className="text-sm text-ink-muted">
        One-click drafts written by Claude for {account.name}, using this account&apos;s goals, people, and numbers. Edit them here, then copy them anywhere.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <ToolCard
            key={t.kind}
            title={t.title}
            description={t.description}
            draft={materials[t.kind]?.content ?? starterDraft(t.kind, profile)}
            version={materials[t.kind]?.updatedAt.toISOString() ?? "starter"}
            writtenNote={
              materials[t.kind]
                ? `Written by Claude on ${materials[t.kind]!.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : starterDraft(t.kind, profile)
                  ? "Starter draft from the champion kit"
                  : undefined
            }
            generate={generateToolAction.bind(null, account.slug, t.kind)}
          />
        ))}
      </div>
    </div>
  );
}
