"use client";

import { useCallback, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

/** Opens the two Sheet placements so they can be checked on the design page. */
export function SheetDemo() {
  const [open, setOpen] = useState<"right" | "bottom-left" | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => setOpen("right")}>
        <MessageSquare /> Right panel
      </Button>
      <Button variant="secondary" onClick={() => setOpen("bottom-left")}>
        <MessageSquare /> Bottom-left panel
      </Button>
      {(["right", "bottom-left"] as const).map((p) => (
        <Sheet
          key={p}
          open={open === p}
          onClose={close}
          placement={p}
          title={p === "right" ? "Ask AI about your book" : "Ask anything about Copilot"}
          subtitle="Design preview"
        >
          <div className="space-y-3 p-4 text-sm text-ink-muted">
            <p>Panels stay mounted while closed, so a conversation keeps its place across pages.</p>
            <p>Press Escape or the close button to dismiss.</p>
          </div>
        </Sheet>
      ))}
    </div>
  );
}
