import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { ButtonLink } from "@/components/ui/button";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="Okay, Now What? home">
            <Wordmark />
          </Link>
          <div className="hidden items-center gap-5 text-sm text-ink-muted sm:flex">
            <Link href="/" className="hover:text-ink">
              Book of business
            </Link>
            <Link href="/behind-the-build" className="hover:text-ink">
              Behind the build
            </Link>
          </div>
          <ButtonLink href="/accounts/new" size="sm" className="ml-auto">
            Add account
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:px-6">
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
    </>
  );
}
