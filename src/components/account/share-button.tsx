"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2 } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

/** Copies or opens the customer's private success portal link. */
export function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/c/${token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the customer link:", new URL(path, window.location.origin).toString());
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={copy} aria-live="polite">
        {copied ? <Check /> : <Link2 />}
        {copied ? "Link copied" : "Copy customer link"}
      </Button>
      {/* Preview mode: the rep's own visit doesn't count as a champion visit. */}
      <a href={`${path}?preview=1`} target="_blank" rel="noopener" className={buttonClasses("secondary", "sm")}>
        <ExternalLink />
        Open customer view
      </a>
    </div>
  );
}
