"use client";

import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";

/** Copies or opens the customer's private onboarding link. */
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
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={copy} aria-live="polite">
        {copied ? "Link copied" : "Copy customer link"}
      </Button>
      <a href={path} target="_blank" rel="noopener" className={buttonClasses("secondary", "sm")}>
        Open customer view
      </a>
    </div>
  );
}
