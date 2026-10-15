import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import type { AccountProfile } from "@/lib/schemas";
import { loadCustomer } from "../data";

type Audience = AccountProfile["setupSteps"][number]["audience"];

const AUDIENCES: { id: Audience; title: string; description: string }[] = [
  { id: "admin", title: "For admins", description: "Seats, policies, and settings." },
  { id: "security", title: "For security", description: "Exclusions, data handling, and audit." },
  { id: "team_lead", title: "For team leads", description: "Rollout, metrics, and enablement." },
  { id: "developer", title: "For developers", description: "Getting set up in your editor." },
];

export default function SetupPage({ params }: PageProps<"/c/[token]/setup">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Setup params={params} />
    </Suspense>
  );
}

async function Setup({ params }: { params: PageProps<"/c/[token]/setup">["params"] }) {
  const c = await loadCustomer(params);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold">Setup guide</h2>
        <p className="mt-1 text-ink-muted">
          The admin and security steps that matter for {c.name}, built around the questions your team raised.
        </p>
      </div>

      {AUDIENCES.map((aud) => {
        const steps = c.profile.setupSteps.filter((s) => s.audience === aud.id);
        if (steps.length === 0) return null;
        return (
          <section key={aud.id}>
            <h3 className="font-semibold">{aud.title}</h3>
            <p className="mb-3 text-sm text-ink-muted">{aud.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((s) => (
                <Card key={s.id} className="flex flex-col gap-3">
                  <div>
                    <h4 className="font-semibold">{s.title}</h4>
                    <p className="mt-1 text-sm text-ink-muted">
                      <span className="font-medium text-ink">Why this matters for you: </span>
                      {s.why}
                    </p>
                  </div>
                  <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                    {s.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <div className="mt-auto pt-1">
                    <CopyButton
                      text={`${s.title}\n\n${s.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}`}
                      label="Copy steps"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
