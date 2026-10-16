"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";

const PAGES: Record<string, string> = {
  "/accounts/new": "Add account",
  "/library/guides": "Guides",
  "/library/videos": "Videos",
  "/library/learning": "Learning paths",
  "/design": "Design system",
};

const TABS: Record<string, string> = {
  plan: "Plan",
  adoption: "Adoption",
  spend: "Spend",
  health: "Health and growth",
  questions: "Questions",
  tools: "Tools",
  brief: "Call brief",
  "log-call": "Log a call",
};

/** Where you are in the rep app. Account names come from the server; the path picks the trail. */
export function Breadcrumbs({ names }: { names: Record<string, string> }) {
  const pathname = usePathname();
  const crumbs: { label: React.ReactNode; href?: string }[] = [{ label: "Book of business", href: "/" }];

  const account = pathname.match(/^\/accounts\/([a-z0-9-]+)(?:\/([a-z-]+))?/);
  if (PAGES[pathname]) {
    crumbs.push({ label: PAGES[pathname] });
  } else if (account && account[1] !== "new") {
    const slug = account[1];
    const name = names[slug] ?? "Account";
    crumbs.push({
      label: (
        <span className="inline-flex items-center gap-2">
          <AccountLogo name={name} slug={slug} size={18} className="rounded-[4px] shadow-none" />
          {name}
        </span>
      ),
      href: account[2] ? `/accounts/${slug}` : undefined,
    });
    if (account[2] && TABS[account[2]]) crumbs.push({ label: TABS[account[2]] });
  } else if (pathname === "/") {
    crumbs[0] = { label: "Book of business" };
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-ink-faint" aria-hidden />}
              {c.href && !last ? (
                <Link href={c.href} className="truncate text-ink-muted hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink" aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
