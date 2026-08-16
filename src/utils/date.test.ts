import { describe, expect, it } from "vitest";
import { dateIsInMonth, lastNMonthKeys, monthKey, rangeCoversMonth, shiftMonthKey } from "./date";

describe("monthKey", () => {
  it("formats a date as YYYY-MM", () => {
    expect(monthKey(new Date(2026, 2, 15))).toBe("2026-03");
  });
});

describe("shiftMonthKey", () => {
  it("moves forward across a year boundary", () => {
    expect(shiftMonthKey("2025-12", 1)).toBe("2026-01");
  });

  it("moves backward across a year boundary", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
  });
});

describe("lastNMonthKeys", () => {
  it("returns n keys ending at the reference month, oldest first", () => {
    expect(lastNMonthKeys(new Date(2026, 2, 1), 3)).toEqual(["2026-01", "2026-02", "2026-03"]);
  });
});

describe("rangeCoversMonth", () => {
  it("is true when the month falls inside an open-ended range", () => {
    expect(rangeCoversMonth("2026-01-01", null, "2026-06")).toBe(true);
  });

  it("is false before the start date's month", () => {
    expect(rangeCoversMonth("2026-06-01", null, "2026-05")).toBe(false);
  });

  it("is false after the end date's month", () => {
    expect(rangeCoversMonth("2026-01-01", "2026-03-15", "2026-04")).toBe(false);
  });

  it("is true for the exact month the range ends in", () => {
    expect(rangeCoversMonth("2026-01-01", "2026-03-15", "2026-03")).toBe(true);
  });
});

describe("dateIsInMonth", () => {
  it("is true for a date within the month", () => {
    expect(dateIsInMonth("2026-03-15", "2026-03")).toBe(true);
  });

  it("is false for a date in a different month", () => {
    expect(dateIsInMonth("2026-04-01", "2026-03")).toBe(false);
  });
});
