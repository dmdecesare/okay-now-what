import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export const metadata: Metadata = { title: "Add account" };

// Placeholder until Phase 6 (paste deal notes, generate the plan and customer app).
export default function NewAccountPage() {
  return (
    <EmptyState
      title="Adding accounts is coming soon"
      body="You'll paste your deal notes here and get a full plan and customer onboarding app in under a minute."
      action={
        <ButtonLink href="/" variant="secondary">
          Back to book of business
        </ButtonLink>
      }
    />
  );
}
