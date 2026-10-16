import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getBook } from "@/db/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badges";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { DocLinkList } from "@/components/customer/doc-link-list";
import { AccountChips, LibraryHeader } from "@/components/library/library-header";
import { STAGE_LABELS } from "@/lib/constants";
import { VIDEO_GROUPS, docLinks } from "@/lib/resources";

export const metadata: Metadata = { title: "Videos" };

function monthYear(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function LibraryVideosPage() {
  return (
    <div className="space-y-6">
      <LibraryHeader
        active="/library/videos"
        description="The short, official GitHub videos in every customer portal, grouped by topic. Each group shows the stages it's suggested for in the portal's Send to my devs message."
      />
      <Suspense fallback={<TabSkeleton />}>
        <Videos />
      </Suspense>
    </div>
  );
}

async function Videos() {
  await connection();
  const book = await getBook();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {VIDEO_GROUPS.map((g) => {
        const accounts = book
          .filter((d) => g.stages.includes(d.account.stage))
          .map((d) => ({ slug: d.account.slug, name: d.account.name }));
        return (
          <Card key={g.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-semibold">{g.title}</h2>
              <div className="flex flex-wrap gap-1">
                {g.stages.map((s) => (
                  <Badge key={s}>{STAGE_LABELS[s]}</Badge>
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{g.description}</p>
            <ul className="mt-4 space-y-3">
              {g.videos.map((v) => (
                <li key={v.url}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:text-accent-hover">
                    {v.title}
                    <span className="mt-0.5 block text-xs font-normal text-ink-faint">
                      GitHub on YouTube · {v.minutes < 1 ? "under a minute" : `${v.minutes} min`} · {monthYear(v.published)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <DocLinkList links={docLinks(g.articles)} heading="Docs to read alongside" />
            {accounts.length > 0 && <p className="mt-4 text-xs font-medium text-ink-faint">Suggested now for</p>}
            <AccountChips accounts={accounts} />
          </Card>
        );
      })}
    </div>
  );
}
