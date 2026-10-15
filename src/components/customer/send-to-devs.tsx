"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DraftEditor } from "@/components/ui/draft-editor";
import type { Video } from "@/lib/resources";

type Group = { title: string; videos: Video[] };

function buildMessage(company: string, groups: Group[], format: "email" | "slack"): string {
  const list = groups
    .map((g) => {
      const lines = g.videos.map((v) => `- ${v.title}${v.minutes ? ` (${v.minutes} min)` : ""}: ${v.url}`);
      return format === "slack" ? `*${g.title}*\n${lines.join("\n")}` : `${g.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");

  if (format === "slack") {
    return `:wave: Copilot is live for us at ${company}! Here are a few short videos to get the most out of it this week:\n\n${list}\n\nQuestions? Drop them in this channel.`;
  }
  return `Subject: A few short Copilot videos for this week

Hi team,

Copilot is live for us at ${company}. Here are a few short official videos that cover what matters most right now:

${list}

Pick one or two and try what you learn on today's work. Reply with questions anytime.

Thanks!`;
}

/** Drafts a ready-to-send email or Slack message with the right videos for this stage. */
export function SendToDevs({ company, groups }: { company: string; groups: Group[] }) {
  const [format, setFormat] = useState<"email" | "slack" | null>(null);
  const withVideos = groups.filter((g) => g.videos.length > 0);
  const disabled = withVideos.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled={disabled} onClick={() => setFormat("email")}>
          Send to my devs: email
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => setFormat("slack")}>
          Send to my devs: Slack
        </Button>
        {disabled && <span className="text-sm text-ink-faint">Available once videos are added.</span>}
      </div>
      {format && (
        <DraftEditor
          key={format}
          initial={buildMessage(company, withVideos, format)}
          label={`Message for developers (${format})`}
          rows={14}
        />
      )}
    </div>
  );
}
