import type { Metadata } from "next";
import { Building2, TrendingUp, Users } from "lucide-react";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, SectionHeader } from "@/components/ui/card";
import { Badge, ExpansionPill, HealthDot, StageBadge, StatusPill } from "@/components/ui/badges";
import { KpiTile, ProgressBar, Stat } from "@/components/ui/metrics";
import { Sparkline } from "@/components/ui/sparkline";
import { MiniBar } from "@/components/ui/mini-bar";
import { KeyFacts } from "@/components/ui/key-facts";
import { PageHeader } from "@/components/ui/page-header";
import { RowLink, Table, Td, Th, THead, Tr } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import { AccountLogo } from "@/components/logos/account-logo";
import { Wordmark } from "@/components/wordmark";
import { SheetDemo } from "@/components/design/sheet-demo";

export const metadata: Metadata = { title: "Design system" };

const COLORS = [
  { name: "Accent", token: "--accent", className: "bg-accent" },
  { name: "Accent soft", token: "--accent-soft", className: "bg-accent-soft" },
  { name: "Ink", token: "--ink", className: "bg-ink" },
  { name: "Ink muted", token: "--ink-muted", className: "bg-ink-muted" },
  { name: "Ink faint", token: "--ink-faint", className: "bg-ink-faint" },
  { name: "Canvas", token: "--canvas", className: "bg-canvas" },
  { name: "Surface", token: "--surface", className: "bg-surface" },
  { name: "Border", token: "--border", className: "bg-border" },
  { name: "Sidebar", token: "--sidebar-bg", className: "bg-sidebar" },
  { name: "On track", token: "--ok", className: "bg-ok" },
  { name: "Watch", token: "--watch", className: "bg-watch" },
  { name: "At risk", token: "--risk", className: "bg-risk" },
  { name: "Growth", token: "--growth", className: "bg-growth" },
  { name: "Chart 1", token: "--chart-1", className: "bg-chart-1" },
  { name: "Chart 2", token: "--chart-2", className: "bg-chart-2" },
];

const SAMPLE_ROWS = [
  { name: "Harborline Payments", slug: "harborline-payments", stage: "pilot" as const, seats: 100, active: 82, spark: [61, 74, 82], health: "on_track" as const, growth: "strong" as const },
  { name: "Copperleaf Lending", slug: "copperleaf-lending", stage: "onboarding" as const, seats: 550, active: 35, spark: [22, 30, 35], health: "on_track" as const, growth: "none" as const },
  { name: "Bluestone Assurance", slug: "bluestone-assurance", stage: "rolling_out" as const, seats: 700, active: 71, spark: [84, 78, 71], health: "at_risk" as const, growth: "emerging" as const },
];

const GENERATED = ["Northwind Freight", "Atlas Robotics", "Meridian Health", "Pinecrest Media", "Solace Energy", "Quartz Labs"];

