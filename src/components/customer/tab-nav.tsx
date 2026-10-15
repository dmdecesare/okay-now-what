"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "", label: "Home" },
  { href: "/plan", label: "Plan" },
  { href: "/videos", label: "Videos" },
  { href: "/guides", label: "Guides" },
  { href: "/setup", label: "Setup guide" },
  { href: "/kit", label: "Champion kit" },
  { href: "/progress", label: "Progress" },
  { href: "/ask", label: "Ask" },
];

export function CustomerTabNav({ token }: { token: string }) {
  const pathname = usePathname();
  // Keep rep preview mode on while clicking between tabs.
  const preview = useSearchParams().get("preview") === "1" ? "?preview=1" : "";
  const base = `/c/${token}`;

  return (
    <nav aria-label="Onboarding sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
        {TABS.map((t) => {
          const href = base + t.href;
          const active = pathname === href;
          return (
            <li key={t.label}>
              <Link
                href={href + preview}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-bg text-ink shadow-sm" : "text-accent-ink/80 hover:bg-bg/60 hover:text-ink",
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
