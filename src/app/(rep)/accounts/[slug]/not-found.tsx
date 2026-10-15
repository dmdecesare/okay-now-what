import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function AccountNotFound() {
  return (
    <EmptyState
      title="We couldn't find that account"
      body="It may have been renamed or removed."
      action={
        <ButtonLink href="/" variant="secondary">
          Back to book of business
        </ButtonLink>
      }
    />
  );
}
