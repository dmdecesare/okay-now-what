"use client";

import { useState, useTransition } from "react";
import { Globe, Lock } from "lucide-react";
import { setReviewPublishedAction } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";

/** Shares the review on the customer's portal, or takes it back down. */
export function PublishToggle({ slug, published }: { slug: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant={published ? "secondary" : "primary"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await setReviewPublishedAction(slug, !published);
            if (!res.ok) setError(res.message);
          })
        }
      >
        {published ? <Lock /> : <Globe />}
        {pending ? "Saving..." : published ? "Unpublish" : "Publish to portal"}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-watch">
          {error}
        </span>
      )}
    </span>
  );
}
