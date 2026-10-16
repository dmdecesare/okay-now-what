// Prints each account's health and growth signals, and checks the demo story holds:
// Harborline on track and expansion ready, Copperleaf on track with no growth signal yet,
// Bluestone at risk but with a growth signal (its strongest teams).
import { listAccountSummaries } from "@/db/queries";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/health";
import { EXPANSION_LABELS, type ExpansionLevel } from "@/lib/expansion";

const EXPECTED: Record<string, HealthStatus> = {
  "harborline-payments": "on_track",
  "copperleaf-lending": "on_track",
  "bluestone-assurance": "at_risk",
};

const EXPECTED_GROWTH: Record<string, ExpansionLevel> = {
  "harborline-payments": "strong",
  "copperleaf-lending": "none",
  "bluestone-assurance": "emerging",
};

async function main() {
  const summaries = await listAccountSummaries();
  let ok = true;

  for (const a of summaries) {
    const expected = EXPECTED[a.slug];
    const expectedGrowth = EXPECTED_GROWTH[a.slug];
    const pass =
      (!expected || expected === a.health.status) && (!expectedGrowth || expectedGrowth === a.expansion.level);
    ok &&= pass;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${a.name.padEnd(22)} ${HEALTH_LABELS[a.health.status].padEnd(9)}` +
        `${EXPANSION_LABELS[a.expansion.level].padEnd(16)}day ${a.stageDay}, ${a.activePct ?? "-"}% active, spend ${a.spendTrend}`,
    );
    for (const s of a.health.signals) console.log(`        - risk: ${s.label}: ${s.detail}`);
    for (const s of a.expansion.signals) console.log(`        + growth: ${s.label}: ${s.detail}`);
  }

  if (!ok) throw new Error("Health or growth check did not match the demo story.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
