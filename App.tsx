import React, { useState } from 'react'
import { NumericInput } from './NumericInput'

const PURPLE = '#5b4fcf'
const PURPLE_RING = 'rgba(91,79,207,0.18)'

// Image embedded as a local import — works on any host/deploy without CORS issues.
// Vite resolves `new URL(...)` at build time and injects the correct hashed path.
const CAT_IMG = new URL('./img.png', import.meta.url).href

// ─── SamuelRow ────────────────────────────────────────────────────────────────

interface SamuelRowProps {
  avatarSize: number
  value: string
  onChange?: (v: string) => void
  showArrow?: boolean
}

function SamuelRow({ avatarSize, value, onChange, showArrow }: SamuelRowProps) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Avatar — fixed size, flex-shrink:0, overflow:hidden keeps circle intact */}
        <div
          aria-hidden="true"
          style={{
            width: avatarSize,
            height: avatarSize,
            minWidth: avatarSize,   /* prevents flex from squishing */
            flexShrink: 0,
            borderRadius: '50%',
            padding: 3,
            border: active ? `2.5px solid ${PURPLE}` : '2.5px solid #ddd',
            boxShadow: active ? `0 0 0 4px ${PURPLE_RING}` : 'none',
            transition: 'border-color 200ms, box-shadow 200ms',
            boxSizing: 'border-box',
            background: '#f0eefb',
            /* overflow:hidden clips the image to the circle even before it loads */
            overflow: 'hidden',
          }}
        >
          <img
            src={CAT_IMG}
            alt="Samuel the cat"
            width={avatarSize - 10}
            height={avatarSize - 10}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              /* Prevent broken-image icon from pushing layout */
              background: '#e8e4f8',
            }}
            /* Graceful fallback text when image fails */
            onError={(e) => {
              const img = e.currentTarget
              img.style.display = 'none'
            }}
          />
        </div>

        {/* Label + Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: PURPLE,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Samuel is
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <NumericInput
              value={value}
              onChange={onChange}
              placeholder="0"
              aria-label="Age in hours"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                padding: '6px 10px',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: '22px',
                border: focused ? `1.5px solid ${PURPLE}` : '1.5px solid #d0cce8',
                borderRadius: 8,
                outline: 'none',
                color: '#1a1832',
                fontFamily: 'inherit',
                background: '#fff',
                boxShadow: focused ? `0 0 0 3px ${PURPLE_RING}` : 'none',
                transition: 'border-color 200ms, box-shadow 200ms, width 120ms ease',
                /* Prevent input from being squished by flex container */
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 15,
              lineHeight: '22px',
              color: '#9590b8',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              hours old
            </span>
          </div>
        </div>
      </div>

      {/* Connector arrow */}
      {showArrow && (
        <div
          aria-hidden="true"
          style={{
            /* Center arrow under the avatar */
            marginLeft: avatarSize / 2 - 1,
            height: 28,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
            <line x1="8" y1="0" x2="8" y2="20" stroke="#c5c0e8" strokeWidth="1.5"/>
            <path
              d="M2 14 L8 21 L14 14"
              stroke="#c5c0e8"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [v1, setV1] = useState('7')
  const [v2, setV2] = useState('100')
  const [v3, setV3] = useState('1000000')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          /* Prevent font scaling on mobile rotation */
          -webkit-text-size-adjust: 100%;
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          min-height: 100dvh;
          background: #f2effc;
          /* Prevent horizontal scroll on mobile */
          overflow-x: hidden;
        }

        ::selection {
          background: rgba(91, 79, 207, 0.18);
          color: #1a1832;
        }

        .app-bg {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #ede8fb 0%, #f5f2ff 50%, #e8edfb 100%);
          padding: 24px 16px;
        }

        /* Animated background blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
          will-change: transform;
        }
        .blob1 {
          width: 400px; height: 400px;
          background: #b8aeef;
          top: -100px; right: -100px;
          animation-delay: 0s;
        }
        .blob2 {
          width: 300px; height: 300px;
          background: #a8c8f8;
          bottom: -80px; left: -80px;
          animation-delay: -3s;
        }
        .blob3 {
          width: 200px; height: 200px;
          background: #c8b8f0;
          top: 40%; left: 30%;
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-24px) scale(1.04); }
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .blob { animation: none; }
        }

        .card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          /* Responsive padding */
          padding: 32px 36px 36px;
          box-shadow:
            0 4px 24px rgba(91, 79, 207, 0.10),
            0 1px 4px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(91, 79, 207, 0.12);
          /* Prevent card overflow on small screens */
          max-width: calc(100vw - 32px);
          width: fit-content;
        }

        @media (max-width: 400px) {
          .card {
            padding: 24px 20px 28px;
            border-radius: 20px;
          }
        }

        .task-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #b0aad4;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .rows-stack {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
      `}</style>

      <div className="app-bg">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />

        <main className="card" role="main" aria-label="Samuel's age calculator">
          <p className="task-label" aria-hidden="true">Task</p>

          <div className="rows-stack">
            <SamuelRow avatarSize={56} value={v1} onChange={setV1} showArrow />
            <SamuelRow avatarSize={70} value={v2} onChange={setV2} showArrow />
            <SamuelRow avatarSize={88} value={v3} onChange={setV3} />
          </div>
        </main>
      </div>
    </>
  )
}
