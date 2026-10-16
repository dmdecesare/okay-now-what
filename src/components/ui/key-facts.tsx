import { cn } from "@/lib/cn";

/** A strip of label and value pairs, divided by hairlines. Wraps into a grid on small screens. */
export function KeyFacts({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode; sub?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-bg shadow-card sm:grid-cols-3 lg:flex lg:divide-x lg:divide-border",
        className,
      )}
    >
      {items.map((it) => (
        <div key={it.label} className="min-w-0 border-b border-border px-4 py-3 last:border-b-0 lg:flex-1 lg:border-b-0">
          <dt className="text-xs font-medium text-ink-faint">{it.label}</dt>
          <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-ink">{it.value}</dd>
          {it.sub && <dd className="truncate text-xs text-ink-muted">{it.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}
