import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate }                    from 'react-router-dom'

import Wordmark                                     from '../components/Wordmark.jsx'
import { useTimer, breakdownSeconds, pad2, getElapsedHours } from '../hooks/useTimer.js'
import { computeXP }                               from '../data/badges.js'
import { BENEFITS, benefitProgress }               from '../data/constants.js'

/* ═══════════════════════════════════════════════════════
   SLIPPED MODAL
   Steps: choose → count (if 'few') → message → popup
   popupType: null | 'relapse' | 'setback'
   ═══════════════════════════════════════════════════════ */
const SLIP_OPTIONS = [
  { key: 'one',  label: 'Just one cigarette' },
  { key: 'few',  label: 'A few cigarettes'   },
  { key: 'full', label: 'I relapsed fully'   },
]

/* Sum cigarettes logged today (including prospective) */
function computeDailyTotal(slipsList) {
  const today = new Date().toDateString()
  return slipsList
    .filter((s) => new Date(s.timestamp).toDateString() === today)
    .reduce((sum, s) => sum + s.count, 0)
}

/* Read quitDate from localStorage (bypasses React prop chain) */
function readStoredQuitDate() {
  try {
    const raw = localStorage.getItem('puffless_profile')
    if (!raw) return null
    const { quitDate } = JSON.parse(raw)
    return quitDate || null
  } catch { return null }
}

/* Format milliseconds as "Xd HH:MM" */
function formatElapsedDisplay(ms) {
  const clamped = Math.max(0, ms)
  const d = Math.floor(clamped / 86400000)
  const h = Math.floor((clamped % 86400000) / 3600000)
  const m = Math.floor((clamped % 3600000) / 60000)
  return `${d}d ${pad2(h)}:${pad2(m)}`
}

