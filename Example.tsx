import React, { useState } from "react";
import { NumericInput } from "./components/NumericInput";
import { parseNumber } from "./utils/format";
import "./styles/numeric-input.css";

/* ── Controlled example ──────────────────────────────────────────────────── */
function ControlledExample() {
  const [raw, setRaw] = useState("1000000");
  const value = parseNumber(raw);

  return (
    <div className="example-block">
      <label className="example-label" htmlFor="price">
        Price
      </label>
      <div className="input-row">
        <span className="input-prefix">₸</span>
        <NumericInput
          id="price"
          value={raw}
          onChange={setRaw}
          placeholder="0"
          aria-label="Price in tenge"
          minWidth={72}
        />
      </div>
      <p className="example-hint">
        Raw value: <code>{raw || "(empty)"}</code> · Parsed:{" "}
        <code>{value?.toLocaleString("ru-KZ") ?? "null"}</code>
      </p>
    </div>
  );
}

/* ── Uncontrolled example ────────────────────────────────────────────────── */
function UncontrolledExample() {
  const [last, setLast] = useState<string>("");

  return (
    <div className="example-block">
      <label className="example-label" htmlFor="quantity">
        Quantity
      </label>
      <NumericInput
        id="quantity"
        defaultValue="42"
        onChange={setLast}
        placeholder="0"
        aria-label="Quantity"
      />
      <p className="example-hint">
        Last onChange: <code>{last || "(none)"}</code>
      </p>
    </div>
  );
}

/* ── Disabled example ────────────────────────────────────────────────────── */
function DisabledExample() {
  return (
    <div className="example-block">
      <label className="example-label" htmlFor="disabled">
        Disabled
      </label>
      <NumericInput
        id="disabled"
        value="9999999"
        disabled
        aria-label="Disabled numeric input"
      />
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <main className="app">
      <h1>NumericInput</h1>
      <p className="subtitle">Auto-formatting · Auto-width · Accessible</p>
      <ControlledExample />
      <UncontrolledExample />
      <DisabledExample />
    </main>
  );
}
