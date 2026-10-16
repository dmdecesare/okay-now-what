import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge needs to know our custom theme keys. Without this, it reads `text-title` as a
// text color and silently drops it when a color class like `text-ink` comes after it.
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "title", "kpi", "micro"] }],
      shadow: [{ shadow: ["card", "popover", "panel"] }],
    },
  },
});

/** Joins class names, skipping falsy values. Later classes win over earlier conflicting ones. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return merge(...parts);
}
