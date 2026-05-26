export type ChartDatum = {
  label: string;
  count: number;
  binStart: number;
  binEnd: number;
};

export function isChartDatum(value: unknown): value is ChartDatum {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.label === "string" &&
    typeof record.count === "number" &&
    typeof record.binStart === "number" &&
    typeof record.binEnd === "number"
  );
}
