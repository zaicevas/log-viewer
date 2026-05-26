import { describe, expect, it } from "vitest";
import { severityToLevel } from "./severity";

describe("severityToLevel", () => {
  it("maps 0 to UNSPECIFIED", () => {
    expect(severityToLevel(0)).toBe("UNSPECIFIED");
  });

  it.each([
    [1, "TRACE"],
    [4, "TRACE"],
    [5, "DEBUG"],
    [8, "DEBUG"],
    [9, "INFO"],
    [12, "INFO"],
    [13, "WARN"],
    [16, "WARN"],
    [17, "ERROR"],
    [20, "ERROR"],
    [21, "FATAL"],
    [24, "FATAL"],
  ] as const)("maps %d to %s", (n, level) => {
    expect(severityToLevel(n)).toBe(level);
  });

  it("falls back to UNSPECIFIED for numbers outside 0-24", () => {
    expect(severityToLevel(-1)).toBe("UNSPECIFIED");
    expect(severityToLevel(25)).toBe("UNSPECIFIED");
    expect(severityToLevel(99)).toBe("UNSPECIFIED");
  });

  it("doesn't accidentally bleed across band boundaries", () => {
    // 4 and 5 belong to different bands; verifies the band edges.
    expect(severityToLevel(4)).toBe("TRACE");
    expect(severityToLevel(5)).toBe("DEBUG");
    expect(severityToLevel(12)).toBe("INFO");
    expect(severityToLevel(13)).toBe("WARN");
    expect(severityToLevel(20)).toBe("ERROR");
    expect(severityToLevel(21)).toBe("FATAL");
  });
});
