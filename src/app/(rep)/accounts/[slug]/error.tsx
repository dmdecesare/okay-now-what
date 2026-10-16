"use client";

import { ErrorState } from "@/components/error-state";

export default function AccountError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorState
      title="This tab didn't load"
      body="Okay, now what? Try again. The rest of the account is still here."
      retry={retry}
    />
  );
}
