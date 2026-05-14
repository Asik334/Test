import React, { useState } from 'react'
import { NumericInput } from './NumericInput'

export default function App() {
  const [value, setValue] = useState('7')
  const isFocused = value.length > 0

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        minWidth: 320,
      }}>
        <SamuelRow value={value} onChange={setValue} />
      </div>
    </div>
  )
}

function SamuelRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = React.useState(false)
  const hasValue = value.length > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {/* Cat avatar */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        border: focused || hasValue ? '2.5px solid #5b4fcf' : '2.5px solid transparent',
        padding: 3,
        transition: 'border-color 200ms ease',
        flexShrink: 0,
      }}>
        <img
          src="/img.png"
          alt="Samuel the cat"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={e => {
            // fallback if no image
            const t = e.currentTarget as HTMLImageElement
            t.style.display = 'none'
          }}
        />
        {/* Fallback cat emoji */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: '#e8e6f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginTop: -72,
        }}>🐱</div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#5b4fcf',
          textTransform: 'uppercase',
        }}>
          Samuel is
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NumericInput
            value={value}
            onChange={onChange}
            placeholder="0"
            aria-label="Age in hours"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              padding: '8px 12px',
              fontSize: 16,
              border: focused ? '1.5px solid #5b4fcf' : '1.5px solid #c8c8d8',
              borderRadius: 8,
              outline: 'none',
              color: '#1a1a2e',
              fontFamily: 'inherit',
              boxShadow: focused ? '0 0 0 3px rgba(91,79,207,0.15)' : 'none',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
          />
          <span style={{ fontSize: 16, color: '#888', whiteSpace: 'nowrap' }}>
            hours old
          </span>
        </div>
      </div>
    </div>
  )
}
