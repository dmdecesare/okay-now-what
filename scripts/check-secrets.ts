// Run before making the repo public, and any time after.
// Scans every tracked file AND every commit in history for secrets and private info,
// and checks that files which should never be tracked never were.
//
//   npm run check:secrets
import { execSync } from "node:child_process";

const git = (args: string) => execSync(`git ${args}`, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const PATTERNS: [string, RegExp][] = [
  ["Anthropic API key", /sk-ant-[A-Za-z0-9_-]{10,}/],
  ["Database URL with a password", /postgres(?:ql)?:\/\/[^\s:@/]+:[^\s@/]+@/],
  ["Neon password", /\bnpg_[A-Za-z0-9]{8,}/],
  ["JWT or OIDC token", /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\./],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}/],
  ["Vercel token", /\bvercel_[A-Za-z0-9]{20,}/i],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["Personal email", /derek\.decesare@me\.com/i],
];

const FORBIDDEN_PATHS: [string, RegExp][] = [
  ["env file", /(^|\/)\.env(?!\.example$)/],
  ["Vercel project link", /(^|\/)\.vercel\//],
  ["Claude settings", /(^|\/)\.claude\//],
  ["local database", /(^|\/)\.data\//],
  ["agent skill files", /(^|\/)\.agents\//],
];

const findings: string[] = [];

// 1. Every path that has ever been in any commit.
const everPaths = new Set(git("log --all --pretty=format: --name-only").split("\n").filter(Boolean));
for (const path of everPaths) {
  for (const [label, re] of FORBIDDEN_PATHS) {
    if (re.test(path)) findings.push(`${label} was committed at some point: ${path}`);
  }
}

// 2. Current tracked files and full history (every added or removed line).
const sources: [string, string][] = [
  ["current files", git("grep -I -n -e . -- . ':!package-lock.json'").toString()],
  ["git history", git("log --all -p --no-color -- . ':!package-lock.json'")],
];
for (const [where, text] of sources) {
  for (const [label, re] of PATTERNS) {
    const match = text.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"));
    if (match) findings.push(`${label} found in ${where} (${match.length} match${match.length === 1 ? "" : "es"})`);
  }
}

// 3. Commit author emails should be the GitHub noreply address.
const emails = new Set(git("log --all --format=%ae").split("\n").filter(Boolean));
for (const e of emails) {
  if (!e.endsWith("@users.noreply.github.com")) findings.push(`commit author email is not a noreply address: ${e}`);
}

const commits = git("rev-list --all --count").trim();
if (findings.length > 0) {
  console.error("Secrets check FAILED:");
  for (const f of findings) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `Secrets check passed: ${everPaths.size} paths and ${commits} commits scanned, no secrets, no private files, noreply author email only.`,
);
