import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getBook } from "@/db/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badges";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { DocLinkList } from "@/components/customer/doc-link-list";
import { AccountChips, LibraryHeader } from "@/components/library/library-header";
import { GUIDE_LEVELS, GUIDE_TOPICS } from "@/lib/guide-topics";
import { GUIDE_DOCS, docLinks } from "@/lib/resources";

export const metadata: Metadata = { title: "Guides" };

export default function LibraryGuidesPage() {
  return (
    <div className="space-y-6">
      <LibraryHeader
        active="/library/guides"
        description="Every guide in the customer portal, by level and role, with the official GitHub docs behind it. You can see which accounts each one was picked for."
      />
      <Suspense fallback={<TabSkeleton />}>
        <Guides />
      </Suspense>
    </div>
  );
}

async function Guides() {
  await connection();
  const book = await getBook();
  const pickedBy = (topic: string) =>
    book.filter((d) => d.profile.guides.some((g) => g.topic === topic)).map((d) => ({ slug: d.account.slug, name: d.account.name }));

  return (
    <div className="space-y-8">
      {GUIDE_LEVELS.map((level) => (
        <section key={level.id}>
          <h2 className="mb-3 text-title font-semibold">{level.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {GUIDE_TOPICS.filter((t) => t.level === level.id).map((t) => {
              const accounts = pickedBy(t.id);
              return (
                <Card key={t.id}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{t.title}</h3>
                    {accounts.length > 0 && <Badge tone="accent">Picked for {accounts.length}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{t.summary}</p>
                  <DocLinkList links={docLinks(GUIDE_DOCS[t.id])} />
                  <AccountChips accounts={accounts} />
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
