// Spec rule 5: the customer view never shows internal data.
// Fetches every customer tab for every account from a running app and fails if the
// HTML (including data sent to the browser) contains rep-only content.
//
//   npm run check:leaks                         # local dev server
//   npm run check:leaks -- https://your-app.vercel.app
import { SEED_ACCOUNTS } from "@/db/seed";
import { CUSTOMER_PAGES } from "@/lib/customer-routes";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const CUSTOMER_TABS = CUSTOMER_PAGES;

/** Lowercase letters and digits only, so HTML escaping and JSON quoting can't hide a match. */
const norm = (s: string) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\\"/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

// Rep-only text from the seed data: deal notes, quotes, rep notes, our plan for concerns, AI insights.
const secretTexts = SEED_ACCOUNTS.flatMap((a) => [
  a.dealNotes,
  ...a.profile.goals.map((g) => g.inTheirWords),
  a.profile.champion.notes,
  ...a.profile.stakeholders.map((s) => s.notes),
  ...a.profile.concerns.map((c) => c.response),
  ...collectStrings(a.insights),
  ...collectStrings(a.calls ?? []),
  ...a.questions.map((q) => q.question),
]);
const secretMarkers = [...new Set(secretTexts.map((t) => norm(t).slice(0, 60)).filter((t) => t.length >= 25))];

const LITERAL_MARKERS: [string, RegExp][] = [
  ["health status", /\bAt risk\b/],
  ["at-risk panel", /Needs attention/],
  ["AI insight label", /Claude's take|Recovery play|Next best action/],
  ["dollar amount", /\$\d/],
];

async function get(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

async function main() {
  const home = await get(BASE + "/");
  const slugs = [...new Set([...home.matchAll(/href="\/accounts\/([a-z0-9-]+)"/g)].map((m) => m[1]))].filter(
    (s) => s !== "new",
  );
  if (slugs.length === 0) throw new Error("No accounts found on the home page.");

  let failures = 0;
  let pages = 0;
  for (const slug of slugs) {
    const repPage = await get(`${BASE}/accounts/${slug}`);
    const token = repPage.match(/\/c\/([A-Za-z0-9_-]{32,64})/)?.[1];
    if (!token) throw new Error(`No customer link found for ${slug}.`);

    // Accounts built live aren't in the seed, so also treat this account's own deal
    // notes (shown on the rep Overview) as rep-only text.
    const repVisible = repPage.replace(/<script[\s\S]*?<\/script>/g, "");
    const notes =
      repVisible.match(/<p[^>]*data-deal-notes[^>]*>([\s\S]*?)<\/p>/)?.[1] ??
      repVisible.match(/<p class="whitespace-pre-wrap[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] ??
      "";
    if (!notes) throw new Error(`Couldn't find the deal notes for ${slug} on the rep page.`);
    const accountMarkers = notes
      .split(/[.\n]/)
      .map((sentence) => norm(sentence).slice(0, 60))
      .filter((m) => m.length >= 25);

    for (const tab of CUSTOMER_TABS) {
      const url = `${BASE}/c/${token}${tab}`;
      const html = await get(url);
      const flat = norm(html);
      // Literal markers run on visible markup only: React's data payload in <script> tags
      // uses "$1"-style references that would look like dollar amounts. Rep-only text is
      // still checked against everything, payload included.
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
      pages++;
      const hits = [
        ...LITERAL_MARKERS.filter(([, re]) => re.test(visible)).map(([label]) => label),
        ...[...secretMarkers, ...accountMarkers].filter((m) => flat.includes(m)).map((m) => `rep-only text "${m.slice(0, 30)}..."`),
      ];
      if (hits.length > 0) {
        failures++;
        console.error(`FAIL  ${slug}${tab || "/"}: ${hits.join("; ")}`);
      }
    }
    console.log(`checked ${slug}: ${CUSTOMER_TABS.length} customer tabs`);
  }

  if (failures > 0) throw new Error(`${failures} customer page(s) contain internal data.`);
  console.log(`Leak check passed: ${pages} customer pages, no internal data.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
