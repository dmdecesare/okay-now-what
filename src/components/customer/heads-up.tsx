import Link from "next/link";
import { BellRing } from "lucide-react";
import type { Nudge } from "@/lib/nudges";
import { cn } from "@/lib/cn";

const TAB: Record<Nudge["target"], string> = {
  plan: "/plan",
  learn: "/learn",
  videos: "/videos",
  home: "",
  questions: "",
  overview: "",
  adoption: "/progress",
};

/** The customer's automatic nudges, on the portal home. */
export function HeadsUp({ token, nudges }: { token: string; nudges: Nudge[] }) {
  if (nudges.length === 0) return null;
  return (
    <section className="rounded-xl border border-watch/25 bg-watch-soft/40 p-5">
      <div className="flex items-center gap-2">
        <BellRing className="size-4 text-watch" />
        <h2 className="text-sm font-semibold">Heads up</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {nudges.slice(0, 4).map((n) => (
          <li key={n.key}>
            <Link href={`/c/${token}${TAB[n.target]}`} className="group flex items-start gap-2.5 text-sm">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.tone === "warn" ? "bg-watch" : "bg-chart-1")} aria-hidden />
              <span className="group-hover:text-accent">{n.customer}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
