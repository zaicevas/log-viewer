import { describe, expect, it } from "vitest";
import { formatTimestamp, pluralize } from "./format";

describe("formatTimestamp", () => {
  it("formats the epoch as 01-01 00:00:00.000", () => {
    expect(formatTimestamp(0)).toBe("01-01 00:00:00.000");
  });

  it("zero-pads single-digit MM/DD/HH/mm/ss and pads ms < 100 to three digits", () => {
    expect(formatTimestamp(Date.UTC(2024, 0, 5, 3, 7, 9, 42))).toBe(
      "01-05 03:07:09.042",
    );
  });

  it("renders the year-end boundary without off-by-one in the month", () => {
    expect(formatTimestamp(Date.UTC(2024, 11, 31, 23, 59, 59, 999))).toBe(
      "12-31 23:59:59.999",
    );
  });

  it("renders Feb 29 on a leap year", () => {
    expect(formatTimestamp(Date.UTC(2024, 1, 29, 12, 0, 0, 0))).toBe(
      "02-29 12:00:00.000",
    );
  });

  it("pads single-digit milliseconds to three digits", () => {
    expect(formatTimestamp(Date.UTC(2024, 6, 4, 0, 0, 0, 7))).toBe(
      "07-04 00:00:00.007",
    );
  });
});

describe("pluralize", () => {
  it("uses the singular form for exactly 1", () => {
    expect(pluralize(1, "log")).toBe("1 log");
  });

  it("uses the plural form (default +s) for 0 and n > 1", () => {
    expect(pluralize(0, "log")).toBe("0 logs");
    expect(pluralize(5, "log")).toBe("5 logs");
    expect(pluralize(446, "log")).toBe("446 logs");
  });

  it("accepts an explicit plural for irregular nouns", () => {
    expect(pluralize(1, "entry", "entries")).toBe("1 entry");
    expect(pluralize(3, "entry", "entries")).toBe("3 entries");
  });
});
