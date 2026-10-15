// Spec rule 2: every video and doc link must be official and must load.
// Checks every URL in src/lib/resources.ts, one at a time so we don't trip rate limits:
//   - docs: HTTP 200, still on an allowed host after redirects, page title matches
//   - videos: YouTube oEmbed says the video exists, is on the official "GitHub" channel,
//     and has the title we show
//
//   npm run check:links
import { ALLOWED_HOSTS, allResources } from "@/lib/resources";

const DELAY_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPolitely(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "okay-now-what link checker" }, redirect: "follow" });
    if (res.status !== 429 || attempt === 4) return res;
    const wait = Number(res.headers.get("retry-after")) * 1000 || 20_000 * attempt;
    console.log(`  rate limited, waiting ${Math.round(wait / 1000)}s...`);
    await sleep(wait);
  }
}

const decode = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

async function checkDoc(title: string, url: string): Promise<string | null> {
  const res = await fetchPolitely(url);
  if (res.status !== 200) return `HTTP ${res.status}`;
  const host = new URL(res.url).host;
  if (!(ALLOWED_HOSTS as readonly string[]).includes(host)) return `redirected off allowed hosts to ${res.url}`;
  const html = await res.text();
  const pageTitle = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "");
  if (!pageTitle.startsWith(title)) return `title mismatch, page says "${pageTitle}"`;
  if (res.url.replace(/#.*$/, "") !== url) return `redirects to ${res.url} (update the stored URL)`;
  return null;
}

async function checkVideo(title: string, url: string): Promise<string | null> {
  const res = await fetchPolitely(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (res.status !== 200) return `oEmbed HTTP ${res.status} (video missing or private)`;
  const data = (await res.json()) as { author_name?: string; title?: string };
  if (data.author_name !== "GitHub") return `not on GitHub's official channel (author: ${data.author_name})`;
  if (decode(data.title ?? "") !== title) return `title mismatch, YouTube says "${data.title}"`;
  return null;
}

async function main() {
  const resources = allResources();
  console.log(`Checking ${resources.length} links (${ALLOWED_HOSTS.join(", ")})...`);
  const failures: string[] = [];

  for (const r of resources) {
    let problem: string | null;
    try {
      problem = r.kind === "doc" ? await checkDoc(r.title, r.url) : await checkVideo(r.title, r.url);
    } catch (err) {
      problem = `request failed: ${err instanceof Error ? err.message : err}`;
    }
    console.log(`${problem ? "FAIL" : "ok  "}  ${r.kind.padEnd(5)} ${r.title}${problem ? `\n        ${problem}\n        ${r.url}` : ""}`);
    if (problem) failures.push(r.url);
    await sleep(DELAY_MS);
  }

  const docs = resources.filter((r) => r.kind === "doc").length;
  if (failures.length > 0) throw new Error(`${failures.length} of ${resources.length} links failed.`);
  console.log(`All ${resources.length} links verified: ${docs} docs, ${resources.length - docs} official GitHub videos.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
