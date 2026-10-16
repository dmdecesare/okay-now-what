"use client";

import { ErrorState } from "@/components/error-state";

export default function RootError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex flex-1 items-center px-4 py-16">
      <ErrorState retry={retry} homeLabel="Go to the home page" />
    </main>
  );
}
