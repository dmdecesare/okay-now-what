"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { recordVisit } from "@/app/actions/visits";

/**
 * Counts a champion visit once per page load. When the rep opens the link in
 * preview mode (?preview=1), nothing is recorded and a small banner says so.
 */
export function VisitTracker({ token }: { token: string }) {
  const preview = useSearchParams().get("preview") === "1";
  const sent = useRef(false);

  useEffect(() => {
    if (preview || sent.current) return;
    sent.current = true;
    void recordVisit(token);
  }, [preview, token]);

  if (!preview) return null;
  return (
    <div className="bg-ink px-4 py-1.5 text-center text-xs font-medium text-white">
      Rep preview: this visit isn&apos;t counted as a customer visit.
    </div>
  );
}
