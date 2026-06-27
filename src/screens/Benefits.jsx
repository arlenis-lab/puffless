import { useState, useEffect, useRef } from 'react'
import { Navigate }                    from 'react-router-dom'

import { useTimer, getElapsedHours }         from '../hooks/useTimer.js'
import { BENEFITS, benefitProgress, fmtHours } from '../data/constants.js'

/* ── Live clock formatter ───────────────────────────────── */
function formatClock(date) {
  return date.toLocaleString(undefined, {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/* ═══════════════════════════════════════════════════════
   BENEFIT DETAIL POPUP
   ═══════════════════════════════════════════════════════ */
function BenefitDetail({ benefit, elapsedHours, onClose }) {
  const { pct, status } = benefitProgress(benefit, elapsedHours)
  const roundedPct      = Math.round(pct)

  /* Animation state */
  const [entered,     setEntered]     = useState(false) // drives .entered class → slide up
  const [animatedPct, setAnimatedPct] = useState(0)     // progress bar fills from 0

  /* Detect reduced-motion preference once — safe since it won't change at runtime */
  const noMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  /* Captured at mount so the effect dep-array stays empty without lint warnings */
  const pctAtMount = useRef(roundedPct).current

  useEffect(() => {
    /* Double rAF: lets the browser paint the off-screen initial state before
       we add .entered, so the CSS transition actually plays */
    let rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => setEntered(true))
    })

    /* Progress bar: start filling after 200 ms (or immediately if reduced motion) */
    const barTimer = setTimeout(
      () => setAnimatedPct(pctAtMount),
      noMotion ? 0 : 200
    )

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(barTimer)
    }
  }, []) // intentionally empty — runs once on mount

  const handleClose = () => {
    setEntered(false)                                    // trigger slide-down
    setTimeout(onClose, noMotion ? 0 : 350)             // unmount after animation
  }

  /* "Estimated completion" date */
  const hoursRemaining = benefit.fullAt - elapsedHours
  const completionDate = new Date(Date.now() + hoursRemaining * 3_600_000)
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  /* What the percentage label looks like */
  const pctLabel =
    status === 'complete' ? '100%'
    : status === 'active'  ? `${roundedPct}%`
    :                        'Not started yet'

  return (
    <>
      {/* Backdrop — closes on tap */}
      <div className="bd-overlay" onClick={handleClose} aria-hidden="true" />

      {/* Sheet */}
      <div
        className={`bd-sheet${entered ? ' entered' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${benefit.title} detail`}
      >
        {/* Drag handle */}
        <div className="bd-handle" />

        {/* Close button */}
        <button className="bd-close" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {/* ── 1. HEADER ─────────────────────────────────── */}
        <div className="bd-icon" aria-hidden="true">{benefit.icon}</div>
        <h2 className="bd-title">{benefit.title}</h2>
        <p className="bd-subtitle">{benefit.subtitle}</p>

        {/* ── 2. PROGRESS SECTION ───────────────────────── */}
        <div className="bd-progress-box">
          <div className="bd-row">
            <span className="bd-label-sm">Your progress</span>
            <span className={`bd-pct-value ${status}`}>{pctLabel}</span>
          </div>

          <div className="bd-bar" role="progressbar"
               aria-valuenow={roundedPct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`bd-bar-fill ${status}`}
              style={{ width: `${animatedPct}%` }}
            />
          </div>

          <div className="bd-row">
            {status === 'complete' ? (
              <>
                <span />
                <span className="bd-complete-tag">✓ Fully healed</span>
              </>
            ) : (
              <>
                <span className="bd-label-sm">Estimated completion</span>
                <span className="bd-date">{completionDate}</span>
              </>
            )}
          </div>
        </div>

        {/* ── 3. WHAT'S HAPPENING ───────────────────────── */}
        <p className="bd-section-label">What's happening</p>
        <p className="bd-body-text">{benefit.detail}</p>

        {/* ── 4. WHAT YOU'LL NOTICE ─────────────────────── */}
        <p className="bd-section-label" style={{ marginTop: 20 }}>
          What you might notice
        </p>
        <ul className="bd-notices">
          {benefit.notices.map((notice, i) => (
            <li key={i} className="bd-notice-item">
              <span className="bd-notice-dot" aria-hidden="true" />
              <span className="bd-body-text">{notice}</span>
            </li>
          ))}
        </ul>

        {/* ── 5. MOTIVATIONAL CLOSE ─────────────────────── */}
        <div className="bd-motivation">
          <p>{benefit.motivation}</p>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   BENEFIT CARD (list item on the Benefits screen)
   ═══════════════════════════════════════════════════════ */
function BenefitCard({ benefit, elapsedHours, onClick }) {
  const { pct, status } = benefitProgress(benefit, elapsedHours)
  const roundedPct      = Math.round(pct)

  const pctLabel =
    status === 'complete' ? '✓ 100%'
    : status === 'active'  ? `${roundedPct}%`
    :                        `Starts at ${fmtHours(benefit.startsAt)}`

  const descText =
    status === 'locked'
      ? `Keep going — unlocks at ${fmtHours(benefit.startsAt)}`
      : benefit.description

  return (
    <div
      className={`benefit-card${status === 'complete' ? ' complete' : status === 'locked' ? ' locked' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`${benefit.title} — ${pctLabel}. Tap for details.`}
    >
      <div className="benefit-card-top">
        <span className="benefit-icon" aria-hidden="true">{benefit.icon}</span>

        <div className="benefit-title-block">
          <p className="benefit-title">{benefit.title}</p>
          <p className="benefit-subtitle">{benefit.subtitle}</p>
        </div>

        <span className={`benefit-pct ${status}`}>{pctLabel}</span>
      </div>

      <div
        className="benefit-bar"
        role="progressbar"
        aria-valuenow={roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${benefit.title} recovery progress`}
      >
        <div className={`benefit-bar-fill ${status}`} style={{ width: `${roundedPct}%` }} />
      </div>

      <p className="benefit-desc">{descText}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   BENEFITS SCREEN
   ═══════════════════════════════════════════════════════ */
export default function Benefits({ profile }) {
  /* ── All hooks before any conditional return ────────── */
  const elapsedSeconds = useTimer(profile?.quitDate)

  /* Read quitDate fresh from localStorage on every render — this is the
     authoritative source for benefit percentages. The forceUpdate counter
     ensures we re-render immediately when 'quitdate-changed' fires, before
     the React prop chain has had a chance to propagate the new quitDate. */
  const elapsedHours = getElapsedHours()
  // eslint-disable-next-line no-console
  console.log('Benefits render | elapsedHours:', elapsedHours.toFixed(4))

  const [clockStr, setClockStr] = useState(() => formatClock(new Date()))
  useEffect(() => {
    setClockStr(formatClock(new Date()))
  }, [elapsedSeconds])

  const [selectedBenefit, setSelectedBenefit] = useState(null)

  /* Minor-slip reassurance banner ─────────────────────── */
  const [showBanner, setShowBanner] = useState(false)
  const [bannerKey,  setBannerKey]  = useState(0)    // increments to restart animation
  const bannerTimer = useRef(null)

  useEffect(() => {
    const handler = () => {
      setShowBanner(true)
      setBannerKey((k) => k + 1)
      clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setShowBanner(false), 5100)
    }
    window.addEventListener('minor-slip-logged', handler)
    return () => {
      window.removeEventListener('minor-slip-logged', handler)
      clearTimeout(bannerTimer.current)
    }
  }, [])

  /* Re-render immediately when a slip resets quitDate */
  const [, setForceUpdate] = useState(0)
  useEffect(() => {
    const handler = () => setForceUpdate((n) => n + 1)
    window.addEventListener('quitdate-changed', handler)
    return () => window.removeEventListener('quitdate-changed', handler)
  }, [])

  if (!profile?.quitDate) return <Navigate to="/" replace />

  /* Compute + sort */
  const withStatus = BENEFITS.map((b) => ({ ...b, ...benefitProgress(b, elapsedHours) }))

  const sorted = [...withStatus].sort((a, b) => {
    const order = { complete: 0, active: 1, locked: 2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    if (a.status === 'complete') return a.startsAt - b.startsAt
    if (a.status === 'active')  return b.pct - a.pct
    return a.startsAt - b.startsAt
  })

  const completeCount = withStatus.filter((b) => b.status === 'complete').length
  const activeCount   = withStatus.filter((b) => b.status === 'active').length

  return (
    <>
      <div className="screen">
        {/* Header */}
        <div className="benefits-header">
          <h1 className="benefits-title">Your body<br />right now</h1>
          <p className="benefits-clock">{clockStr}</p>
        </div>

        {/* Minor-slip reassurance banner */}
        {showBanner && (
          <div key={bannerKey} className="slip-banner">
            ⚡ Your benefits are still intact. One slip doesn't erase your progress.
          </div>
        )}

        {/* Summary bar */}
        <div className="benefit-summary">
          <div className="benefit-summary-col">
            <span className="benefit-summary-num" style={{ color: 'var(--accent)' }}>
              {activeCount}
            </span>
            <span className="benefit-summary-label">Active</span>
          </div>
          <div className="benefit-summary-col">
            <span className="benefit-summary-num" style={{ color: 'var(--complete)' }}>
              {completeCount}
            </span>
            <span className="benefit-summary-label">Complete</span>
          </div>
          <div className="benefit-summary-col">
            <span className="benefit-summary-num" style={{ color: 'var(--muted)' }}>
              {BENEFITS.length}
            </span>
            <span className="benefit-summary-label">Total</span>
          </div>
        </div>

        {/* Benefit cards */}
        {sorted.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            elapsedHours={elapsedHours}
            onClick={() => setSelectedBenefit(benefit)}
          />
        ))}
      </div>

      {/* Detail popup — rendered outside .screen so it overlays everything */}
      {selectedBenefit && (
        <BenefitDetail
          benefit={selectedBenefit}
          elapsedHours={elapsedHours}
          onClose={() => setSelectedBenefit(null)}
        />
      )}
    </>
  )
}
