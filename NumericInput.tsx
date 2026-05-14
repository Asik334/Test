import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { formatNumber, remapCursor, stripFormatting } from './format'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type'
  > {
  /** Controlled value — raw digits only, no formatting. */
  value?: string
  /** Uncontrolled initial value — raw digits only. */
  defaultValue?: string
  /** Called with raw digits string on every change. */
  onChange?: (value: string) => void
  /** Minimum pixel width. Default: 72. */
  minWidth?: number
  /** Placeholder shown when empty. */
  placeholder?: string
}

// ─── Off-screen text measurement ─────────────────────────────────────────────
// Reuse a single canvas context — creating one per render is expensive.

let _canvas: HTMLCanvasElement | null = null

function measureText(text: string, font: string): number {
  if (typeof window === 'undefined') return 0
  _canvas ??= document.createElement('canvas')
  const ctx = _canvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

// ─── Hook: auto-resize width ──────────────────────────────────────────────────

function useAutoWidth(
  ref: React.RefObject<HTMLInputElement | null>,
  displayValue: string,
  placeholder: string,
  minWidth: number,
): number {
  const [width, setWidth] = useState(minWidth)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const style = window.getComputedStyle(el)
    // Build a font string the canvas ctx.font parser accepts
    const font = [
      style.fontStyle !== 'normal' ? style.fontStyle : '',
      style.fontVariant !== 'normal' ? style.fontVariant : '',
      style.fontWeight,
      style.fontSize,
      style.fontFamily,
    ]
      .filter(Boolean)
      .join(' ')

    const paddingH =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
    const borderH =
      parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)

    const textToMeasure = displayValue || placeholder
    const measured = measureText(textToMeasure, font)
    // +4: 2px cursor + 2px breathing room to prevent scroll
    const next = Math.max(minWidth, Math.ceil(measured + paddingH + borderH + 4))

    setWidth(next)
  }, [displayValue, placeholder, minWidth, ref])

  return width
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput(
    {
      value: controlledValue,
      defaultValue = '',
      onChange,
      minWidth = 72,
      placeholder = '0',
      style,
      className,
      disabled,
      readOnly,
      'aria-label': ariaLabel = 'Numeric input',
      onFocus,
      onBlur,
      ...rest
    },
    forwardedRef,
  ) {
    const isControlled = controlledValue !== undefined

    // Uncontrolled raw digits
    const [internalRaw, setInternalRaw] = useState<string>(() =>
      stripFormatting(defaultValue),
    )

    const rawDigits = isControlled
      ? stripFormatting(controlledValue)
      : internalRaw

    const displayValue = formatNumber(rawDigits)

    const inputRef = useRef<HTMLInputElement | null>(null)
    // Pending cursor is written synchronously and applied after paint
    const pendingCursor = useRef<number | null>(null)

    const inputWidth = useAutoWidth(inputRef, displayValue, placeholder, minWidth)

    // Merge forwarded ref with internal ref
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    // Apply pending cursor after every render
    useLayoutEffect(() => {
      if (pendingCursor.current !== null && inputRef.current) {
        const pos = pendingCursor.current
        inputRef.current.setSelectionRange(pos, pos)
        pendingCursor.current = null
      }
    })

    // Keep DOM in sync with controlled value without overwriting cursor position
    useLayoutEffect(() => {
      if (!isControlled) return
      const el = inputRef.current
      if (!el) return
      if (el.value !== displayValue) {
        const start = el.selectionStart
        const end = el.selectionEnd
        el.value = displayValue
        // Restore cursor after forced value update
        if (document.activeElement === el && start !== null && end !== null) {
          el.setSelectionRange(start, end)
        }
      }
    }, [isControlled, displayValue])

    // ── onChange ──────────────────────────────────────────────────────────────

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const el = e.currentTarget
        const oldFormatted = displayValue
        const oldCursor = el.selectionStart ?? el.value.length
        const newRaw = stripFormatting(el.value)

        // Guard: drop leading zeros (keep single '0' valid)
        const sanitized = newRaw.replace(/^0+(\d)/, '$1')

        const newFormatted = formatNumber(sanitized)
        const newCursor = remapCursor(oldFormatted, newFormatted, oldCursor)
        pendingCursor.current = newCursor

        el.value = newFormatted

        if (!isControlled) setInternalRaw(sanitized)
        onChange?.(sanitized)
      },
      [displayValue, isControlled, onChange],
    )

    // ── onKeyDown: whitelist digits + nav keys ────────────────────────────────

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const NAV_KEYS = new Set([
          'Backspace', 'Delete',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End', 'Tab', 'Enter', 'Escape',
        ])
        const isDigit = /^\d$/.test(e.key)
        const isCtrl = e.ctrlKey || e.metaKey // allow Ctrl+A / Ctrl+C / etc.

        if (!isDigit && !NAV_KEYS.has(e.key) && !isCtrl) {
          e.preventDefault()
        }

        rest.onKeyDown?.(e)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [rest.onKeyDown],
    )

    // ── onPaste: strip non-digits, insert at cursor ───────────────────────────

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const el = e.currentTarget
        const pastedDigits = stripFormatting(e.clipboardData.getData('text'))
        if (!pastedDigits) return

        const start = el.selectionStart ?? 0
        const end = el.selectionEnd ?? 0
        const currentRaw = stripFormatting(el.value)

        const digitsBeforeStart = stripFormatting(el.value.slice(0, start)).length
        const digitsSelected = stripFormatting(el.value.slice(start, end)).length

        const newRaw =
          currentRaw.slice(0, digitsBeforeStart) +
          pastedDigits +
          currentRaw.slice(digitsBeforeStart + digitsSelected)

        const sanitized = newRaw.replace(/^0+(\d)/, '$1')
        const newFormatted = formatNumber(sanitized)

        // Map digit-cursor to character position in new formatted string
        const targetDigits = digitsBeforeStart + pastedDigits.length
        let counted = 0
        let newCursor = newFormatted.length
        for (let i = 0; i < newFormatted.length; i++) {
          if (counted === targetDigits) { newCursor = i; break }
          if (/\d/.test(newFormatted[i])) counted++
        }

        el.value = newFormatted
        pendingCursor.current = newCursor

        if (!isControlled) setInternalRaw(sanitized)
        onChange?.(sanitized)
        rest.onPaste?.(e)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isControlled, onChange, rest.onPaste],
    )

    // ─────────────────────────────────────────────────────────────────────────

    return (
      <input
        {...rest}
        ref={setRef}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuemin={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        defaultValue={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={onBlur}
        className={className}
        style={{
          width: `${inputWidth}px`,
          minWidth: minWidth,
          transition: 'width 120ms ease, border-color 200ms, box-shadow 200ms',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
          // Prevent mobile zoom — font-size must be >= 16px to avoid iOS zoom
          fontSize: 'max(16px, 15px)',
          ...style,
        }}
      />
    )
  },
)

NumericInput.displayName = 'NumericInput'
export default NumericInput
