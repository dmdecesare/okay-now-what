import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getSummaries } from "@/db/queries";
import { Wordmark } from "@/components/wordmark";
import { SidebarAccountList, SidebarNav } from "./sidebar-links";

/** The rep's dark sidebar: product nav, every account with its health, and who is signed in. */
export function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-ink">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link href="/" aria-label="Okay, Now What? home" className="rounded-md">
          <Wordmark tone="dark" className="text-[15px]" />
        </Link>
      </div>

      <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-2">
        <Suspense fallback={<NavSkeleton rows={2} />}>
          <SidebarNav />
        </Suspense>

        <div>
          <p className="mb-1.5 px-2.5 text-micro font-medium uppercase text-sidebar-muted">Customer content</p>
          <Suspense fallback={<NavSkeleton rows={3} />}>
            <SidebarNav section="content" />
          </Suspense>
        </div>

        <div>
          <p className="mb-1.5 px-2.5 text-micro font-medium uppercase text-sidebar-muted">Accounts</p>
          <Suspense fallback={<NavSkeleton rows={3} />}>
            <Accounts />
          </Suspense>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0f766e] text-xs font-semibold text-white"
            aria-hidden
          >
            DD
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-ink">Derek DeCesare</p>
            <p className="truncate text-xs text-sidebar-muted">Account Executive</p>
          </div>
        </div>
      </div>
    </div>
  );
}

async function Accounts() {
  await connection();
  const accounts = await getSummaries().catch(() => []);
  if (accounts.length === 0) {
    return <p className="px-2.5 text-sm text-sidebar-muted">No accounts yet.</p>;
  }
  return (
    <SidebarAccountList
      accounts={accounts.map((a) => ({ slug: a.slug, name: a.name, status: a.health.status }))}
    />
  );
}

function NavSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-1.5 px-2.5" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-sidebar-active" />
      ))}
    </div>
  );
}
