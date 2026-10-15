import { EmptyState } from "@/components/ui/card";

export default function CustomerNotFound() {
  return (
    <EmptyState
      title="We couldn't find this onboarding page"
      body="The link may be incomplete or out of date. Ask your account rep to send it again."
    />
  );
}
