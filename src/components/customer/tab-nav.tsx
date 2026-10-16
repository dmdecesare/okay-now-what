"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CONDITIONAL_TABS, CUSTOMER_NAV } from "@/lib/customer-routes";
import { cn } from "@/lib/cn";

export function CustomerTabNav({ token, hasReview }: { token: string; hasReview: boolean }) {
  const pathname = usePathname();
  // Keep rep preview mode on while clicking between tabs.
  const preview = useSearchParams().get("preview") === "1" ? "?preview=1" : "";
  const base = `/c/${token}`;

  return (
    <nav aria-label="Portal sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-0.5">
        {CUSTOMER_NAV.filter((t) => hasReview || t.href !== CONDITIONAL_TABS.review).map((t) => {
          const href = base + t.href;
          const active = pathname === href;
          return (
            <li key={t.label}>
              <Link
                href={href + preview}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active ? "border-accent text-ink" : "border-transparent text-ink-muted hover:border-border-strong hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
