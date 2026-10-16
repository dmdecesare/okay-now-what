import { cn } from "@/lib/cn";

/**
 * A tiny trend line drawn as plain SVG, so it renders on the server with no chart library.
 * Decorative: always pair it with the number it summarizes.
 */
export function Sparkline({
  values,
  width = 88,
  height = 28,
  tone = "accent",
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: "accent" | "risk" | "growth" | "muted" | "onDark";
  className?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const step = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => [pad + i * step, pad + (height - pad * 2) * (1 - (v - min) / span)] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points.at(-1)![0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`;
  const [lx, ly] = points.at(-1)!;
  const color =
    tone === "risk"
      ? "var(--risk)"
      : tone === "growth"
        ? "var(--growth)"
        : tone === "muted"
          ? "var(--ink-faint)"
          : tone === "onDark"
            ? "#5eead4"
            : "var(--chart-1)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      <path d={area} fill={color} opacity={tone === "onDark" ? 0.14 : 0.08} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} stroke={tone === "onDark" ? "#0b1a17" : "var(--bg)"} strokeWidth={1.5} />
    </svg>
  );
}
