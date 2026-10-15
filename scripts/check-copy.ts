// Copy rule from SPEC section 3: no em dashes in the UI. Scans src/ and fails if any are found.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");
const EM_DASH = "—";
const hits: string[] = [];

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|css|md)$/.test(entry.name)) {
      fs.readFileSync(full, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (line.includes(EM_DASH)) hits.push(`${path.relative(process.cwd(), full)}:${i + 1}`);
        });
    }
  }
}

walk(ROOT);

if (hits.length > 0) {
  console.error(`Found ${hits.length} em dash(es). Rewrite these lines:`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log("Copy check passed: no em dashes in src/.");
