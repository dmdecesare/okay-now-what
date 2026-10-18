"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";

/** Delete an account by typing its name. For accounts created by mistake. */
export function DeleteAccount({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();

  return (
    <section className="rounded-xl border border-risk/25 bg-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Delete this account</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Removes {name}, its plan, notes, questions, and the customer&apos;s portal. This can&apos;t be undone.
          </p>
        </div>
        {!open && (
          <Button type="button" size="sm" variant="outline" className="border-risk/40 text-risk hover:bg-risk-soft" onClick={() => setOpen(true)}>
            <Trash2 />
            Delete account
          </Button>
        )}
      </div>
      {open && (
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            start(async () => {
              const res = await deleteAccount(slug, typed);
              if (res && !res.ok) setError(res.message);
            });
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-ink-muted">
              Type <b className="text-ink">{name}</b> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              className="h-9 w-64 max-w-full rounded-lg border border-border-strong bg-bg px-2.5 text-sm outline-none focus:border-risk"
            />
          </label>
          <Button type="submit" size="sm" disabled={!matches || pending} className="bg-risk hover:bg-risk/90">
            {pending ? "Deleting..." : "Delete forever"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setOpen(false); setTyped(""); }}>
            Cancel
          </Button>
          {error && <p role="alert" className="w-full text-sm text-risk">{error}</p>}
        </form>
      )}
    </section>
  );
}
