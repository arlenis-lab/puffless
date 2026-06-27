import { useState, useEffect } from 'react'

/* ── Storage helpers ────────────────────────────────────── */

const PROFILE_KEY = 'puffless_profile'

/**
 * Read the quitDate string directly from localStorage.
 * Returns null if not found or if parsing fails.
 * This bypasses the React prop chain so resets are visible immediately.
 */
function readStoredQuitDate() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const { quitDate } = JSON.parse(raw)
    return quitDate || null
  } catch {
    return null
  }
}

/**
 * Returns elapsed time in hours since quit, reading quitDate
 * fresh from localStorage on every call.
 * Import this in components that calculate benefit percentages
 * so the values are always based on the live storage value.
 */
export function getElapsedHours() {
  const qd = readStoredQuitDate()
  if (!qd) return 0
  return Math.max(0, (Date.now() - new Date(qd).getTime()) / 3_600_000)
}

/* ── Hook ───────────────────────────────────────────────── */

/**
 * Returns the number of whole seconds elapsed since `quitDate`.
 *
 * On every 1-second tick: reads quitDate fresh from localStorage
 * so any reset (even one not yet reflected in props) takes effect
 * at the very next interval.
 *
 * Also listens for the 'quitdate-changed' custom event to recalculate
 * immediately — without waiting for the next tick.
 */
export function useTimer(quitDateFallback) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const calc = () => {
      /* Prefer the value in localStorage (written synchronously before
         the 'quitdate-changed' event fires) over the React prop, which
         may still reflect the old quitDate at this point in the render
         cycle. Fall back to the prop for the very first mount. */
      const qd = readStoredQuitDate() ?? quitDateFallback
      if (!qd) { setElapsedSeconds(0); return }
      const diff = Date.now() - new Date(qd).getTime()
      setElapsedSeconds(Math.max(0, Math.floor(diff / 1000)))
    }

    calc()                                              // immediate first tick
    const interval = setInterval(calc, 1000)           // regular 1-second ticks
    window.addEventListener('quitdate-changed', calc)  // instant reset response

    return () => {
      clearInterval(interval)
      window.removeEventListener('quitdate-changed', calc)
    }
  }, [quitDateFallback])

  return elapsedSeconds
}

/* ── Utilities ──────────────────────────────────────────── */

/**
 * Break an elapsed-seconds value into { d, h, m, s } parts.
 */
export function breakdownSeconds(totalSeconds) {
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { d, h, m, s }
}

/**
 * Zero-pad a number to at least 2 digits.
 */
export function pad2(n) {
  return String(n).padStart(2, '0')
}
