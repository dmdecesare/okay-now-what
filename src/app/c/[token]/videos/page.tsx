import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { SendToDevs } from "@/components/customer/send-to-devs";
import { VIDEO_GROUPS } from "@/lib/resources";
import { loadCustomer } from "../data";

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
      <Card>
        <h2 className="font-semibold">Share videos with your developers</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          We&apos;ll draft a ready-to-send message with the right videos for where you are right now.
        </p>
        <SendToDevs company={c.name} groups={forStage.map((g) => ({ title: g.title, videos: g.videos }))} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {VIDEO_GROUPS.map((g) => (
          <Card key={g.id}>
            <h2 className="font-semibold">{g.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{g.description}</p>
            {g.videos.length > 0 ? (
              <ul className="mt-4 space-y-2">
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
                        {v.minutes ? <span className="font-normal text-ink-faint"> · {v.minutes} min</span> : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm text-ink-faint">
                We&apos;re picking the best official videos for this topic.
              </p>
            )}
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
