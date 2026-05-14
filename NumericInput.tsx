import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { formatNumber, remapCursor, stripFormatting } from "../utils/format";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  /** Controlled numeric value (digits only, no formatting). */
  value?: string;
  /** Uncontrolled initial value (digits only). */
  defaultValue?: string;
  /** Called with the raw digits string (no spaces) on every change. */
  onChange?: (value: string) => void;
  /** Minimum pixel width of the input. Default: 72. */
  minWidth?: number;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** aria-label for accessibility. */
  "aria-label"?: string;
}

/* ─── Measuring canvas ───────────────────────────────────────────────────────── */
// Reuse a single off-screen canvas for text measurement.
let _canvas: HTMLCanvasElement | null = null;
function measureText(text: string, font: string): number {
  if (typeof window === "undefined") return 0;
  _canvas = _canvas ?? document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/* ─── Hook: auto-width ───────────────────────────────────────────────────────── */
function useAutoWidth(
  ref: React.RefObject<HTMLInputElement | null>,
  displayValue: string,
  placeholder: string,
  minWidth: number
): number {
  const [width, setWidth] = useState(minWidth);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const paddingH =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

    const textToMeasure = displayValue || placeholder;
    const measured = measureText(textToMeasure, font);
    const next = Math.max(minWidth, Math.ceil(measured + paddingH + 2)); // +2 for cursor
    setWidth(next);
  }, [displayValue, placeholder, minWidth, ref]);

  return width;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export const NumericInput = React.forwardRef<
  HTMLInputElement,
  NumericInputProps
>(function NumericInput(
  {
    value: controlledValue,
    defaultValue = "",
    onChange,
    minWidth = 72,
    placeholder = "0",
    style,
    className,
    disabled,
    readOnly,
    "aria-label": ariaLabel = "Numeric input",
    ...rest
  },
  forwardedRef
) {
  const isControlled = controlledValue !== undefined;

  /* Internal raw digits state (only used in uncontrolled mode) */
  const [internalRaw, setInternalRaw] = useState<string>(() =>
    stripFormatting(defaultValue)
  );

  /* Source of truth for raw digits */
  const rawDigits = isControlled
    ? stripFormatting(controlledValue)
    : internalRaw;

  /* Formatted display value */
  const displayValue = formatNumber(rawDigits);

  /* Ref to the <input> element */
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* Pending cursor position — written synchronously, applied in useLayoutEffect */
  const pendingCursor = useRef<number | null>(null);

  /* Auto-width */
  const inputWidth = useAutoWidth(
    inputRef,
    displayValue,
    placeholder,
    minWidth
  );

  /* Sync forwardedRef */
  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  /* Apply pending cursor after DOM paint */
  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(
        pendingCursor.current,
        pendingCursor.current
      );
      pendingCursor.current = null;
    }
  });

  /* Sync controlled value into DOM display — avoids React overwriting cursor */
  useEffect(() => {
    if (isControlled && inputRef.current) {
      const el = inputRef.current;
      if (el.value !== displayValue) {
        el.value = displayValue;
      }
    }
  }, [isControlled, displayValue]);

  /* ── Core input handler ────────────────────────────────────────────────────── */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const oldFormatted = displayValue;
      const oldCursor = el.selectionStart ?? el.value.length;
      const typedValue = el.value;

      const newRaw = stripFormatting(typedValue);
      const newFormatted = formatNumber(newRaw);

      /* Remap cursor accounting for added/removed spaces */
      const newCursor = remapCursor(oldFormatted, newFormatted, oldCursor);
      pendingCursor.current = newCursor;

      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(newRaw);

      /* Force the DOM to show the reformatted value immediately.
         We write it back here so the cursor remap happens in the same frame. */
      el.value = newFormatted;
    },
    [displayValue, isControlled, onChange]
  );

  /* ── Key handler: allow only digits + navigation keys ────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Tab",
        "Enter",
        "Escape",
      ];
      const isDigit = /^\d$/.test(e.key);
      const isModified = e.ctrlKey || e.metaKey; // allow Ctrl+A, Ctrl+C, etc.

      if (!isDigit && !allowed.includes(e.key) && !isModified) {
        e.preventDefault();
      }

      rest.onKeyDown?.(e);
    },
    [rest]
  );

  /* ── Paste handler ────────────────────────────────────────────────────────── */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      const pasted = e.clipboardData.getData("text");
      const pastedDigits = stripFormatting(pasted);
      if (!pastedDigits) return;

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;

      const currentRaw = stripFormatting(el.value);
      // Calculate how many raw digits are before cursor start
      const digitsBeforeStart = stripFormatting(
        el.value.substring(0, start)
      ).length;
      const digitsSelected = stripFormatting(
        el.value.substring(start, end)
      ).length;

      const newRaw =
        currentRaw.substring(0, digitsBeforeStart) +
        pastedDigits +
        currentRaw.substring(digitsBeforeStart + digitsSelected);

      const newFormatted = formatNumber(newRaw);
      const newCursorDigits = digitsBeforeStart + pastedDigits.length;
      let counted = 0;
      let newCursor = newFormatted.length;
      for (let i = 0; i < newFormatted.length; i++) {
        if (counted === newCursorDigits) {
          newCursor = i;
          break;
        }
        if (/\d/.test(newFormatted[i])) counted++;
      }

      el.value = newFormatted;
      pendingCursor.current = newCursor;

      if (!isControlled) setInternalRaw(newRaw);
      onChange?.(newRaw);

      rest.onPaste?.(e);
    },
    [isControlled, onChange, rest]
  );

  /* ────────────────────────────────────────────────────────────────────────── */

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
      spellCheck={false}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      defaultValue={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={className}
      style={{
        width: `${inputWidth}px`,
        transition: "width 120ms ease",
        /* Default styles — can be overridden via className */
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.01em",
        ...style,
      }}
    />
  );
});

NumericInput.displayName = "NumericInput";
export default NumericInput;
