import { EmptyState } from "@/components/ui/card";
import { NEW_ACCOUNT_USAGE_NOTE } from "@/lib/constants";

export function NoUsageNote({ title }: { title: string }) {
  return <EmptyState title={title} body={NEW_ACCOUNT_USAGE_NOTE} />;
}
