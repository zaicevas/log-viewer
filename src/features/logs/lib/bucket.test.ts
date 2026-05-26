import { describe, expect, it } from "vitest";
import { bucket } from "./bucket";
import type { NormalizedLog } from "@/features/logs/api/normalize";

const HOUR_MS = 60 * 60 * 1000;

function fakeLog(ms: number, id = String(ms)): NormalizedLog {
  return {
    id,
    timeMs: ms,
    observedTimeMs: ms,
    severity: "INFO",
    severityNumber: 9,
    severityText: "INFO",
    bodyText: "",
    attributes: {},
    droppedAttributesCount: 0,
    resource: {
      namespace: undefined,
      name: undefined,
      version: undefined,
      attributes: {},
      droppedAttributesCount: 0,
    },
    scope: {
      name: "test",
      version: undefined,
      attributes: {},
      droppedAttributesCount: 0,
    },
  };
}

describe("bucket", () => {
  it("returns an empty array when input is empty", () => {
    expect(bucket([])).toEqual([]);
  });

  it("returns a single 1h bucket spanning the hour when all logs share a timestamp", () => {
    const t = Date.UTC(2026, 4, 23, 12, 34, 56);

    const out = bucket([fakeLog(t), fakeLog(t), fakeLog(t)]);

    expect(out).toEqual([
      {
        binStart: Date.UTC(2026, 4, 23, 12, 0, 0),
        binEnd: Date.UTC(2026, 4, 23, 13, 0, 0),
        count: 3,
      },
    ]);
  });

  it("snaps bucket boundaries to clock hours", () => {
    const start = Date.UTC(2026, 4, 23, 12, 17, 30);
    const end = Date.UTC(2026, 4, 23, 14, 42, 11);

    const out = bucket([fakeLog(start), fakeLog(end)]);

    expect(out).toHaveLength(3);
    for (const b of out) {
      expect(b.binStart % HOUR_MS).toBe(0);
      expect(b.binEnd - b.binStart).toBe(HOUR_MS);
    }
    expect(out[0]!.binStart).toBe(Date.UTC(2026, 4, 23, 12, 0, 0));
    expect(out[2]!.binEnd).toBe(Date.UTC(2026, 4, 23, 15, 0, 0));
  });

  it("places each log into the bucket for its hour", () => {
    const h12 = Date.UTC(2026, 4, 23, 12, 0, 0);
    const h13 = Date.UTC(2026, 4, 23, 13, 0, 0);
    const h14 = Date.UTC(2026, 4, 23, 14, 0, 0);
    const logs = [
      fakeLog(h12 + 5 * 60_000, "a"),
      fakeLog(h12 + 55 * 60_000, "b"),
      fakeLog(h13 + 30 * 60_000, "c"),
      fakeLog(h14 + 1, "d"),
    ];

    const out = bucket(logs);

    expect(out.map((b) => b.count)).toEqual([2, 1, 1]);
  });

  it("places a log exactly at an hour boundary into the bucket starting at that hour", () => {
    const t0 = Date.UTC(2026, 4, 23, 12, 30, 0);
    const t1 = Date.UTC(2026, 4, 23, 14, 0, 0);

    const out = bucket([fakeLog(t0, "a"), fakeLog(t1, "b")]);

    expect(out).toHaveLength(3);
    expect(out[0]!.count).toBe(1);
    expect(out[1]!.count).toBe(0);
    expect(out[2]!.binStart).toBe(t1);
    expect(out[2]!.count).toBe(1);
  });

  it("preserves total record count across buckets", () => {
    const base = Date.UTC(2026, 4, 23, 0, 0, 0);
    const span = 24 * HOUR_MS;
    const logs = Array.from({ length: 100 }, (_, i) =>
      fakeLog(base + Math.floor(Math.random() * span), `r-${i}`),
    );

    const out = bucket(logs);
    const total = out.reduce((acc, b) => acc + b.count, 0);

    expect(total).toBe(100);
  });
});
