import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Wordmark } from "@/components/wordmark";
import { getCustomer } from "./data";

export const metadata: Metadata = {
  title: "Copilot onboarding",
  // Private links: keep them out of search engines.
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children, params }: LayoutProps<"/c/[token]">) {
  return (
    <>
      <header className="border-b border-border bg-accent-soft">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Suspense fallback={<div className="h-8 w-72 animate-pulse rounded bg-white/60" />}>
            <CustomerHeading params={params} />
          </Suspense>
        </div>
      </header>

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

async function CustomerHeading({ params }: { params: LayoutProps<"/c/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  const customer = await getCustomer(token);

  return (
    <div>
      <p className="text-sm font-medium text-accent-ink">Onboarding</p>
      <h1 className="text-title font-semibold sm:text-display">
        {customer ? `${customer.name} x Copilot onboarding` : "Copilot onboarding"}
      </h1>
    </div>
  );
}
