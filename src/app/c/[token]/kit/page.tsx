import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { DraftEditor } from "@/components/ui/draft-editor";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { loadCustomer } from "../data";

export default function KitPage({ params }: PageProps<"/c/[token]/kit">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Kit params={params} />
    </Suspense>
  );
}

async function Kit({ params }: { params: PageProps<"/c/[token]/kit">["params"] }) {
  const c = await loadCustomer(params);
  const kit = c.profile.championKit;
  const faq = kit.developerFaq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title font-semibold">Champion kit</h2>
        <p className="mt-1 text-ink-muted">
          Ready-to-use materials for rolling out Copilot at {c.name}. Edit anything, then copy it into email, Slack,
          or your wiki.
        </p>
      </div>

      <Card>
        <h3 className="font-semibold">Launch announcement</h3>
        <p className="mb-3 mt-1 text-sm text-ink-muted">Send this to your developers when you&apos;re ready to go.</p>
        <DraftEditor initial={kit.launchAnnouncement} label="Launch announcement" rows={14} />
      </Card>

      <Card>
        <h3 className="font-semibold">Enablement session agenda</h3>
        <p className="mb-3 mt-1 text-sm text-ink-muted">A hands-on session you can run with any team.</p>
        <DraftEditor initial={kit.enablementAgenda} label="Enablement session agenda" rows={12} />
      </Card>

      <Card>
        <h3 className="font-semibold">Developer FAQ</h3>
        <p className="mb-3 mt-1 text-sm text-ink-muted">Straight answers to the questions developers ask first.</p>
        <dl className="mb-4 space-y-3">
          {kit.developerFaq.map((f) => (
            <div key={f.q} className="rounded-lg bg-surface p-3">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
        <details>
          <summary className="cursor-pointer text-sm font-medium text-accent hover:text-accent-hover">
            Edit and copy the FAQ
          </summary>
          <div className="mt-3">
            <DraftEditor initial={faq} label="Developer FAQ" rows={14} />
          </div>
        </details>
      </Card>
    </div>
  );
}