function SlippedModal({ profile, setProfile, slips, setSlips, onClose, onReset, navigate }) {
  const [step,              setStep]              = useState('choose')
  const [choice,            setChoice]            = useState(null)
  const [countStr,          setCountStr]          = useState('')
  const [slipType,          setSlipType]          = useState(null)

  /* Popup data */
  const [popupType,         setPopupType]         = useState(null)  // 'relapse' | 'setback'
  const [todayTotal,        setTodayTotal]        = useState(0)
  const [setbackHours,      setSetbackHours]      = useState(0)
  const [slipRatioPercent,  setSlipRatioPercent]  = useState(0)
  const [newElapsedDisplay, setNewElapsedDisplay] = useState('')

  const cpd = profile.cigarettesPerDay || 20

  /* ── Classification ──────────────────────────────────── */
  const classify = (n) => {
    if (n >= cpd)     return 'full_relapse'
    if (n >= cpd / 2) return 'significant_slip'
    return 'minor_slip'
  }

  /* ── Persist slip ────────────────────────────────────── */
  const saveSlip = (n, type) =>
    setSlips((prev) => [{
      id:        crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      count:     n,
      type,
    }, ...prev])

  /* ── Timer reset (full) ──────────────────────────────── */
  const resetNow = (label = 'unknown') => {
    const newProfile = { ...profile, quitDate: new Date().toISOString() }
    localStorage.setItem('puffless_profile', JSON.stringify(newProfile))
    setProfile(newProfile)
    // eslint-disable-next-line no-console
    console.log('quitdate-changed fired:', label, '| new quitDate:', newProfile.quitDate)
    window.dispatchEvent(new Event('quitdate-changed'))
  }

  /* ── Partial setback (significant slip) ─────────────── */
  const applyPartialSetback = () => {
    const storedQuitDate = readStoredQuitDate()
    if (!storedQuitDate) return

    const currentQuitMs = new Date(storedQuitDate).getTime()
    const elapsedMs     = Date.now() - currentQuitMs
    const setbackMs     = setbackHours * 3_600_000

    // New quitDate = now - (elapsed - setback)
    // → timer reads as (elapsed - setback) seconds
    let newQuitMs = Date.now() - (elapsedMs - setbackMs)

    // Safety: quitDate must never be in the future
    if (newQuitMs > Date.now()) newQuitMs = Date.now()

    const newQuitDate = new Date(newQuitMs).toISOString()
    const newProfile  = { ...profile, quitDate: newQuitDate }
    localStorage.setItem('puffless_profile', JSON.stringify(newProfile))
    setProfile(newProfile)
    // eslint-disable-next-line no-console
    console.log(
      'quitdate-changed fired: partial setback |',
      setbackHours, 'h back | new quitDate:', newQuitDate
    )
    window.dispatchEvent(new Event('quitdate-changed'))
  }

  /* ── Daily total check ───────────────────────────────── */
  const checkDailyTotal = (n, type) => {
    // Full relapse already resets the timer — no additional popup needed
    if (type === 'full_relapse') return

    const prospective = { timestamp: new Date().toISOString(), count: n, type }
    const total = computeDailyTotal([...slips, prospective])
    setTodayTotal(total)

    if (total >= cpd) {
      // Cumulative full relapse
      setPopupType('relapse')

    } else if (total >= cpd * 0.5) {
      // Partial setback: proportional to daily usage
      const ratio    = total / cpd
      const sbHours  = Math.round(ratio * 24 * 10) / 10   // rounded to 1 decimal
      const sbPct    = Math.round(ratio * 100)

      // Preview: what will the timer show after the setback is applied?
      const storedQd   = readStoredQuitDate()
      const storedQdMs = storedQd ? new Date(storedQd).getTime() : Date.now()
      const elapsedMs  = Date.now() - storedQdMs
      const afterMs    = Math.max(0, elapsedMs - sbHours * 3_600_000)

      setSetbackHours(sbHours)
      setSlipRatioPercent(sbPct)
      setNewElapsedDisplay(formatElapsedDisplay(afterMs))
      setPopupType('setback')
    }
    // Below 50% CPD: no popup, no change
  }

  /* ── Auto-close for full-relapse message step ────────── */
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (step !== 'message' || slipType !== 'full_relapse') return
    const timer = setTimeout(() => onCloseRef.current(), 2000)
    return () => clearTimeout(timer)
  }, [step, slipType])

  /* ── Step handlers ───────────────────────────────────── */
  const handleOption = (key) => {
    setChoice(key)

    if (key === 'one') {
      const type = classify(1)
      checkDailyTotal(1, type)
      saveSlip(1, type)
      setSlipType(type)
      if (type !== 'full_relapse') window.dispatchEvent(new Event('minor-slip-logged'))
      setStep('message')

    } else if (key === 'full') {
      saveSlip(cpd, 'full_relapse')
      setSlipType('full_relapse')
      resetNow('1 — I relapsed fully button')
      onReset()
      setStep('message')

    } else {
      setStep('count')
    }
  }

  const handleCountConfirm = () => {
    const n = parseInt(countStr, 10)
    if (!n || n < 1) return
    const type = classify(n)
    checkDailyTotal(n, type)
    saveSlip(n, type)
    setSlipType(type)
    if (type === 'full_relapse') {
      resetNow('2 — a few cigarettes (count >= cpd)')
      onReset()
    } else {
      window.dispatchEvent(new Event('minor-slip-logged'))
    }
    setStep('message')
  }

  /* After confirmation message: go to popup if needed */
  const handleMessageClose = () => {
    if (popupType) setStep('popup')
    else           onClose()
  }

  /* Relapse popup: yes, reset timer */
  const handleRelapseReset = () => {
    resetNow('3 — cumulative daily total >= cpd popup')
    onReset()
    onClose()
  }

  /* Relapse popup: keep timer, note on slip */
  const handleKeepTimer = () => {
    setSlips((prev) => {
      if (!prev.length) return prev
      const [latest, ...rest] = prev
      return [{ ...latest, timerKept: true }, ...rest]
    })
    onClose()
  }

  /* Setback popup: apply partial setback → navigate to Benefits */
  const handleSetbackConfirm = () => {
    applyPartialSetback()
    onClose()
    navigate('/benefits')
  }

  const getMessage = () => {
    const n = parseInt(countStr, 10) || 1
    if (choice === 'one')
      return "One cigarette. That's it. Timer continues — don't let one mistake become two."
    if (choice === 'full')
      return "Starting over takes more courage than never having tried. Your badges are safe. Let's go again."
    if (slipType === 'full_relapse')
      return "That's a full day's worth. Timer reset. Your healing starts now again."
    if (slipType === 'significant_slip')
      return `That's a big slip — ${n} cigarettes. Timer keeps running but take this seriously. What triggered it?`
    return `${n} cigarettes. Your body is still well ahead of where you started. Don't let it become more.`
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-sheet">

        {/* Step 1 — choose */}
        {step === 'choose' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
              It happens.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              One slip doesn't erase your progress. What happened?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SLIP_OPTIONS.map(({ key, label }) => (
                <button key={key} className="btn-ghost" onClick={() => handleOption(key)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — count (only for 'few') */}
        {step === 'count' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
              How many?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Be honest — it helps you understand your patterns.
            </p>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder={`Your usual is ${cpd}/day`}
              value={countStr}
              onChange={(e) => setCountStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCountConfirm()}
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <button className="btn-primary" onClick={handleCountConfirm} style={{ marginBottom: 10 }}>
              Continue
            </button>
            <button className="btn-ghost" onClick={() => setStep('choose')}>
              ← Back
            </button>
          </>
        )}

        {/* Step 3 — confirmation message */}
        {step === 'message' && (
          <>
            <p className="text-accent" style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
              {getMessage()}
            </p>
            {slipType === 'full_relapse' ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                Closing automatically…
              </p>
            ) : (
              <button className="btn-primary" onClick={handleMessageClose}>
                I'm back. Let's go.
              </button>
            )}
          </>
        )}

        {/* Step 4a — full relapse popup (cumulative >= cpd) */}
        {step === 'popup' && popupType === 'relapse' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
              That adds up to a full day.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              You've smoked {todayTotal} cigarettes today — that's your usual daily amount.
              Do you want to reset your timer?
            </p>
            <button className="btn-primary" style={{ marginBottom: 10 }} onClick={handleRelapseReset}>
              Yes, reset my timer
            </button>
            <button className="btn-ghost" onClick={handleKeepTimer}>
              No, keep my timer
            </button>
          </>
        )}

        {/* Step 4b — partial setback popup (cumulative >= 50% CPD) */}
        {step === 'popup' && popupType === 'setback' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
              Setback logged.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              You smoked {todayTotal} cigarettes today — that's {slipRatioPercent}% of your
              usual amount. Your timer has been set back {setbackHours} hours. Your benefits
              have adjusted. Keep going.
            </p>

            {/* New elapsed preview */}
            <div style={{
              background: 'rgba(232,168,56,0.08)',
              border: '1px solid rgba(232,168,56,0.25)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 24,
            }}>
              <p style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 4,
                          textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500 }}>
                You're now at
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--orange)',
                          letterSpacing: '-1px', lineHeight: 1 }}>
                {newElapsedDisplay}
              </p>
            </div>

            <button className="btn-primary" onClick={handleSetbackConfirm}>
              Understood. Back to it.
            </button>
          </>
        )}

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   HOME SCREEN
   All hooks before any conditional return.
   ═══════════════════════════════════════════════════════ */
