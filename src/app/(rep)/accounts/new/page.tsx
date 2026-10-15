import type { Metadata } from "next";
import { NewAccountForm } from "@/components/new-account-form";

export const metadata: Metadata = { title: "Add account" };

export default function NewAccountPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-display font-semibold">Add account</h1>
        <p className="mt-1 text-ink-muted">
          Paste your deal notes. Claude builds the onboarding plan, setup guide, champion kit, and the customer&apos;s
          private app.
        </p>
      </div>
      <NewAccountForm />
    </div>
  );
}
