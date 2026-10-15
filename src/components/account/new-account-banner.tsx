import { ShareButton } from "./share-button";

/** Shown once after an account is built from deal notes. */
export function NewAccountBanner({ name, token }: { name: string; token: string }) {
  return (
    <section
      role="status"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ok/25 bg-ok-soft px-5 py-4"
    >
      <div>
        <p className="font-semibold">Done. Here&apos;s their plan.</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          Claude built {name}&apos;s plan, setup guide, and champion kit. Their private onboarding app is live.
        </p>
      </div>
      <ShareButton token={token} />
    </section>
  );
}
