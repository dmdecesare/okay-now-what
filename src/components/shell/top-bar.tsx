import { Suspense } from "react";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { getSummaries } from "@/db/queries";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "./breadcrumbs";
import { MenuButton } from "./shell-context";

/** Sticky bar above every rep page: menu (phones), breadcrumbs, and the main actions. */
export function TopBar({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md print:hidden">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MenuButton />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-4 w-40 animate-pulse rounded bg-surface-strong" />}>
            <Trail />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ButtonLink href="/accounts/new" size="sm" className="max-sm:w-8 max-sm:px-0" aria-label="Add account">
            <Plus />
            <span className="max-sm:sr-only">Add account</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

async function Trail() {
  await connection();
  const accounts = await getSummaries().catch(() => []);
  return <Breadcrumbs names={Object.fromEntries(accounts.map((a) => [a.slug, a.name]))} />;
}
