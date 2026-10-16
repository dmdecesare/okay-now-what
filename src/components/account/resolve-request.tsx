"use client";

import { useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { setHelpRequestResolved } from "@/app/actions/support";
import { Button } from "@/components/ui/button";

export function ResolveRequest({ slug, id, resolved }: { slug: string; id: string; resolved: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="xs"
      variant={resolved ? "ghost" : "secondary"}
      disabled={pending}
      onClick={() => start(async () => void (await setHelpRequestResolved(slug, id, !resolved)))}
    >
      {resolved ? <RotateCcw /> : <Check />}
      {pending ? "Saving..." : resolved ? "Reopen" : "Mark resolved"}
    </Button>
  );
}
