/**
 * Unit tests for NumericInput utilities.
 * Run with: npx vitest or npx jest
 */

import { describe, it, expect } from "vitest";
import { formatNumber, stripFormatting, remapCursor, parseNumber } from "../utils/format";

/* ─── formatNumber ─────────────────────────────────────────────────────────── */

describe("formatNumber", () => {
  it("returns empty string for empty input", () => {
    expect(formatNumber("")).toBe("");
  });

  it("formats 4-digit number", () => {
    expect(formatNumber("1442")).toBe("1\u202F442");
  });

  it("formats 7-digit number", () => {
    expect(formatNumber("1000000")).toBe("1\u202F000\u202F000");
  });

  it("formats 3-digit number without spaces", () => {
    expect(formatNumber("999")).toBe("999");
  });

  it("formats 1-digit number", () => {
    expect(formatNumber("5")).toBe("5");
  });

  it("strips non-digit chars before formatting", () => {
    expect(formatNumber("1 000 000")).toBe("1\u202F000\u202F000");
  });

  it("handles leading zeros", () => {
    expect(formatNumber("007")).toBe("007");
  });

  it("handles very large numbers", () => {
    expect(formatNumber("1234567890")).toBe("1\u202F234\u202F567\u202F890");
  });
});

/* ─── stripFormatting ──────────────────────────────────────────────────────── */

describe("stripFormatting", () => {
  it("removes thin spaces", () => {
    expect(stripFormatting("1\u202F000")).toBe("1000");
  });

  it("removes regular spaces", () => {
    expect(stripFormatting("1 000 000")).toBe("1000000");
  });

  it("returns empty string for empty input", () => {
    expect(stripFormatting("")).toBe("");
  });

  it("leaves pure digits unchanged", () => {
    expect(stripFormatting("12345")).toBe("12345");
  });
});

/* ─── remapCursor ──────────────────────────────────────────────────────────── */

describe("remapCursor", () => {
  it("maps cursor at start", () => {
    expect(remapCursor("999", "1\u202F000", 0)).toBe(0);
  });

  it("maps cursor at end", () => {
    // "999" (len 3) → "1 000" (len 5), cursor at 3 → after 3 digits in new
    expect(remapCursor("999", "1\u202F000", 3)).toBe(5);
  });

  it("handles cursor jumping over inserted space", () => {
    // typing "1" into "" → "1", cursor 1
    // then typing "0" → "10", cursor 2... no spaces yet
    // typing "0" → "100", cursor 3
    // typing "0" → "1 000", cursor should be after the 4th digit
    const old = "100";
    const newF = "1\u202F000";
    // cursor at position 3 (after "100") → 3 digits before cursor → position after 3rd digit in "1 000"
    // "1 000": positions: 0='1', 1=' ', 2='0', 3='0', 4='0'
    // 3 digits means after index 4 → position 5
    expect(remapCursor(old, newF, 3)).toBe(5);
  });

  it("maps cursor in middle of formatted string", () => {
    // "1 000" cursor at 2 (after space, at '0') → 1 digit before cursor
    // In "10 000": 1 digit before → position 1
    const old = "1\u202F000";
    const newF = "10\u202F000";
    expect(remapCursor(old, newF, 2)).toBe(2);
  });
});

/* ─── parseNumber ──────────────────────────────────────────────────────────── */

describe("parseNumber", () => {
  it("returns null for empty string", () => {
    expect(parseNumber("")).toBeNull();
  });

  it("parses a plain number", () => {
    expect(parseNumber("1442")).toBe(1442);
  });

  it("parses a formatted number", () => {
    expect(parseNumber("1\u202F000\u202F000")).toBe(1000000);
  });

  it("returns null for non-numeric input", () => {
    expect(parseNumber("abc")).toBeNull();
  });
});
