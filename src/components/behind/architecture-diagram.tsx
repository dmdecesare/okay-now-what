import { cn } from "@/lib/cn";

// How a request flows. Built with HTML boxes so it stacks cleanly on phones.

function Box({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-accent/40 bg-accent-soft/60" : "border-border bg-bg")}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-ink-muted">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-1 text-xs text-ink-faint lg:flex-col lg:px-1 lg:py-0" aria-hidden>
      <span className="lg:hidden">↓ {label}</span>
      <span className="hidden text-center lg:block">
        {label}
        <br />→
      </span>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <figure aria-label="Architecture: browser to Vercel server routes to the Anthropic API and the database">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1.3fr_auto_1fr] lg:items-center">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Browser</p>
          <Box title="Rep view" items={["Book of business", "Account tabs, briefs, tools", "Rep assistant"]} />
          <Box title="Customer view" items={["Private success portal", "Plan, learning paths, review", "Ask assistant"]} />
        </div>

        <Arrow label="HTTPS" />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Vercel (server)</p>
          <Box
            accent
            title="Next.js server routes"
            items={[
              "Pages render on the server",
              "/api/ask streams customer answers",
              "/api/rep-chat streams rep answers",
              "/api/accounts builds accounts",
              "Server actions: check-offs, briefs, reviews, drafts",
              "Rate limits and input checks",
            ]}
          />
          <div className="flex items-start gap-2 rounded-lg border border-ok/30 bg-ok-soft px-3 py-2 text-sm">
            <LockIcon />
            <span>
              <span className="font-semibold">The API key lives only here,</span> in a server environment variable. It
              never reaches the browser.
            </span>
          </div>
        </div>

        <Arrow label="server to server" />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Services</p>
          <Box title="Anthropic API" items={["Claude Sonnet 5.5", "Structured outputs, validated", "Prompt caching"]} />
          <Box title="Neon Postgres" items={["Accounts, plans, usage, spend", "Questions, reviews, learning", "Call log for rate limits"]} />
        </div>
      </div>
    </figure>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden>
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
