import React, { useState } from 'react'
import { NumericInput } from './NumericInput'

export default function App() {
  const [value, setValue] = useState('1000000')

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 16 }}>NumericInput Demo</h2>
      <NumericInput
        value={value}
        onChange={setValue}
        aria-label="Число"
        placeholder="0"
      />
      <p style={{ marginTop: 12, color: '#666' }}>Raw: {value}</p>
    </div>
  )
}
