// Made-up logos for the fictional demo companies. The three seeded accounts get hand-drawn marks
// (src/components/logos/marks.tsx). Accounts built from deal notes get a generated mark: initials on
// a color tile, picked from a hash of the name so it is the same on every page and every render.

export const SEED_LOGO_IDS = ["harborline", "copperleaf", "bluestone"] as const;
export type SeedLogoId = (typeof SEED_LOGO_IDS)[number];

const SEED_BY_SLUG: Record<string, SeedLogoId> = {
  "harborline-payments": "harborline",
  "copperleaf-lending": "copperleaf",
  "bluestone-assurance": "bluestone",
};

export function seedLogoId(slug: string | null | undefined): SeedLogoId | null {
  return (slug && SEED_BY_SLUG[slug]) || null;
}

/** Tile colors for generated marks. Each one keeps white initials at 4.5:1 contrast or better. */
const MARK_COLORS = ["#1d4ed8", "#6d28d9", "#be185d", "#b45309", "#047857", "#0e7490", "#4338ca", "#9f1239"];
export type MarkPattern = "plain" | "orbit" | "band";
const PATTERNS: MarkPattern[] = ["plain", "orbit", "band"];

const SKIP_WORDS = new Set(["the", "inc", "llc", "ltd", "co", "corp", "group", "and", "of", "&"]);

/** FNV-1a: a small, stable string hash. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function initials(name: string): string {
  const words = name
    .split(/[\s\-_/]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w && !SKIP_WORDS.has(w.toLowerCase()));
  const picked = words.length >= 2 ? [words[0], words[1]] : words.length === 1 ? [words[0].slice(0, 2)] : ["?"];
  return picked
    .map((w) => (picked.length === 1 ? w : w.charAt(0)))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function generatedMark(name: string): { color: string; pattern: MarkPattern; initials: string } {
  const h = hash(name.trim().toLowerCase());
  return {
    color: MARK_COLORS[h % MARK_COLORS.length],
    pattern: PATTERNS[(h >>> 8) % PATTERNS.length],
    initials: initials(name),
  };
}

const SEED_BRAND: Record<SeedLogoId, string> = {
  harborline: "#1c4f8c",
  copperleaf: "#b8612c",
  bluestone: "#3d5f93",
};

/** The company's main brand color, for tinted headers. */
export function brandColor(name: string, slug?: string | null, logoId?: SeedLogoId | null): string {
  const seed = logoId ?? seedLogoId(slug);
  return seed ? SEED_BRAND[seed] : generatedMark(name).color;
}
