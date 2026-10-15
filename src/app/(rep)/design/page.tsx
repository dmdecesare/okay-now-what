import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, SectionHeader } from "@/components/ui/card";
import { Badge, StageBadge, StatusPill } from "@/components/ui/badges";
import { ProgressBar, Stat } from "@/components/ui/metrics";
import { Tabs } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";

export const metadata: Metadata = { title: "Design system" };

const COLORS = [
  { name: "Accent", token: "--accent", className: "bg-accent" },
  { name: "Accent soft", token: "--accent-soft", className: "bg-accent-soft" },
  { name: "Ink", token: "--ink", className: "bg-ink" },
  { name: "Ink muted", token: "--ink-muted", className: "bg-ink-muted" },
  { name: "Surface", token: "--surface", className: "bg-surface" },
  { name: "Border", token: "--border", className: "bg-border" },
  { name: "On track", token: "--ok", className: "bg-ok" },
  { name: "Watch", token: "--watch", className: "bg-watch" },
  { name: "At risk", token: "--risk", className: "bg-risk" },
];

export default function DesignPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-display font-semibold">Design system</h1>
        <p className="mt-1 text-ink-muted">
          One confident accent, quiet neutrals, and plenty of white space. Status colors only appear on pills.
        </p>
      </div>

      <section>
        <SectionHeader title="Color" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map((c) => (
            <div key={c.token} className="overflow-hidden rounded-lg border border-border">
              <div className={`h-14 ${c.className}`} />
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="font-mono text-xs text-ink-faint">{c.token}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Type" />
        <Card className="space-y-3">
          <p className="text-display font-semibold">Display: Book of business</p>
          <p className="text-title font-semibold">Title: Copperleaf Lending x Copilot onboarding</p>
          <p>Body: Every account you own after the deal closes, in one place.</p>
          <p className="text-sm text-ink-muted">Caption: Usage data appears once the customer is live.</p>
        </Card>
      </section>

      <section>
        <SectionHeader title="Buttons and badges" />
        <Card className="flex flex-wrap items-center gap-3">
          <Button>Generate</Button>
          <Button variant="secondary">Copy link</Button>
          <Button variant="ghost">Cancel</Button>
          <ButtonLink href="/" size="sm">
            Small link
          </ButtonLink>
          <CopyButton text="Okay, now what?" />
          <span className="mx-2 h-6 w-px bg-border" aria-hidden />
          <StageBadge stage="pilot" />
          <StageBadge stage="onboarding" />
          <StageBadge stage="rolling_out" />
          <Badge>Neutral</Badge>
          <StatusPill status="on_track" />
          <StatusPill status="watch" />
          <StatusPill status="at_risk" />
        </Card>
      </section>

      <section>
        <SectionHeader title="Numbers and progress" />
        <Card className="grid gap-6 sm:grid-cols-3">
          <Stat label="Active seats" value="82 of 100" sub="Up 8 since last check-in" trend="up" />
          <Stat label="Monthly spend" value="$29,680" sub="Premium requests down 18%" trend="down" />
          <Stat label="Plan progress" value="4 of 9" sub="Milestones done" />
          <ProgressBar value={82} label="Weekly active pilot users" className="sm:col-span-3" />
        </Card>
      </section>

      <section>
        <SectionHeader title="Tabs" />
        <Card>
          <Tabs
            items={[
              { id: "overview", label: "Overview", content: <p className="text-sm">What we heard during the deal.</p> },
              { id: "plan", label: "Plan", content: <p className="text-sm">Milestones, synced with the customer.</p> },
              { id: "adoption", label: "Adoption", content: <p className="text-sm">Active seats by team.</p> },
            ]}
          />
        </Card>
      </section>

      <section>
        <SectionHeader title="Empty state" />
        <EmptyState
          title="No accounts yet. Okay, now what?"
          body="Add your first one. Paste your deal notes and we'll build the plan and the customer's onboarding app."
          action={<Button>Add account</Button>}
        />
      </section>
    </div>
  );
}
