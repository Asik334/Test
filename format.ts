/**
 * Formats a raw numeric string with non-breaking spaces every 3 digits.
 * "1000000" → "1 000 000"
 */
export function formatNumber(raw: string): string {
  if (!raw) return "";
  // Remove all non-digit chars to get pure digits
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Insert thin space (U+202F) every 3 digits from the right
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
}

/**
 * Strips all formatting characters and returns only digits.
 */
export function stripFormatting(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/**
 * Given a cursor position in the formatted string, compute the equivalent
 * cursor position after reformatting.
 *
 * Strategy: count how many *digits* are to the left of the cursor in the old
 * formatted value, then find the position after the same number of digits in
 * the new formatted value.
 */
export function remapCursor(
  oldFormatted: string,
  newFormatted: string,
  oldCursor: number
): number {
  // Count digits to the left of old cursor
  let digitsBefore = 0;
  for (let i = 0; i < oldCursor && i < oldFormatted.length; i++) {
    if (/\d/.test(oldFormatted[i])) digitsBefore++;
  }

  // Find position in new formatted string after `digitsBefore` digits
  let count = 0;
  for (let i = 0; i <= newFormatted.length; i++) {
    if (count === digitsBefore) return i;
    if (i < newFormatted.length && /\d/.test(newFormatted[i])) count++;
  }
  return newFormatted.length;
}

/**
 * Parses a formatted or raw string into a JS number, or null if empty/invalid.
 */
export function parseNumber(value: string): number | null {
  const digits = stripFormatting(value);
  if (!digits) return null;
  const n = Number(digits);
  return isNaN(n) ? null : n;
}
