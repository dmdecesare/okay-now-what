import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// A plain, accessible data table. To make a whole row clickable, put a <RowLink> in the first cell:
// it stretches over the row, so the row is still a real link (and still crawlable).

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("border-b border-border bg-surface/60", className)} {...props} />;
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("whitespace-nowrap px-4 py-2.5 text-micro font-medium uppercase text-ink-faint", className)}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "relative border-b border-border last:border-b-0 transition-colors hover:bg-surface/70 has-[a:focus-visible]:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

/** The row's main link. Its ::after stretches over the whole row, so any click on the row follows it. */
export function RowLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn("font-medium text-ink outline-none after:absolute after:inset-0 after:content-['']", className)}
      {...props}
    />
  );
}
