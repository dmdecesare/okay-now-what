export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatMonth(isoDate: string): string {
  return new Date(isoDate + "T00:00:00Z").toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00Z").toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
