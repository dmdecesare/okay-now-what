import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export const metadata: Metadata = { title: "Behind the build" };

// Placeholder until Phase 9 (architecture, prompts, build timeline).
export default function BehindTheBuildPage() {
  return (
    <EmptyState
      title="Behind the build is coming soon"
      body="How this app was planned and built with Claude, the architecture, and every prompt Claude runs live."
      action={
        <ButtonLink href="/" variant="secondary">
          Back to book of business
        </ButtonLink>
      }
    />
  );
}
