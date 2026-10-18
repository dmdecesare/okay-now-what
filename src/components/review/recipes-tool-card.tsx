import { ExternalLink, Wand2 } from "lucide-react";
import { generateRecipesAction } from "@/app/actions/ai";
import { AiButton } from "@/components/ai-button";
import { buttonClasses } from "@/components/ui/button";
import type { PromptRecipe } from "@/lib/schemas";

/** On the rep's Tools tab: generate the customer's prompt recipes and open their Prompts page. */
export function RecipesToolCard({ slug, token, recipes }: { slug: string; token: string; recipes: PromptRecipe[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Wand2 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Prompt recipes</h2>
            <p className="mt-0.5 max-w-xl text-sm text-ink-muted">
              {recipes.length
                ? `${recipes.length} copy-ready Copilot prompts are live on the customer's Prompts tab.`
                : "Claude writes 6 to 8 copy-ready Copilot prompts for this customer's team and goals. They go straight to the customer's Prompts tab."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <AiButton action={generateRecipesAction.bind(null, slug)} label={recipes.length ? "Rewrite" : "Write recipes"} />
          <a href={`/c/${token}/prompts?preview=1`} target="_blank" rel="noopener" className={buttonClasses("ghost", "sm")}>
            <ExternalLink />
            View
          </a>
        </div>
      </div>
      {recipes.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 border-t border-border px-5 py-3">
          {recipes.map((r) => (
            <li key={r.title} className="rounded-md bg-surface px-2 py-0.5 text-xs text-ink-muted">
              {r.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
