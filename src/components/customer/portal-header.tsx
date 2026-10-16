/** The title block at the top of each portal tab: an icon chip, the title, and one line of context. */
export function PortalHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#14b8a6] text-white shadow-card [&_svg]:size-5">
          {icon}
        </span>
        <div>
          <h1 className="text-display font-semibold">{title}</h1>
          <p className="mt-1 max-w-2xl text-ink-muted">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
