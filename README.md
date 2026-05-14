# NumericInput — Technical Exercise

A production-grade numeric input with live number formatting, adaptive width,
and careful cursor preservation — built in React + TypeScript.

## Stack

| Tool | Version | Why |
|---|---|---|
| React | 18 | Hooks, forwardRef |
| TypeScript | 5 | Type safety |
| Vite | 5 | Fast HMR, asset hashing |
| Inter (Google Fonts) | — | Clean system-neutral typeface |

No formatting libraries, no lodash — everything is hand-rolled.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview built output
```

## Architecture

```
App.tsx          — Shell: three SamuelRow instances with controlled state
NumericInput.tsx — Reusable component (forwardRef, controlled + uncontrolled)
format.ts        — Pure utilities: formatNumber, stripFormatting, remapCursor
img.png          — Avatar asset (inlined as base64 by Vite at build time)
```

## Formatting logic

Numbers are formatted with **narrow no-break spaces** (U+202F) as thousand
separators — the same character used by many European style guides.  This
avoids ambiguity with regular space (U+0020) which some parsers interpret as
a decimal separator.

```ts
formatNumber('1000000')  // '1 000 000'
formatNumber('42')       // '42'
```

`stripFormatting` is the inverse — it drops every non-digit character,
making the pair idempotent: `stripFormatting(formatNumber(s)) === s`.

## Adaptive width

Width is computed after every render using an **off-screen Canvas** (one
instance shared across all inputs via module-level singleton):

```ts
ctx.font = `${weight} ${size} ${family}`
const measured = ctx.measureText(displayValue || placeholder).width
width = Math.max(minWidth, measured + paddingH + borderH + 4)
```

The `+4` accounts for the text cursor (2 px) plus breathing room to prevent
the value from scrolling inside the input box.

## Cursor preservation

Reformatting changes the length of the string (spaces are added/removed),
so a naïve cursor restore would land in the wrong position.  `remapCursor`
counts how many **digits** sit left of the cursor in the old string, then
walks the new string to find the position after the same digit count:

```
old:  "1 000|"   (cursor after 4 chars, 4 digits to the left)
new:  "10 000"
       ↑ walk until 4 digits seen → position 5  →  "10 00|0"
```

This keeps the cursor stable regardless of how many spaces are
inserted or removed.

## Edge cases handled

| Case | Behaviour |
|---|---|
| Leading zeros | Stripped (`007` → `7`) |
| Paste with non-digits | Non-digits stripped, digits inserted at cursor |
| Empty value | Shows placeholder, width = minWidth |
| Huge numbers | JS `Number` handles up to 2⁵³; display stays correct |
| `delete` mid-number | Digit removed, spaces reflow, cursor remapped |
| Mobile paste | `onPaste` handler intercepts clipboard before OS formats it |

## Accessibility

- `inputMode="numeric"` — shows numeric keyboard on iOS/Android
- `role="spinbutton"` + `aria-valuemin={0}` — correct ARIA semantics
- `aria-label` prop (required by the parent, defaulting to `"Numeric input"`)
- `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"` — clean
  mobile experience
- `font-size: max(16px, …)` — prevents iOS Safari from zooming on focus

## Image loading

`img.png` is resolved at build time via Vite's asset pipeline:

```ts
const CAT_IMG = new URL('./img.png', import.meta.url).href
```

Vite hashes and inlines the file as base64 (< 50 KB threshold in
`vite.config.ts`), so the image works on **any deploy host** without
needing a `public/` directory or matching deploy path.  An `onError`
handler hides the `<img>` gracefully if the asset is somehow unavailable.

## Responsive / mobile

- Card uses `max-width: calc(100vw - 32px)` and `width: fit-content`
- `overflow-x: hidden` on `body` prevents horizontal scroll
- Blobs use `will-change: transform` for GPU compositing
- `@media (prefers-reduced-motion)` disables blob animation
- `padding: 24px 16px` on `.app-bg` ensures card never touches screen edges
