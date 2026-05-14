import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })
const useTheme = () => useContext(ThemeContext)

// ─── Design tokens ────────────────────────────────────────────────────────────

const PURPLE = '#5b4fcf'
const PURPLE_RING = 'rgba(91,79,207,0.18)'

const tokens = {
  light: {
    bg: 'linear-gradient(135deg, #ede8fb 0%, #f5f2ff 50%, #e8edfb 100%)',
    card: 'rgba(255,255,255,0.84)',
    cardBorder: 'rgba(91,79,207,0.12)',
    cardShadow: '0 4px 24px rgba(91,79,207,0.10), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
    inputBg: '#fff',
    inputColor: '#1a1832',
    inputBorder: '#d0cce8',
    labelColor: PURPLE,
    unitColor: '#9590b8',
    taskLabel: '#b0aad4',
    avatarBg: '#f0eefb',
    blob1: '#b8aeef',
    blob2: '#a8c8f8',
    blob3: '#c8b8f0',
    toggleBg: 'rgba(91,79,207,0.10)',
    toggleColor: '#5b4fcf',
    toggleHover: 'rgba(91,79,207,0.18)',
    arrowColor: '#c5c0e8',
    starColor: 'rgba(91,79,207,0.5)',
  },
  dark: {
    bg: 'linear-gradient(135deg, #0f0d1a 0%, #13102a 50%, #0d1020 100%)',
    card: 'rgba(22,18,45,0.92)',
    cardBorder: 'rgba(91,79,207,0.25)',
    cardShadow: '0 4px 32px rgba(91,79,207,0.22), 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputColor: '#e8e4ff',
    inputBorder: 'rgba(91,79,207,0.35)',
    labelColor: '#9d93e8',
    unitColor: '#6b647f',
    taskLabel: '#4a4466',
    avatarBg: '#1e1840',
    blob1: '#3d2f8a',
    blob2: '#1a3060',
    blob3: '#2d1f70',
    toggleBg: 'rgba(91,79,207,0.15)',
    toggleColor: '#a09ae8',
    toggleHover: 'rgba(91,79,207,0.28)',
    arrowColor: '#3d3760',
    starColor: 'rgba(200,190,255,0.8)',
  },
} as const

// ─── Format utilities ─────────────────────────────────────────────────────────

function formatNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')
}

function stripFormatting(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

// ─── Star Canvas ──────────────────────────────────────────────────────────────

function StarCanvas({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const starColor = theme === 'dark' ? 'rgba(200,190,255,' : 'rgba(91,79,207,'

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate stars
    const STAR_COUNT = 120
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.7 + 0.2,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
    }))

    // Shooting stars
    const shootingStars: Array<{
      x: number; y: number; vx: number; vy: number;
      len: number; opacity: number; life: number; maxLife: number
    }> = []

    let lastShoot = 0

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Regular twinkling stars
      for (const s of stars) {
        s.opacity += s.twinkleSpeed * s.opacityDir
        if (s.opacity >= 0.95) { s.opacity = 0.95; s.opacityDir = -1 }
        if (s.opacity <= 0.1) { s.opacity = 0.1; s.opacityDir = 1 }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = starColor + s.opacity + ')'
        ctx.fill()
      }

      // Shooting star spawn
      if (time - lastShoot > 2500 + Math.random() * 3000) {
        lastShoot = time
        const angle = (Math.random() * 30 + 20) * Math.PI / 180
        const spd = 4 + Math.random() * 4
        shootingStars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.3,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          len: 60 + Math.random() * 60,
          opacity: 1,
          life: 0,
          maxLife: 60,
        })
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i]
        ss.x += ss.vx
        ss.y += ss.vy
        ss.life++
        ss.opacity = 1 - ss.life / ss.maxLife

        const grad = ctx.createLinearGradient(
          ss.x - ss.vx * (ss.len / 5),
          ss.y - ss.vy * (ss.len / 5),
          ss.x, ss.y
        )
        grad.addColorStop(0, starColor + '0)')
        grad.addColorStop(1, starColor + ss.opacity + ')')

        ctx.beginPath()
        ctx.moveTo(ss.x - ss.vx * (ss.len / 5), ss.y - ss.vy * (ss.len / 5))
        ctx.lineTo(ss.x, ss.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1)
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

