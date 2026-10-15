export function TabSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-busy>
      <div className="h-40 animate-pulse rounded-xl bg-surface" />
      <div className="h-40 animate-pulse rounded-xl bg-surface" />
      <div className="h-56 animate-pulse rounded-xl bg-surface md:col-span-2" />
    </div>
  );
}
