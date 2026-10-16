"use client";

import { Printer } from "lucide-react";
import { Button } from "./button";

/** Opens the browser's print dialog, which also offers Save as PDF. */
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer />
      {label}
    </Button>
  );
}