export default function DesignPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Okay, Now What?"
        title="Design system"
        description="Cool neutrals on a soft canvas, white cards with quiet depth, one brand accent, and status colors that only ever appear on pills and dots."
        actions={<ButtonLink href="/" variant="secondary">Back to the book</ButtonLink>}
      />

      <section>
        <SectionHeader title="Color" description="Tokens live in globals.css. Charts and status colors were checked for contrast and colorblind separation." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map((c) => (
            <div key={c.token} className="overflow-hidden rounded-xl border border-border bg-bg shadow-card">
              <div className={`h-14 border-b border-border ${c.className}`} />
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
          <p className="text-title font-semibold">Title: Copperleaf Lending x Copilot</p>
          <p className="text-kpi font-semibold tabular-nums">KPI: 1,350</p>
          <p className="text-micro font-medium uppercase text-ink-faint">Micro: table header</p>
          <p>Body: Every account you own after the deal closes, in one place.</p>
          <p className="text-sm text-ink-muted">Caption: Usage data appears once the customer is live.</p>
        </Card>
      </section>

      <section>
        <SectionHeader title="Logos" description="Made-up marks for the fictional demo companies. Accounts built from notes get a generated mark." />
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-6">
            {SAMPLE_ROWS.map((r) => (
              <div key={r.slug} className="flex items-center gap-3">
                <AccountLogo name={r.name} slug={r.slug} size={44} />
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-ink-muted">Hand-drawn mark</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
            {GENERATED.map((n) => (
              <div key={n} className="flex items-center gap-2">
                <AccountLogo name={n} size={28} />
                <span className="text-sm">{n}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-6 rounded-xl bg-sidebar p-4">
            <Wordmark tone="dark" />
            {SAMPLE_ROWS.map((r) => (
              <span key={r.slug} className="flex items-center gap-2 text-sm text-sidebar-ink">
                <AccountLogo name={r.name} slug={r.slug} size={20} />
                {r.name}
                <HealthDot status={r.health} onDark />
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="Buttons and badges" />
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Build account</Button>
            <Button variant="secondary">Copy customer link</Button>
            <Button variant="outline">Open customer view</Button>
            <Button variant="ghost">Cancel</Button>
            <Button size="sm">Small</Button>
            <Button size="xs" variant="secondary">Extra small</Button>
            <IconButton aria-label="Account details" variant="secondary">
              <Building2 />
            </IconButton>
            <ButtonLink href="/" size="sm" variant="secondary">
              Link button
            </ButtonLink>
            <CopyButton text="Okay, now what?" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StageBadge stage="pilot" />
            <StageBadge stage="onboarding" />
            <StageBadge stage="rolling_out" />
            <Badge tone="accent">Accent</Badge>
            <Badge>Neutral</Badge>
            <StatusPill status="on_track" />
            <StatusPill status="watch" />
            <StatusPill status="at_risk" />
            <ExpansionPill level="strong" />
            <ExpansionPill level="emerging" />
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="KPI tiles" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Accounts" value="3" sub="1,350 seats" icon={<Building2 />} />
          <KpiTile
            label="Active across book"
            value="57%"
            change={{ text: "-4 pts", tone: "down" }}
            sub="vs 30 days ago"
            chart={<Sparkline values={[60, 62, 61, 59, 57]} tone="risk" />}
          />
          <KpiTile
            label="Monthly spend"
            value="$56,040"
            change={{ text: "+1%", tone: "up" }}
            sub="vs last month"
            chart={<Sparkline values={[55200, 55600, 56040]} />}
          />
          <KpiTile label="Expansion opportunities" value="2" sub="1 strong, 1 emerging" icon={<TrendingUp />} />
        </div>
      </section>

      <section>
        <SectionHeader title="Table" />
        <Card className="overflow-hidden p-0">
          <Table>
            <THead>
              <tr>
                <Th>Account</Th>
                <Th>Stage</Th>
                <Th className="text-right">Seats</Th>
                <Th>Adoption</Th>
                <Th>Trend</Th>
                <Th>Health</Th>
              </tr>
            </THead>
            <tbody>
              {SAMPLE_ROWS.map((r) => (
                <Tr key={r.slug}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <AccountLogo name={r.name} slug={r.slug} />
                      <RowLink href="/design">{r.name}</RowLink>
                    </div>
                  </Td>
                  <Td>
                    <StageBadge stage={r.stage} />
                  </Td>
                  <Td className="text-right tabular-nums">{r.seats}</Td>
                  <Td>
                    <MiniBar value={r.active} tone={r.health === "at_risk" ? "risk" : "accent"} />
                  </Td>
                  <Td>
                    <Sparkline values={r.spark} tone={r.health === "at_risk" ? "risk" : "accent"} width={64} height={22} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusPill status={r.health} />
                      <ExpansionPill level={r.growth} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>

      <section>
        <SectionHeader title="Cards, facts, and progress" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-0">
            <CardHeader
              icon={<Users className="size-4" />}
              title="Usage by team"
              description="Share of seats active this week."
              action={<Button size="xs" variant="secondary">Refresh</Button>}
            />
            <CardBody className="space-y-4">
              <ProgressBar value={92} label="Policy admin" />
              <ProgressBar value={28} label="Claims platform" tone="risk" />
              <ProgressBar value={93} label="Data and analytics" tone="growth" />
            </CardBody>
          </Card>
          <div className="space-y-4">
            <KeyFacts
              items={[
                { label: "Stage", value: "Rolling out", sub: "Day 75" },
                { label: "Seats", value: "700" },
                { label: "Active", value: "71%", sub: "-12 pts" },
                { label: "Renewal", value: "In 270 days" },
              ]}
            />
            <Card className="grid gap-6 sm:grid-cols-3">
              <Stat label="Active seats" value="82 of 100" sub="Up 8 since last check-in" trend="up" />
              <Stat label="Monthly spend" value="$29,680" sub="Usage down 18%" trend="down" />
              <Stat label="Plan" value="4 of 9" sub="Milestones done" />
            </Card>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Panels" description="Used for the rep chat (right) and the customer Ask assistant (bottom-left)." />
        <Card>
          <SheetDemo />
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
          icon={<Building2 className="size-5" />}
          title="No accounts yet. Okay, now what?"
          body="Add your first one. Paste your deal notes and Claude builds the plan and the customer's success portal."
          action={<Button>Add account</Button>}
        />
      </section>
    </div>
  );
}
