// Writes src/lib/build-stats.json for the Behind the build page: lines of code, files,
// commits, and an estimate of active build time from commit timestamps.
//
//   npm run stats
import { execSync } from "node:child_process";
import fs from "node:fs";

const git = (args: string) => execSync(`git ${args}`, { encoding: "utf8" }).trim();

const files = git("ls-files src scripts").split("\n").filter((f) => /\.(ts|tsx|css)$/.test(f));
const linesOfCode = files.reduce((sum, f) => sum + fs.readFileSync(f, "utf8").split("\n").length, 0);

// Commit times, oldest first. Active time = gaps of 90 minutes or less between commits,
// plus 30 minutes of lead-in for the first commit of each working stretch.
const times = git("log --reverse --format=%at").split("\n").map((t) => Number(t) * 1000);
let activeMs = 0;
times.forEach((t, i) => {
  const gap = i === 0 ? Infinity : t - times[i - 1];
  activeMs += gap <= 90 * 60 * 1000 ? gap : 30 * 60 * 1000;
});
const days = new Set(times.map((t) => new Date(t).toISOString().slice(0, 10)));

const stats = {
  generatedAt: new Date().toISOString().slice(0, 10),
  linesOfCode,
  sourceFiles: files.length,
  commits: times.length,
  activeHours: Math.round((activeMs / 3_600_000) * 2) / 2,
  calendarDays: days.size,
  firstCommit: new Date(times[0]).toISOString(),
  lastCommit: new Date(times.at(-1)!).toISOString(),
};

fs.writeFileSync("src/lib/build-stats.json", JSON.stringify(stats, null, 2) + "\n");
console.log(stats);
