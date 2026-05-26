import type { NormalizedLog } from "@/features/logs/api/normalize";

// FIXME: hardcoded to 1h buckets. Works for the v2 endpoint's rolling 24h
// window (~24 bars). Make this adaptive (pick from a nice-interval ladder
// of 1s/5s/30s/1m/5m/15m/1h/6h/1d based on data span) when other time
// ranges become supported.
const BUCKET_WIDTH_MS = 60 * 60 * 1000;

export type TimeBucket = {
  binStart: number;
  binEnd: number;
  count: number;
};

/**
 * Split logs into 1-hour buckets snapped to clock-hour boundaries. The first
 * bucket starts at `floor(min / 1h) * 1h`; the last bucket ends at the hour
 * after `max`. Empty input → empty output.
 */
export function bucket(logs: ReadonlyArray<NormalizedLog>): TimeBucket[] {
  if (logs.length === 0) return [];

  let min = Infinity;
  let max = -Infinity;
  for (const log of logs) {
    if (log.timeMs < min) min = log.timeMs;
    if (log.timeMs > max) max = log.timeMs;
  }

  const start = Math.floor(min / BUCKET_WIDTH_MS) * BUCKET_WIDTH_MS;
  const end = (Math.floor(max / BUCKET_WIDTH_MS) + 1) * BUCKET_WIDTH_MS;
  const bucketCount = (end - start) / BUCKET_WIDTH_MS;

  const buckets: TimeBucket[] = Array.from(
    { length: bucketCount },
    (_, bucketIdx) => ({
      binStart: start + bucketIdx * BUCKET_WIDTH_MS,
      binEnd: start + (bucketIdx + 1) * BUCKET_WIDTH_MS,
      count: 0,
    }),
  );

  for (const log of logs) {
    const bucketIdx = Math.floor((log.timeMs - start) / BUCKET_WIDTH_MS);
    const bucket = buckets[bucketIdx];
    if (bucket) bucket.count++;
  }

  return buckets;
}
