import React, { useState } from 'react'
import { NumericInput } from './NumericInput'

const PURPLE = '#5b4fcf'
const PURPLE_RING = 'rgba(91,79,207,0.18)'

// Прямая ссылка на фото из GitHub репозитория
const CAT_IMG = 'https://raw.githubusercontent.com/Asik334/Test/main/public/img.png'

function SamuelRow({
  avatarSize,
  value,
  onChange,
  showArrow,
  readOnly,
}: {
  avatarSize: number
  value: string
  onChange?: (v: string) => void
  showArrow?: boolean
  readOnly?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

        {/* Avatar с фиолетовым кольцом */}
        <div style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          border: active ? `2.5px solid ${PURPLE}` : '2.5px solid #ddd',
          padding: 3,
          flexShrink: 0,
          transition: 'border-color 200ms, box-shadow 200ms',
          boxShadow: active ? `0 0 0 4px ${PURPLE_RING}` : 'none',
          boxSizing: 'border-box',
          background: '#f0eefb',
        }}>
          <img
            src={CAT_IMG}
            alt="Samuel the cat"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.13em',
            color: PURPLE,
            textTransform: 'uppercase',
          }}>Samuel is</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NumericInput
              value={value}
              onChange={onChange}
              placeholder="0"
              aria-label="Age in hours"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                padding: '7px 12px',
                fontSize: 15,
                border: focused ? `1.5px solid ${PURPLE}` : '1.5px solid #d0cce8',
                borderRadius: 8,
                outline: 'none',
                color: '#1a1832',
                fontFamily: 'inherit',
                background: '#fff',
                boxShadow: focused ? `0 0 0 3px ${PURPLE_RING}` : 'none',
                transition: 'border-color 200ms, box-shadow 200ms',
              }}
            />
            <span style={{ fontSize: 15, color: '#9590b8', whiteSpace: 'nowrap' }}>
              hours old
            </span>
          </div>
        </div>
      </div>

      {/* Стрелка вниз */}
      {showArrow && (
        <div style={{
          marginLeft: avatarSize / 2 - 1,
          height: 32,
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="16" height="32" viewBox="0 0 16 32" fill="none">
            <line x1="8" y1="0" x2="8" y2="24" stroke="#c5c0e8" strokeWidth="1.5"/>
            <path d="M2 18 L8 25 L14 18" stroke="#c5c0e8" strokeWidth="1.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          background: #f2effc;
        }

        .app-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #ede8fb 0%, #f5f2ff 50%, #e8edfb 100%);
        }

        /* Анимированные блобы */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
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
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px 44px 44px;
          box-shadow:
            0 4px 24px rgba(91, 79, 207, 0.10),
            0 1px 4px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9);
          border: 1px solid rgba(91, 79, 207, 0.12);
        }

        .task-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #b0aad4;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
      `}</style>

      <div className="app-bg">
        <div className="blob blob1"/>
        <div className="blob blob2"/>
        <div className="blob blob3"/>

        <div className="card">
          <div className="task-label">Task</div>
          <SamuelRow avatarSize={56} value={v1} onChange={setV1} showArrow />
          <SamuelRow avatarSize={70} value={v2} onChange={setV2} showArrow />
          <SamuelRow avatarSize={88} value={v3} onChange={setV3} />
        </div>
      </div>
    </>
  )
}
