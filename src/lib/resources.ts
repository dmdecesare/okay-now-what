import type { GuideTopicId } from "./guide-topics";
import type { Stage } from "./schemas";

// Curated official resources. Phase 4 fills these lists, and every URL is checked
// before it's added. Only official GitHub sources are allowed (SPEC rule 2).

export type DocLink = { title: string; url: string };
export type Video = { title: string; url: string; minutes?: number };

export const VIDEO_GROUPS: {
  id: string;
  title: string;
  description: string;
  /** Stages where this group goes in the "Send to my devs" message. */
  stages: Stage[];
  videos: Video[];
}[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Installing Copilot and your first suggestions.",
    stages: ["pilot", "onboarding", "rolling_out"],
    videos: [],
  },
  {
    id: "chat",
    title: "Copilot Chat",
    description: "Asking questions, explaining code, and fixing errors.",
    stages: ["pilot", "onboarding", "rolling_out"],
    videos: [],
  },
  {
    id: "agents",
    title: "Agent mode and the coding agent",
    description: "Multi-file changes in your editor, and handing issues to Copilot.",
    stages: ["pilot", "rolling_out"],
    videos: [],
  },
  {
    id: "code-review",
    title: "Code review",
    description: "Getting a first review on your pull requests.",
    stages: ["pilot", "rolling_out"],
    videos: [],
  },
  {
    id: "admin",
    title: "Admin setup",
    description: "Seats, policies, and settings for admins.",
    stages: ["pilot", "onboarding"],
    videos: [],
  },
];

export const GUIDE_LINKS: Partial<Record<GuideTopicId, DocLink[]>> = {};
