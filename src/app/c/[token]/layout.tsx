import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Wordmark } from "@/components/wordmark";
import { CustomerTabNav } from "@/components/customer/tab-nav";
import { VisitTracker } from "@/components/customer/visit-tracker";
import { LiveRefresh } from "@/components/live-refresh";
import { getCustomerView } from "@/db/queries";

export const metadata: Metadata = {
  title: "Copilot onboarding",
  // Private links: keep them out of search engines.
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children, params }: LayoutProps<"/c/[token]">) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <CustomerHeader params={params} />
      </Suspense>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:px-6">
          <p>This is your private onboarding page. Share it only with your team.</p>
          <Wordmark className="text-sm text-ink-faint" />
        </div>
      </footer>
    </>
  );
}

async function CustomerHeader({ params }: { params: LayoutProps<"/c/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  // If the database is unavailable, keep a plain header so the page's own friendly
  // error (c/[token]/error.tsx) shows inside the customer shell.
  const customer = await getCustomerView(token).catch(() => null);

  return (
    <header className="border-b border-border bg-accent-soft">
      {customer && <VisitTracker token={token} />}
      {customer && <LiveRefresh />}
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-6 pb-3 sm:px-6">
        <div>
          <p className="text-sm font-medium text-accent-ink">Onboarding</p>
          <h1 className="text-title font-semibold sm:text-display">
            {customer ? `${customer.name} x Copilot onboarding` : "Copilot onboarding"}
          </h1>
        </div>
        {customer && <CustomerTabNav token={token} />}
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <header className="border-b border-border bg-accent-soft">
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-6 pb-3 sm:px-6">
        <div className="h-14 w-80 max-w-full animate-pulse rounded bg-white/60" />
        <div className="h-8 animate-pulse rounded bg-white/60" />
      </div>
    </header>
  );
}
