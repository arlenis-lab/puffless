import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate }    from 'react-router-dom'

import { useLocalStorage }    from './hooks/useLocalStorage.js'
import { getEarnedBadgeIds }  from './data/badges.js'

import BottomNav        from './components/BottomNav.jsx'
import Onboarding       from './screens/Onboarding.jsx'
import Home             from './screens/Home.jsx'
import Progress         from './screens/Progress.jsx'
import Benefits         from './screens/Benefits.jsx'
import Cravings         from './screens/Cravings.jsx'
import Settings         from './screens/Settings.jsx'
import CravingTakeover  from './screens/CravingTakeover.jsx'

export default function App() {
  const navigate = useNavigate()

  /* ── Persisted state ───────────────────────────────── */
  const [profile,      setProfile]      = useLocalStorage('puffless_profile',  null)
  const [cravings,     setCravings]     = useLocalStorage('puffless_cravings', [])
  const [earnedBadges, setEarnedBadges] = useLocalStorage('puffless_badges',   [])
  const [slips,        setSlips]        = useLocalStorage('puffless_slips',    [])

  /* ── Badge unlock tracking ─────────────────────────── */
  const [newBadgeIds, setNewBadgeIds] = useState([])

  useEffect(() => {
    if (!profile?.quitDate) return

    const check = () => {
      const current = getEarnedBadgeIds(profile.quitDate)
      setEarnedBadges((prev) => {
        const freshOnes = current.filter((id) => !prev.includes(id))
        if (freshOnes.length > 0) {
          setNewBadgeIds((n) => [...new Set([...n, ...freshOnes])])
          return current
        }
        return prev
      })
    }

    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [profile?.quitDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearNewBadge = (id) =>
    setNewBadgeIds((prev) => prev.filter((x) => x !== id))

  /* ── Craving takeover ──────────────────────────────── */
  const [showCraving, setShowCraving] = useState(false)

  const openCraving = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    setShowCraving(true)
  }, [])

  const saveCraving = useCallback((data) => {
    setCravings((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev])
    setShowCraving(false)
    navigate('/')
    showToastMsg('✅ Craving beaten! +100 XP')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCravings, navigate])

  /* ── Toast ─────────────────────────────────────────── */
  const [toast, setToast]    = useState(null)
  const toastTimer           = useRef(null)

  function showToastMsg(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  /* ── Reset everything ──────────────────────────────── */
  const resetAll = () => {
    setProfile(null)
    setCravings([])
    setEarnedBadges([])
    setNewBadgeIds([])
    setSlips([])
    setShowCraving(false)
    setToast(null)
  }

  /* ── Shared props ──────────────────────────────────── */
  const shared = {
    profile,
    setProfile,
    cravings,
    setCravings,
    earnedBadges,
    setEarnedBadges,
    newBadgeIds,
    clearNewBadge,
    resetAll,
    openCraving,
    showToastMsg,
    slips,
    setSlips,
  }

  /* ── Guard: onboarding if no profile ──────────────── */
  if (!profile?.quitDate) {
    return (
      <div className="app-shell">
        <Onboarding onComplete={(p) => setProfile(p)} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/"          element={<Home     {...shared} />} />
        <Route path="/progress"  element={<Progress {...shared} />} />
        <Route path="/benefits"  element={<Benefits {...shared} />} />
        <Route path="/cravings"  element={<Cravings {...shared} />} />
        <Route path="/settings"  element={<Settings {...shared} />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom nav — hidden while craving overlay is open */}
      <BottomNav hidden={showCraving} />

      {/* Fullscreen craving takeover */}
      {showCraving && (
        <CravingTakeover
          cravingNumber={cravings.length + 1}
          onDismiss={() => setShowCraving(false)}
          onSave={saveCraving}
        />
      )}

      {/* Toast notification */}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
