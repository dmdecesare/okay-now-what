"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, LayoutGrid, PlayCircle, PlusCircle } from "lucide-react";
import { AccountLogo } from "@/components/logos/account-logo";
import { HealthDot } from "@/components/ui/badges";
import type { HealthStatus } from "@/lib/health";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Book of business", icon: LayoutGrid, match: (p: string) => p === "/" },
  { href: "/accounts/new", label: "Add account", icon: PlusCircle, match: (p: string) => p === "/accounts/new" },
];

const CONTENT = [
  { href: "/library/guides", label: "Guides", icon: BookOpen, match: (p: string) => p.startsWith("/library/guides") },
  { href: "/library/videos", label: "Videos", icon: PlayCircle, match: (p: string) => p.startsWith("/library/videos") },
  { href: "/library/learning", label: "Learning paths", icon: GraduationCap, match: (p: string) => p.startsWith("/library/learning") },
];

const itemClass = (active: boolean) =>
  cn(
    "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
    active ? "bg-sidebar-active text-sidebar-ink" : "text-sidebar-muted hover:bg-sidebar-active hover:text-sidebar-ink",
  );

export function SidebarNav({ section = "main" }: { section?: "main" | "content" }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {(section === "content" ? CONTENT : NAV).map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <li key={href}>
            <Link href={href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
              <Icon className={cn("size-4", active ? "text-[#2dd4bf]" : "text-sidebar-muted group-hover:text-sidebar-ink")} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarAccountList({
  accounts,
}: {
  accounts: { slug: string; name: string; status: HealthStatus }[];
}) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {accounts.map((a) => {
        const href = `/accounts/${a.slug}`;
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={a.slug}>
            <Link href={href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
              <AccountLogo name={a.name} slug={a.slug} size={20} className="rounded-[5px] shadow-none" />
              <span className="min-w-0 flex-1 truncate">{a.name}</span>
              <HealthDot status={a.status} onDark />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
