/**
 * format.ts
 * ──────────
 * Pure utilities for formatting and parsing numeric strings.
 * No side-effects, no DOM dependencies — easy to unit-test.
 */

/**
 * Formats raw digits with narrow no-break spaces (U+202F) every 3 digits.
 *
 * @example
 * formatNumber('1000000') // '1 000 000'  (with U+202F)
 * formatNumber('')        // ''
 * formatNumber('42')      // '42'
 */
export function formatNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')
}

/**
 * Strips all non-digit characters and returns only the digit string.
 *
 * @example
 * stripFormatting('1\u202F000\u202F000') // '1000000'
 * stripFormatting('abc123')              // '123'
 */
export function stripFormatting(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

/**
 * Remaps a cursor position from one formatted string to another.
 *
 * Strategy: count how many digits sit to the left of `oldCursor` in
 * `oldFormatted`, then find the position after the same number of digits
 * in `newFormatted`.  This keeps the cursor stable when spaces are
 * inserted or removed by reformatting.
 */
export function remapCursor(
  oldFormatted: string,
  newFormatted: string,
  oldCursor: number,
): number {
  // Count digits strictly left of cursor in old string
  let digitsBefore = 0
  const clampedCursor = Math.min(oldCursor, oldFormatted.length)
  for (let i = 0; i < clampedCursor; i++) {
    if (/\d/.test(oldFormatted[i])) digitsBefore++
  }

  // Walk new string and return position after `digitsBefore` digits
  let count = 0
  for (let i = 0; i <= newFormatted.length; i++) {
    if (count === digitsBefore) return i
    if (i < newFormatted.length && /\d/.test(newFormatted[i])) count++
  }
  return newFormatted.length
}

/**
 * Parses a formatted or raw string into a JS number.
 * Returns `null` for empty or non-numeric input.
 *
 * @example
 * parseNumber('1 000 000') // 1000000
 * parseNumber('')          // null
 */
export function parseNumber(value: string): number | null {
  const digits = stripFormatting(value)
  if (!digits) return null
  const n = Number(digits)
  return isNaN(n) ? null : n
}
