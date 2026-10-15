// Prints each account's health and the signals behind it, and checks the demo story holds:
// Harborline and Copperleaf on track, Bluestone at risk.
import { listAccountSummaries } from "@/db/queries";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/health";

const EXPECTED: Record<string, HealthStatus> = {
  "harborline-payments": "on_track",
  "copperleaf-lending": "on_track",
  "bluestone-assurance": "at_risk",
};

async function main() {
  const summaries = await listAccountSummaries();
  let ok = true;

  for (const a of summaries) {
    const expected = EXPECTED[a.slug];
    const pass = !expected || expected === a.health.status;
    ok &&= pass;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${a.name.padEnd(22)} ${HEALTH_LABELS[a.health.status].padEnd(9)}` +
        `day ${a.stageDay}, ${a.activePct ?? "-"}% active, spend ${a.spendTrend}`,
    );
    for (const s of a.health.signals) console.log(`        - ${s.label}: ${s.detail}`);
  }

  if (!ok) throw new Error("Health check did not match the demo story.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
