import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badges";
import { TabSkeleton } from "@/components/account/tab-skeleton";
import { GUIDE_LEVELS, GUIDE_TOPIC_BY_ID, GUIDE_TOPICS, type GuideTopicId } from "@/lib/guide-topics";
import { GUIDE_LINKS } from "@/lib/resources";
import { loadCustomer } from "../data";

export default function GuidesPage({ params }: PageProps<"/c/[token]/guides">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Guides params={params} />
    </Suspense>
  );
}

function DocLinks({ topic }: { topic: GuideTopicId }) {
  const links = GUIDE_LINKS[topic] ?? [];
  if (links.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1">
      {links.map((l) => (
        <li key={l.url}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            {l.title} <span aria-hidden>&rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

async function Guides({ params }: { params: PageProps<"/c/[token]/guides">["params"] }) {
  const c = await loadCustomer(params);
  const picked = new Map(c.profile.guides.map((g) => [g.topic, g.why]));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-title font-semibold">Picked for {c.name}</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">Start here. Each one is chosen for what your team told us.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {c.profile.guides.map((g) => {
            const topic = GUIDE_TOPIC_BY_ID[g.topic];
            return (
              <Card key={g.topic} className="border-accent/30">
                <div className="flex items-center gap-2">
                  <Badge tone="accent">{topic.level === "role" ? "Role track" : topic.level}</Badge>
                  <h3 className="font-semibold">{topic.title}</h3>
                </div>
                <p className="mt-2 text-sm">{g.why}</p>
                <DocLinks topic={g.topic} />
              </Card>
            );
          })}
        </div>
      </section>

      {GUIDE_LEVELS.map((level) => (
        <section key={level.id}>
          <h2 className="mb-3 font-semibold">{level.title}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {GUIDE_TOPICS.filter((t) => t.level === level.id).map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{t.title}</h3>
                  {picked.has(t.id) && <Badge tone="accent">Picked for you</Badge>}
                </div>
                <p className="mt-1 text-sm text-ink-muted">{t.summary}</p>
                <DocLinks topic={t.id} />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