export default function Home({
  profile, setProfile,
  cravings,
  slips, setSlips,
  openCraving,
  showToastMsg,
}) {
  const navigate = useNavigate()

  const elapsedSeconds = useTimer(profile?.quitDate)
  const { d, h, m, s } = breakdownSeconds(elapsedSeconds)
  const { level, progress, xpInLevel, xpPerLevel } = computeXP(elapsedSeconds, cravings)

  /* Force re-render on quitDate change event */
  const [, setTimerTrigger] = useState(0)
  useEffect(() => {
    const handler = () => setTimerTrigger((n) => n + 1)
    window.addEventListener('quitdate-changed', handler)
    return () => window.removeEventListener('quitdate-changed', handler)
  }, [])

  /* Timer pulse on minute flip */
  const timerRef      = useRef(null)
  const prevMinuteRef = useRef(-1)

  useEffect(() => {
    const currentMinute = Math.floor(elapsedSeconds / 60)
    if (elapsedSeconds > 0 && currentMinute !== prevMinuteRef.current) {
      prevMinuteRef.current = currentMinute
      const el = timerRef.current
      if (el) {
        el.classList.remove('timer-pulse')
        void el.offsetWidth
        el.classList.add('timer-pulse')
      }
    }
  }, [elapsedSeconds])

  const [slipped, setSlipped] = useState(false)

  const handleTimerReset = useCallback(() => {
    showToastMsg('Timer reset. Starting fresh now. Your badges are safe. 💜')
    setTimeout(() => navigate('/'), 2000)
  }, [showToastMsg, navigate])

  /* Safety guard — after all hooks */
  if (!profile?.quitDate) return <Navigate to="/" replace />

  /* Derived stats */
  const elapsedDays  = elapsedSeconds / 86400
  const cigsAvoided  = Math.floor(elapsedDays * profile.cigarettesPerDay)
  const moneySaved   = ((cigsAvoided / profile.cigarettesPerPack) * profile.costPerPack).toFixed(2)
  const minutesSaved = cigsAvoided * 5
  const hoursSaved   = minutesSaved >= 60
    ? `${(minutesSaved / 60).toFixed(1)}h`
    : `${minutesSaved}m`

  /* Body snapshot — read quitDate fresh from localStorage */
  const _ws       = BENEFITS.map((b) => ({ ...b, ...benefitProgress(b, getElapsedHours()) }))
  const _active   = _ws.filter((b) => b.status === 'active').sort((a, b) => b.pct - a.pct)
  const _complete = _ws.filter((b) => b.status === 'complete').sort((a, b) => b.fullAt - a.fullAt)
  const _locked   = _ws.filter((b) => b.status === 'locked').sort((a, b) => a.startsAt - b.startsAt)
  const bodyBenefits = [..._active, ..._complete, ..._locked].slice(0, 3)

  return (
    <div className="screen">
      <div className="top-bar">
        <Wordmark size={26} />
        <span className="chip accent">Lv {level} · {xpInLevel} XP</span>
      </div>

      <div className="xp-row">
        <div className="xp-bar">
          <div className="xp-bar-fill"
               style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="xp-label">{xpInLevel} / {xpPerLevel}</span>
      </div>

      <div className="hero-timer">
        <p className="label" style={{ marginBottom: 12 }}>Smoke-free for</p>
        <div
          ref={timerRef}
          className="hero-time-grid"
          onAnimationEnd={() => timerRef.current?.classList.remove('timer-pulse')}
        >
          <div className="hero-time-seg">
            <span className="hero-time-num">{pad2(d)}</span>
            <span className="hero-time-unit">days</span>
          </div>
          <span className="hero-time-sep">:</span>
          <div className="hero-time-seg">
            <span className="hero-time-num">{pad2(h)}</span>
            <span className="hero-time-unit">hrs</span>
          </div>
          <span className="hero-time-sep">:</span>
          <div className="hero-time-seg">
            <span className="hero-time-num">{pad2(m)}</span>
            <span className="hero-time-unit">min</span>
          </div>
          <span className="hero-time-sep">:</span>
          <div className="hero-time-seg">
            <span className="hero-time-num">{pad2(s)}</span>
            <span className="hero-time-unit">sec</span>
          </div>
        </div>
      </div>

      <div className="stats-grid mt-4">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <span className="stat-value">{cigsAvoided}</span>
          <span className="stat-label">cigarettes avoided</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--complete)' }}>
          <span className="stat-value">€{moneySaved}</span>
          <span className="stat-label">money saved</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{hoursSaved}</span>
          <span className="stat-label">life time saved</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {cravings.filter((c) => c.completed ?? c.resisted).length}
          </span>
          <span className="stat-label">cravings beaten</span>
        </div>
      </div>

      <button className="btn-panic mt-20" onClick={openCraving}
              aria-label="Open craving panic mode">
        <span className="panic-dot" aria-hidden="true" />
        <span className="panic-text">
          <span className="panic-title">I'm craving right now</span>
          <span className="panic-subtitle">Tap for your panic button</span>
        </span>
        <span className="panic-arrow" aria-hidden="true">→</span>
      </button>

      <button className="btn-muted mt-4" onClick={() => setSlipped(true)}
              aria-label="Log a slip">
        〰️ I slipped
      </button>

      {bodyBenefits.length > 0 && (
        <div className="body-snapshot">
          <p className="body-snapshot-title">Body right now</p>
          {bodyBenefits.map((b) => {
            const pct    = Math.round(b.pct)
            const pctLbl =
              b.status === 'active'    ? `${pct}%`
              : b.status === 'complete' ? '100%'
              :                          'Soon'
            return (
              <div key={b.id} className="body-snap-card">
                <div className="body-snap-header">
                  <span className="body-snap-icon" aria-hidden="true">{b.icon}</span>
                  <span className="body-snap-name">{b.title}</span>
                  <span className={`body-snap-pct ${b.status}`}>{pctLbl}</span>
                </div>
                <div className="body-snap-bar">
                  <div className={`body-snap-fill ${b.status}`}
                       style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {slipped && (
        <SlippedModal
          profile={profile}
          setProfile={setProfile}
          slips={slips}
          setSlips={setSlips}
          onClose={() => setSlipped(false)}
          onReset={handleTimerReset}
          navigate={navigate}
        />
      )}
    </div>
  )
}
