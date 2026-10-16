import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "xs" | "sm" | "md";

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_1px_2px_rgb(15_26_31/0.12),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-accent-hover",
  secondary: "border border-border bg-bg text-ink shadow-card hover:border-border-strong hover:bg-surface",
  outline: "border border-border-strong bg-transparent text-ink hover:bg-surface",
  ghost: "text-ink-muted hover:bg-surface-strong/70 hover:text-ink",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

/** Square icon-only button. Always pass an aria-label. */
export function IconButton({
  className,
  variant = "ghost",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; "aria-label": string }) {
  return <button className={buttonClasses(variant, "sm", cn("w-8 px-0", className))} {...props} />;
}
