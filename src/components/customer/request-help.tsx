"use client";

import { useCallback, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LifeBuoy } from "lucide-react";
import { createHelpRequest } from "@/app/actions/support";
import { Button, buttonClasses } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { HELP_KINDS, HELP_KIND_LABELS, type HelpKind } from "@/lib/support";
import { cn } from "@/lib/cn";

/** "Request help" from the portal: book a session, flag a blocker, or ask the account team anything. */
export function RequestHelp({ token, variant = "header" }: { token: string; variant?: "header" | "card" }) {
  const preview = useSearchParams().get("preview") === "1";
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<HelpKind>("session");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSent(false);
        }}
        className={variant === "header" ? buttonClasses("secondary", "sm") : buttonClasses("primary", "sm")}
      >
        <LifeBuoy />
        Request help
      </button>
      <Sheet open={open} onClose={close} placement="right" title="Ask your account team for help" subtitle="Your GitHub account team sees this right away.">
        {sent ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="mx-auto size-8 text-ok" />
            <p className="mt-2 font-semibold">Sent. We&apos;ll get back to you shortly.</p>
            <p className="mt-1 text-sm text-ink-muted">
              {preview ? "Rep preview: this request wasn't saved." : "You can see its status on your portal home."}
            </p>
            <Button type="button" variant="secondary" className="mt-4" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              start(async () => {
                const res = await createHelpRequest(token, { kind, message, name }, preview);
                if (!res.ok) return setError(res.message);
                setSent(true);
                setMessage("");
              });
            }}
          >
            <fieldset>
              <legend className="mb-2 text-sm font-medium">What do you need?</legend>
              <div className="grid gap-2">
                {HELP_KINDS.map((k) => (
                  <label
                    key={k}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
                      kind === k ? "border-accent bg-accent-soft/60 font-medium" : "border-border hover:border-border-strong",
                    )}
                  >
                    <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="accent-[var(--accent)]" />
                    {HELP_KIND_LABELS[k].label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{HELP_KIND_LABELS[kind].prompt}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={1000}
                className="w-full rounded-lg border border-border-strong bg-bg p-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Your name (optional)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="h-9 w-full rounded-lg border border-border-strong bg-bg px-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-watch">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || message.trim().length < 5} className="w-full">
              {pending ? "Sending..." : "Send to my account team"}
            </Button>
          </form>
        )}
      </Sheet>
    </>
  );
}