// ─── Image ────────────────────────────────────────────────────────────────────

const CAT_IMG = new URL('./img.png', import.meta.url).href

// ─── NumericInput (inline, no external file needed) ───────────────────────────

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  value?: string
  onChange?: (v: string) => void
  minWidth?: number
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput({ value: controlledValue = '', onChange, minWidth = 96, placeholder = '0', style, onFocus, onBlur, ...rest }, forwardedRef) {
    const displayValue = formatNumber(controlledValue)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = stripFormatting(e.target.value)
      const sanitized = raw.replace(/^0+(\d)/, '$1')
      onChange?.(sanitized)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const NAV = new Set(['Backspace','Delete','ArrowLeft','ArrowRight','Home','End','Tab','Enter','Escape'])
      if (!/^\d$/.test(e.key) && !NAV.has(e.key) && !(e.ctrlKey || e.metaKey)) e.preventDefault()
      rest.onKeyDown?.(e)
    }

    return (
      <input
        {...rest}
        ref={forwardedRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          minWidth,
          width: `${Math.max(minWidth, displayValue.length * 10 + 28)}px`,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
          fontSize: 'max(16px, 15px)',
          transition: 'width 120ms ease, border-color 200ms, box-shadow 200ms',
          ...style,
        }}
      />
    )
  }
)

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const t = tokens[theme]
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        position: 'absolute', top: 14, right: 14,
        width: 34, height: 34, borderRadius: 10, border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? t.toggleHover : t.toggleBg,
        fontSize: 16, transition: 'background 180ms, transform 180ms',
        transform: hovered ? 'scale(1.08)' : 'scale(1)', outline: 'none', flexShrink: 0,
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

// ─── SamuelRow ────────────────────────────────────────────────────────────────

interface SamuelRowProps {
  avatarSize: number
  value: string
  onChange?: (v: string) => void
  showArrow?: boolean
}

