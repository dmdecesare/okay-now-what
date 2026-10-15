import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { getCustomer } from "./data";

// Phase 1: confirms the private link resolves. The full customer app (tabs) is Phase 3.
export default function CustomerHomePage({ params }: PageProps<"/c/[token]">) {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface" />}>
      <CustomerHome params={params} />
    </Suspense>
  );
}

async function CustomerHome({ params }: { params: PageProps<"/c/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  const customer = await getCustomer(token);
  if (!customer) notFound();

  const firstName = customer.profile.champion.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title font-semibold">Welcome{firstName ? `, ${firstName}` : ""}.</h2>
        <p className="mt-1 text-ink-muted">
          Everything your team needs to get going with Copilot, in one place. Here&apos;s what we&apos;re
          working toward together.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {customer.profile.goals.map((g) => (
          <Card key={g.goal} className="flex items-start gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
            <p className="font-medium">{g.goal}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
