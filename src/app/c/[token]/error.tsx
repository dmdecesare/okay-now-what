"use client";

import { ErrorState } from "@/components/error-state";

export default function CustomerError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorState
      title="This page didn't load"
      body="Please try again in a moment. Your plan and progress are saved."
      retry={retry}
      homeHref={null}
    />
  );
}
