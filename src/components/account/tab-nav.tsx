"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/plan", label: "Plan" },
  { href: "/adoption", label: "Adoption" },
  { href: "/spend", label: "Spend" },
  { href: "/health", label: "Health" },
  { href: "/questions", label: "Questions" },
  { href: "/tools", label: "Tools" },
];

export function AccountTabNav({ slug, questionCount }: { slug: string; questionCount: number }) {
  const pathname = usePathname();
  const base = `/accounts/${slug}`;

  return (
    <nav aria-label="Account sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-border">
        {TABS.map((t) => {
          const href = base + t.href;
          const active = pathname === href;
          return (
            <li key={t.label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                {t.label}
                {t.label === "Questions" && questionCount > 0 && (
                  <span className="rounded-full bg-surface-strong px-1.5 text-xs tabular-nums text-ink-muted">
                    {questionCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
