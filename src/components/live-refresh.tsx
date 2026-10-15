"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the rep and customer views in step: re-renders the page with fresh data when
 * you switch back to the tab, and every 10 seconds while it's visible.
 * Client state (like a draft being edited) is preserved.
 */
export function LiveRefresh({ intervalMs = 10_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    const timer = window.setInterval(refreshIfVisible, intervalMs);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
      window.clearInterval(timer);
    };
  }, [router, intervalMs]);

  return null;
}
