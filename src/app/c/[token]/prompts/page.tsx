import { Suspense } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { PortalHeader } from "@/components/customer/portal-header";
import type { PromptRecipe } from "@/lib/schemas";
import { loadCustomer } from "../data";

export default function PromptsPage({ params }: PageProps<"/c/[token]/prompts">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Prompts params={params} />
    </Suspense>
  );
}

const ORDER: PromptRecipe["tag"][] = ["Understand", "Write", "Test", "Refactor", "Review", "Admin"];

async function Prompts({ params }: { params: PageProps<"/c/[token]/prompts">["params"] }) {
  const c = await loadCustomer(params);
  const recipes = [...(c.profile.promptRecipes ?? [])].sort((a, b) => ORDER.indexOf(a.tag) - ORDER.indexOf(b.tag));

  return (
    <div className="space-y-6">
      <PortalHeader
        icon={<Wand2 />}
        title="Prompt recipes"
        description={`Copy-ready prompts for Copilot Chat, written for ${c.name}. Fill in the parts in [brackets] and paste.`}
      />
      {recipes.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="Your prompt recipes are on the way"
          body="Your account team will add prompts tailored to your team here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recipes.map((r) => (
            <article key={r.title} className="flex flex-col rounded-xl border border-border bg-bg p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{r.title}</h2>
                <Badge tone="accent">{r.tag}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{r.useWhen}</p>
              <pre className="mt-3 flex-1 whitespace-pre-wrap rounded-lg border border-border bg-surface/70 p-3 font-mono text-xs leading-relaxed text-ink">
                {r.prompt}
              </pre>
              <div className="mt-3">
                <CopyButton text={r.prompt} label="Copy prompt" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
