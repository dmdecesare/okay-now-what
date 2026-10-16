import { cn } from "@/lib/cn";

/** The title block at the top of a page: optional eyebrow, title, description, and actions on the right. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  leading,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-4">
        {leading}
        <div className="min-w-0">
          {eyebrow && <div className="mb-1 text-xs font-medium text-ink-muted">{eyebrow}</div>}
          <h1 className="text-display font-semibold text-ink">{title}</h1>
          {description && <div className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
