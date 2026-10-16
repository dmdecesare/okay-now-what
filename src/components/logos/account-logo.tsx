import { useId } from "react";
import { generatedMark, seedLogoId, type SeedLogoId } from "@/lib/logos";
import { cn } from "@/lib/cn";
import { SeedMark } from "./marks";

/**
 * A company's logo tile. Seeded demo accounts get their hand-drawn mark; anything else gets a generated
 * initials mark. Decorative by default (the name is always shown next to it).
 */
export function AccountLogo({
  name,
  slug,
  logoId,
  size = 32,
  className,
}: {
  name: string;
  slug?: string | null;
  logoId?: SeedLogoId | null;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const seed = logoId ?? seedLogoId(slug);
  const radius = size >= 40 ? "rounded-[10px]" : "rounded-lg";

  if (seed) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={cn("shrink-0 shadow-[0_1px_2px_rgb(15_26_31/0.12)]", radius, className)}
        aria-hidden
      >
        <SeedMark logoId={seed} id={`logo${uid}`} />
      </svg>
    );
  }

  const m = generatedMark(name);
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0 shadow-[0_1px_2px_rgb(15_26_31/0.12)]", radius, className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill={m.color} />
      {m.pattern === "orbit" && <circle cx="27" cy="5" r="11" fill="#ffffff" fillOpacity="0.12" />}
      {m.pattern === "band" && <path d="M-4 26 26-4h10L6 26Z" fill="#ffffff" fillOpacity="0.1" />}
      <text
        x="16"
        y="16"
        dy="0.36em"
        textAnchor="middle"
        fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        fontWeight="650"
        fontSize={m.initials.length > 1 ? 12.5 : 15}
        letterSpacing="-0.02em"
        fill="#ffffff"
      >
        {m.initials}
      </text>
    </svg>
  );
}
