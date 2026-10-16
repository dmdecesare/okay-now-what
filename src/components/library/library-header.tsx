import Link from "next/link";
import { BookOpen, GraduationCap, PlayCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/library/guides", label: "Guides", icon: BookOpen },
  { href: "/library/videos", label: "Videos", icon: PlayCircle },
  { href: "/library/learning", label: "Learning paths", icon: GraduationCap },
] as const;

/** Header for the rep's view of the content customers see in their success portals. */
export function LibraryHeader({ active, description }: { active: (typeof TABS)[number]["href"]; description: string }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-medium text-ink-muted">Customer content</p>
        <h1 className="text-display font-semibold">What your customers see</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>
      </div>
      <nav aria-label="Customer content" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-0.5 border-b border-border">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active === href ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active === href ? "border-accent text-ink" : "border-transparent text-ink-muted hover:border-border-strong hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Small logo chips for the accounts something applies to. */
export function AccountChips({ accounts }: { accounts: { slug: string; name: string }[] }) {
  if (accounts.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {accounts.map((a) => (
        <Link
          key={a.slug}
          href={`/accounts/${a.slug}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-ink-muted hover:border-accent/40 hover:text-ink"
        >
          {a.name}
        </Link>
      ))}
    </div>
  );
}