function SamuelRow({ avatarSize, value, onChange, showArrow }: SamuelRowProps) {
  const { theme } = useTheme()
  const t = tokens[theme]
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            width: avatarSize, height: avatarSize, minWidth: avatarSize,
            flexShrink: 0, borderRadius: '50%', padding: 3,
            border: active ? `2.5px solid ${PURPLE}` : `2.5px solid ${t.inputBorder}`,
            boxShadow: active ? `0 0 0 4px ${PURPLE_RING}` : 'none',
            transition: 'border-color 200ms, box-shadow 200ms',
            boxSizing: 'border-box', background: t.avatarBg, overflow: 'hidden',
          }}
        >
          <img
            src={CAT_IMG}
            alt="Samuel the cat"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block', background: t.avatarBg }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Label + Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: t.labelColor, textTransform: 'uppercase', lineHeight: 1 }}>
            Samuel is
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <NumericInput
              value={value}
              onChange={onChange}
              placeholder="0"
              aria-label="Age in hours"
              minWidth={96}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                padding: '6px 10px', fontWeight: 500, lineHeight: '22px',
                border: focused ? `1.5px solid ${PURPLE}` : `1.5px solid ${t.inputBorder}`,
                borderRadius: 8, outline: 'none', color: t.inputColor, fontFamily: 'inherit',
                background: t.inputBg,
                boxShadow: focused ? `0 0 0 3px ${PURPLE_RING}` : 'none',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 15, lineHeight: '22px', color: t.unitColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
              hours old
            </span>
          </div>
        </div>
      </div>

      {showArrow && (
        <div aria-hidden="true" style={{ marginLeft: avatarSize / 2 - 1, height: 28, display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
            <line x1="8" y1="0" x2="8" y2="20" stroke={t.arrowColor} strokeWidth="1.5"/>
            <path d="M2 14 L8 21 L14 14" stroke={t.arrowColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── ResetButton ──────────────────────────────────────────────────────────────

function ResetButton({ onReset }: { onReset: () => void }) {
  const { theme } = useTheme()
  const t = tokens[theme]
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={onReset}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      aria-label="Reset all values"
      style={{
        marginTop: 20, alignSelf: 'flex-start', padding: '5px 14px',
        borderRadius: 8, border: `1.5px solid ${t.inputBorder}`,
        background: hovered ? t.toggleHover : 'transparent', color: t.unitColor,
        fontSize: 12, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '0.06em',
        cursor: 'pointer', transition: 'background 160ms, color 160ms, transform 100ms',
        transform: pressed ? 'scale(0.96)' : 'scale(1)', outline: 'none',
      }}
    >
      Reset
    </button>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const DEFAULTS = { v1: '7', v2: '100', v3: '1000000' }

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  const [v1, setV1] = useState(DEFAULTS.v1)
  const [v2, setV2] = useState(DEFAULTS.v2)
  const [v3, setV3] = useState(DEFAULTS.v3)

  const handleReset = useCallback(() => {
    setV1(DEFAULTS.v1); setV2(DEFAULTS.v2); setV3(DEFAULTS.v3)
  }, [])

  const t = tokens[theme]

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { -webkit-text-size-adjust: 100%; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; min-height: 100vh; min-height: 100dvh; overflow-x: hidden; }
          ::selection { background: rgba(91,79,207,0.18); color: #1a1832; }
          .app-bg { min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 24px 16px; }
          .blob { position: fixed; border-radius: 50%; filter: blur(60px); opacity: 0.35; animation: float 8s ease-in-out infinite; pointer-events: none; z-index: 0; will-change: transform; }
          .blob1 { width: 400px; height: 400px; top: -100px; right: -100px; animation-delay: 0s; }
          .blob2 { width: 300px; height: 300px; bottom: -80px; left: -80px; animation-delay: -3s; }
          .blob3 { width: 200px; height: 200px; top: 40%; left: 30%; animation-delay: -5s; }
          @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-24px) scale(1.04); } }
          @media (prefers-reduced-motion: reduce) { .blob { animation: none; } }
          .card { position: relative; z-index: 1; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 24px; padding: 32px 36px 36px; max-width: calc(100vw - 32px); width: fit-content; display: flex; flex-direction: column; }
          @media (max-width: 400px) { .card { padding: 24px 20px 28px; border-radius: 20px; } }
          .task-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px; }
          .rows-stack { display: flex; flex-direction: column; gap: 0; }
        `}</style>

        <div className="app-bg" style={{ background: t.bg }}>
          {/* Star animation canvas */}
          <StarCanvas theme={theme} />

          <div className="blob blob1" style={{ background: t.blob1 }} />
          <div className="blob blob2" style={{ background: t.blob2 }} />
          <div className="blob blob3" style={{ background: t.blob3 }} />

          <main
            className="card"
            role="main"
            aria-label="Samuel's age calculator"
            style={{
              background: t.card,
              border: `1px solid ${t.cardBorder}`,
              boxShadow: t.cardShadow,
              transition: 'background 300ms, box-shadow 300ms, border-color 300ms',
            }}
          >
            <ThemeToggle />
            <p className="task-label" aria-hidden="true" style={{ color: t.taskLabel }}>Task</p>
            <div className="rows-stack">
              <SamuelRow avatarSize={56}  value={v1} onChange={setV1} showArrow />
              <SamuelRow avatarSize={70}  value={v2} onChange={setV2} showArrow />
              <SamuelRow avatarSize={88}  value={v3} onChange={setV3} />
            </div>
            <ResetButton onReset={handleReset} />
          </main>
        </div>
      </>
    </ThemeContext.Provider>
  )
}
