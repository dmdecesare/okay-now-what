"use client";

import { useState, useTransition } from "react";
import { setRoiAssumptions } from "@/app/actions/roi";
import { Button } from "@/components/ui/button";

/** Edit the two value-report assumptions for one account. */
export function RoiAssumptionsForm({ slug, hours, rate }: { slug: string; hours: number; rate: number }) {
  const [h, setH] = useState(String(hours));
  const [r, setR] = useState(String(rate));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await setRoiAssumptions(slug, { hoursSavedPerWeek: Number(h), hourlyCost: Math.round(Number(r)) });
          setMsg(res.ok ? "Saved. The customer's Value page is updated." : res.message);
        });
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs text-ink-muted">Hours saved per developer a week</span>
        <input type="number" step="0.5" min="0.5" max="10" value={h} onChange={(e) => setH(e.target.value)} className="h-9 w-28 rounded-lg border border-border-strong bg-bg px-2.5 text-sm" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-ink-muted">Loaded hourly cost ($)</span>
        <input type="number" step="5" min="25" max="250" value={r} onChange={(e) => setR(e.target.value)} className="h-9 w-28 rounded-lg border border-border-strong bg-bg px-2.5 text-sm" />
      </label>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save assumptions"}
      </Button>
      {msg && <p className="w-full text-xs text-ink-muted" role="status">{msg}</p>}
    </form>
  );
}
