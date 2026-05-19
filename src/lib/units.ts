// Conversor MB ↔ KB. La fuente de verdad interna siempre es KB.

export type Unit = "KB" | "MB";

export function toDisplay(kb: number, unit: Unit): string {
  if (unit === "KB") return `${kb.toLocaleString()} KB`;
  const mb = kb / 1024;
  return mb >= 1
    ? `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
    : `${kb} KB`;
}

export function parseKB(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const m = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)\s*(kb|mb|k|m)?$/);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2] ?? "kb";
  if (unit === "mb" || unit === "m") return Math.round(value * 1024);
  return Math.round(value);
}
