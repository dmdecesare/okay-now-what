import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { AskConversation } from "@/components/customer/ask-conversation";
import { loadCustomer } from "../data";

export default function AskPage({ params }: PageProps<"/c/[token]/ask">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Ask params={params} />
    </Suspense>
  );
}

async function Ask({ params }: { params: PageProps<"/c/[token]/ask">["params"] }) {
  const c = await loadCustomer(params);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-card">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h1 className="text-display font-semibold">Ask anything about Copilot</h1>
          <p className="mt-1 text-ink-muted">
            Answers are written for {c.name} and link to the official GitHub docs they come from. Your account team
            sees your questions so they can help. The assistant also floats in the corner of every page.
          </p>
        </div>
      </div>
      <Card>
        <AskConversation variant="page" />
      </Card>
    </div>
  );
}
