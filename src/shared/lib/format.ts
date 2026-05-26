/**
 * Compact UTC timestamp: `MM-DD HH:mm:ss.SSS`.
 * UTC chosen so server-rendered and client-rendered output match (no
 * hydration mismatch across timezones).
 */
export function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
  const DD = String(date.getUTCDate()).padStart(2, "0");
  const HH = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const SSS = String(date.getUTCMilliseconds()).padStart(3, "0");

  return `${MM}-${DD} ${HH}:${mm}:${ss}.${SSS}`;
}

/** UTC `HH:mm`. */
export function formatHourMinute(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

/** UTC `MM-DD`. */
export function formatMonthDay(date: Date): string {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Returns a ms-to-label formatter. When `spansMultipleDays`, labels include
 * the date (`MM-DD HH:mm`); otherwise just `HH:mm`.
 */
export function makeFormatTime(
  spansMultipleDays: boolean,
): (ms: number) => string {
  return (ms: number): string => {
    const date = new Date(ms);
    if (!spansMultipleDays) return formatHourMinute(date);
    return `${formatMonthDay(date)} ${formatHourMinute(date)}`;
  };
}

/**
 * UTC range label: `MM-DD HH:mm – MM-DD HH:mm`. Collapses to a single
 * `MM-DD HH:mm` when `startMs === endMs`.
 */
export function formatRange(startMs: number, endMs: number): string {
  if (startMs === endMs) {
    const date = new Date(startMs);
    return `${formatMonthDay(date)} ${formatHourMinute(date)}`;
  }

  const start = new Date(startMs);
  const end = new Date(endMs);

  return `${formatMonthDay(start)} ${formatHourMinute(start)} – ${formatMonthDay(end)} ${formatHourMinute(end)}`;
}

/**
 * `"3 logs"` / `"1 log"`. English-only; reach for `Intl.PluralRules` if a
 * second locale is added.
 */
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
