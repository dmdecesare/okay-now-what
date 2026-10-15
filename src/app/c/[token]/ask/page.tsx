import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { loadCustomer } from "../data";

export default function AskPage({ params }: PageProps<"/c/[token]/ask">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Ask params={params} />
    </Suspense>
  );
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// Phase 3: the layout and starter questions. Answers from Claude are wired up in Phase 5.
async function Ask({ params }: { params: PageProps<"/c/[token]/ask">["params"] }) {
  const c = await loadCustomer(params);
  const starters = [
    ...c.profile.setupSteps.slice(0, 2).map((s) => `How do I ${lowerFirst(s.title)}?`),
    "Is our code used to train the models?",
    "What's the best way to get my team using Copilot weekly?",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-title font-semibold">Ask anything about Copilot</h2>
        <p className="mt-1 text-ink-muted">
          Answers are written for {c.name} and point to the official docs they come from. Your account team sees
          your questions so they can help.
        </p>
      </div>

      <Card className="space-y-4">
        <p className="text-sm font-medium text-ink-muted">Try one of these</p>
        <div className="flex flex-wrap gap-2">
          {starters.map((q) => (
            <span key={q} className="rounded-full border border-border-strong px-3 py-1.5 text-sm text-ink-muted">
              {q}
            </span>
          ))}
        </div>
        <form className="flex gap-2 border-t border-border pt-4">
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <input
            id="ask-input"
            disabled
            placeholder="Ask goes live soon."
            className="h-10 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm"
          />
          <button
            type="submit"
            disabled
            className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </Card>
    </div>
  );
}
