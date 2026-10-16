import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Lock } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { CustomerTabNav } from "@/components/customer/tab-nav";
import { VisitTracker } from "@/components/customer/visit-tracker";
import { AskProvider } from "@/components/customer/ask-provider";
import { AskLauncher } from "@/components/customer/ask-launcher";
import { LiveRefresh } from "@/components/live-refresh";
import { AccountLogo } from "@/components/logos/account-logo";
import { getCustomerReview, getCustomerView } from "@/db/queries";
import { askStarters } from "@/lib/ask";

export const metadata: Metadata = {
  title: "Copilot success portal",
  // Private links: keep them out of search engines.
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children, params }: LayoutProps<"/c/[token]">) {
  return (
    <AskProvider>
      <Suspense fallback={<HeaderSkeleton />}>
        <CustomerHeader params={params} />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8">{children}</main>

      <footer className="border-t border-border bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pb-24 pt-6 text-sm text-ink-muted sm:px-6">
          <p className="flex items-center gap-2">
            <Lock className="size-3.5 text-ink-faint" aria-hidden />
            This is your private success portal. Share it only with your team.
          </p>
          <span className="flex items-center gap-2 text-xs text-ink-faint">
            Powered by <Wordmark className="text-sm text-ink-muted" />
          </span>
        </div>
      </footer>

      <Suspense fallback={null}>
        <CustomerAsk params={params} />
      </Suspense>
    </AskProvider>
  );
}

async function CustomerHeader({ params }: { params: LayoutProps<"/c/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  // If the database is unavailable, keep a plain header so the page's own friendly
  // error (c/[token]/error.tsx) shows inside the customer shell.
  const [customer, review] = await Promise.all([
    getCustomerView(token).catch(() => null),
    getCustomerReview(token).catch(() => null),
  ]);
  const champion = customer?.profile.champion.name;

  return (
    <>
      {customer && <VisitTracker token={token} />}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        {customer && <LiveRefresh />}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {customer && <AccountLogo name={customer.name} logoId={customer.logoId} size={34} />}
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-semibold">
                  {customer ? customer.name : "Copilot"}
                  <span className="mx-1.5 font-normal text-ink-faint">x</span>
                  Copilot
                </p>
                <p className="truncate text-xs text-ink-muted">Customer success portal</p>
              </div>
            </div>
            {champion && (
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{champion}</p>
                  <p className="text-xs text-ink-muted">{customer.profile.champion.title}</p>
                </div>
                <span
                  className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink ring-1 ring-accent/15"
                  aria-hidden
                >
                  {champion
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {customer && <CustomerTabNav token={token} hasReview={!!review} />}
        </div>
      </header>
    </>
  );
}

/** The floating Ask assistant, on every portal page. */
async function CustomerAsk({ params }: { params: LayoutProps<"/c/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  const customer = await getCustomerView(token).catch(() => null);
  if (!customer) return null;
  return <AskLauncher token={token} starters={askStarters(customer)} />;
}

function HeaderSkeleton() {
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-3 sm:px-6">
        <div className="h-10 w-72 max-w-full animate-pulse rounded bg-surface-strong" />
        <div className="h-8 animate-pulse rounded bg-surface-strong" />
      </div>
    </header>
  );
}
