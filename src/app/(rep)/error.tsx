"use client";

import { ErrorState } from "@/components/error-state";

export default function RepError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState retry={retry} />;
}
