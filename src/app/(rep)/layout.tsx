import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getSummaries } from "@/db/queries";
import {
  AskClaudeButton,
  RepChatPanel,
  RepChatProvider,
} from "@/components/rep-chat/rep-chat";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarFrame, ShellProvider } from "@/components/shell/shell-context";
import { TopBar } from "@/components/shell/top-bar";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <RepChatProvider>
        <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
          <SidebarFrame>
            <Sidebar />
          </SidebarFrame>

          <div className="flex min-h-dvh min-w-0 flex-col">
            <TopBar actions={<AskClaudeButton />} />
            <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </main>
            <footer className="border-t border-border print:hidden">
              <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-ink-muted sm:px-6 lg:px-8">
                <p>Designed by Derek DeCesare. Built with Claude Code.</p>
                <div className="flex gap-5">
                  <Link href="/behind-the-build" className="hover:text-ink">
                    Behind the build
                  </Link>
                  <Link href="/design" className="hover:text-ink">
                    Design system
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
        <Suspense fallback={null}>
          <RepChat />
        </Suspense>
      </RepChatProvider>
    </ShellProvider>
  );
}

/** The rep's chat panel, on every rep page. Gets the account list for links and starters. */
async function RepChat() {
  await connection();
  const accounts = await getSummaries().catch(() => []);
  return (
    <RepChatPanel
      accounts={accounts.map((a) => ({
        slug: a.slug,
        name: a.name,
        atRisk: a.health.status === "at_risk",
      }))}
    />
  );
}
