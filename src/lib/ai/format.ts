import { DOC_CATALOG, type DocKey } from "@/lib/resources";

// Clean-up applied to everything Claude writes before it's shown or saved.

const URL_TO_KEY = new Map(Object.entries(DOC_CATALOG).map(([k, d]) => [d.url, k as DocKey]));

/** UI copy rule: no em dashes. */
export function noEmDash(text: string): string {
  return text.replace(/\s*\u2014\s*/g, ", ");
}

/** Recursively removes em dashes from every string in generated JSON. */
export function cleanStrings<T>(value: T): T {
  if (typeof value === "string") return noEmDash(value) as T;
  if (Array.isArray(value)) return value.map(cleanStrings) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanStrings(v)])) as T;
  }
  return value;
}

/** Normalizes a URL for catalog lookup (drops trailing slashes and #anchors). */
function catalogKey(url: string): DocKey | undefined {
  const clean = url.replace(/#.*$/, "").replace(/\/$/, "");
  return URL_TO_KEY.get(clean);
}

/**
 * Keeps markdown links only when they point at the verified catalog; any other link is
 * reduced to its text. Returns the cleaned text and the catalog keys it cites.
 */
export function keepCatalogLinks(markdown: string): { text: string; sources: DocKey[] } {
  const sources = new Set<DocKey>();
  const text = markdown.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, label: string, url: string) => {
    const key = catalogKey(url);
    if (!key) return label;
    sources.add(key);
    return `[${label}](${DOC_CATALOG[key].url})`;
  });
  // Bare URLs that aren't in the catalog get removed too.
  const cleaned = text.replace(/(^|[\s(])(https?:\/\/[^\s)]+)/g, (m, pre: string, url: string) => {
    const key = catalogKey(url);
    if (key) {
      sources.add(key);
      return m;
    }
    return pre;
  });
  return { text: noEmDash(cleaned), sources: [...sources] };
}

/** True for URLs we're willing to render as links in the browser. */
export function isCatalogUrl(url: string): boolean {
  return catalogKey(url) !== undefined;
}

export function sourcesIn(markdown: string): DocKey[] {
  return keepCatalogLinks(markdown).sources;
}
