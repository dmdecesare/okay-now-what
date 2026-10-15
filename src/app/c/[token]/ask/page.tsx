import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { AskChat } from "@/components/customer/ask-chat";
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
          Answers are written for {c.name} and link to the official GitHub docs they come from. Your account team
          sees your questions so they can help.
        </p>
      </div>
      <Card>
        <AskChat token={c.token} starters={starters} />
      </Card>
      <p className="text-center text-xs text-ink-faint">
        Answers are written by Claude, an AI model. Double-check anything important in the linked docs.
      </p>
    </div>
  );
}
