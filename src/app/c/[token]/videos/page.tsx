import { Suspense } from "react";
import { PlayCircle } from "lucide-react";
import { PortalHeader } from "@/components/customer/portal-header";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SendToDevs } from "@/components/customer/send-to-devs";
import { DocLinkList } from "@/components/customer/doc-link-list";
import { VIDEO_GROUPS, docLinks } from "@/lib/resources";
import { loadCustomer } from "../data";

function monthYear(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function VideosPage({ params }: PageProps<"/c/[token]/videos">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Videos params={params} />
    </Suspense>
  );
}

async function Videos({ params }: { params: PageProps<"/c/[token]/videos">["params"] }) {
  const c = await loadCustomer(params);
  const forStage = VIDEO_GROUPS.filter((g) => g.stages.includes(c.stage));

  return (
    <div className="space-y-6">
      <PortalHeader
        icon={<PlayCircle />}
        title="Videos"
        description="Short, official videos from GitHub, grouped by topic. Share the right ones with your developers in one click."
      />
      <Card>
        <h2 className="font-semibold">Share videos with your developers</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          We&apos;ll draft a ready-to-send message with the right videos for where you are right now.
        </p>
        <SendToDevs company={c.name} groups={forStage.map((g) => ({ title: g.title, videos: g.videos }))} />
      </Card>

      <p className="text-sm text-ink-muted">
        Short, official videos from GitHub&apos;s YouTube channel. Copilot changes quickly, so if something on screen
        looks different, the linked docs have the latest steps.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {VIDEO_GROUPS.map((g) => (
          <Card key={g.id}>
            <h2 className="font-semibold">{g.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{g.description}</p>
            <ul className="mt-4 space-y-3">
              {g.videos.map((v) => (
                <li key={v.url}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    <PlayIcon />
                    <span>
                      {v.title}
                      <span className="mt-0.5 block text-xs font-normal text-ink-faint">
                        GitHub on YouTube · {v.minutes < 1 ? "under a minute" : `${v.minutes} min`} ·{" "}
                        {monthYear(v.published)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <DocLinkList links={docLinks(g.articles)} heading="Prefer to read?" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
      <path d="M6.5 5.2v5.6L11 8 6.5 5.2Z" fill="currentColor" />
    </svg>
  );
}
