import React, { useState } from 'react'
import { NumericInput } from './NumericInput'

const PURPLE = '#5b4fcf'
const PURPLE_LIGHT = 'rgba(91,79,207,0.12)'

function SamuelRow({
  avatarSize,
  value,
  onChange,
  showArrow,
}: {
  avatarSize: number
  value: string
  onChange?: (v: string) => void
  showArrow?: boolean
}) {
  const [focused, setFocused] = React.useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Avatar */}
        <div style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          border: active ? `2.5px solid ${PURPLE}` : '2.5px solid #ddd',
          padding: 3,
          flexShrink: 0,
          transition: 'border-color 200ms',
          background: '#fff',
          boxSizing: 'border-box',
        }}>
          <img
            src="/img.png"
            alt="Samuel"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Label + Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: PURPLE,
            textTransform: 'uppercase',
          }}>Samuel is</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NumericInput
              value={value}
              onChange={onChange}
              placeholder="0"
              aria-label="Hours"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                padding: '7px 11px',
                fontSize: 15,
                border: focused ? `1.5px solid ${PURPLE}` : '1.5px solid #c8c8d8',
                borderRadius: 8,
                outline: 'none',
                color: '#1a1a2e',
                fontFamily: 'inherit',
                background: '#fff',
                boxShadow: focused ? `0 0 0 3px ${PURPLE_LIGHT}` : 'none',
                transition: 'border-color 200ms, box-shadow 200ms',
              }}
            />
            <span style={{ fontSize: 15, color: '#999', whiteSpace: 'nowrap' }}>
              hours old
            </span>
          </div>
        </div>
      </div>

      {/* Arrow between rows */}
      {showArrow && (
        <div style={{
          marginLeft: avatarSize / 2 - 1,
          height: 28,
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="14" height="28" viewBox="0 0 14 28" fill="none">
            <line x1="7" y1="0" x2="7" y2="22" stroke="#c0bce8" strokeWidth="1.5"/>
            <path d="M1 16 L7 23 L13 16" stroke="#c0bce8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [v1, setV1] = useState('7')
  const [v2, setV2] = useState('100')
  const [v3, setV3] = useState('1000000')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ece9fb 0%, #f5f0ff 40%, #e8f4fd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: -80, right: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(91,79,207,0.08)', zIndex: 0,
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'fixed', bottom: -60, left: -60,
        width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(91,79,207,0.06)', zIndex: 0,
        pointerEvents: 'none',
      }}/>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 20,
        padding: '40px 44px',
        boxShadow: '0 8px 40px rgba(91,79,207,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(91,79,207,0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: '#b0aad4',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}>Task</div>

        <SamuelRow avatarSize={56} value={v1} onChange={setV1} showArrow />
        <SamuelRow avatarSize={68} value={v2} onChange={setV2} showArrow />
        <SamuelRow avatarSize={84} value={v3} onChange={setV3} />
      </div>
    </div>
  )
}
