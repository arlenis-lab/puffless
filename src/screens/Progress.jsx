import { useEffect, useRef } from 'react'
import { Navigate }          from 'react-router-dom'

import Wordmark            from '../components/Wordmark.jsx'
import { useTimer }        from '../hooks/useTimer.js'
import { BADGES, computeXP } from '../data/badges.js'

export default function Progress({
  profile,
  cravings,
  earnedBadges,
  newBadgeIds,
  clearNewBadge,
}) {
  // Safety guard
  if (!profile?.quitDate) return <Navigate to="/" replace />

  const elapsedSeconds = useTimer(profile.quitDate)
  const { level, progress, xpInLevel, xpPerLevel, totalXP } = computeXP(
    elapsedSeconds,
    cravings
  )

  const beatenCount     = cravings.filter((c) => c.completed ?? c.resisted).length
  const elapsedDays     = Math.floor(elapsedSeconds / 86400)
  const nextBadge       = BADGES.find((b) => !earnedBadges.includes(b.id))

  return (
    <div className="screen">
      <div className="top-bar">
        <Wordmark size={26} />
      </div>

      {/* Level card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="label">Level</p>
            <p style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, marginTop: 4 }}>
              {level}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="label">Total XP</p>
            <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', marginTop: 4 }}>
              {totalXP}
            </p>
          </div>
        </div>

        <div className="xp-row mt-16">
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="xp-label">{xpInLevel} / {xpPerLevel} XP</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid mt-12">
        <div className="stat-card">
          <span className="stat-value">{elapsedDays}</span>
          <span className="stat-label">days smoke-free</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{beatenCount}</span>
          <span className="stat-label">cravings defeated</span>
        </div>
      </div>

      {/* Next badge hint */}
      {nextBadge && (
        <div className="card-sm mt-12" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 24, opacity: 0.5 }}>{nextBadge.emoji}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Next: {nextBadge.name}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {nextBadge.desc} — at {nextBadge.hours}h
            </p>
          </div>
        </div>
      )}

      {/* Badges grid */}
      <div className="section-hd mt-20">
        <span className="section-title">Badges</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {earnedBadges.length} / {BADGES.length}
        </span>
      </div>

      <div className="badges-grid">
        {BADGES.map((badge) => {
          const earned   = earnedBadges.includes(badge.id)
          const isNew    = newBadgeIds.includes(badge.id)
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earned}
              isNew={isNew}
              onAnimDone={() => clearNewBadge(badge.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ── Badge card with unlock animation ─────────────────── */
function BadgeCard({ badge, earned, isNew, onAnimDone }) {
  const ref = useRef(null)

  // Trigger badge-unlock animation when isNew flips to true
  useEffect(() => {
    if (!isNew || !ref.current) return
    const el = ref.current
    el.classList.remove('badge--new')
    void el.offsetWidth
    el.classList.add('badge--new')
  }, [isNew])

  return (
    <div
      ref={ref}
      className={`badge-card${earned ? '' : ' locked'}`}
      onAnimationEnd={() => {
        ref.current?.classList.remove('badge--new')
        onAnimDone()
      }}
    >
      <span className="badge-emoji">{badge.emoji}</span>
      <span className="badge-name">{badge.name}</span>
      <span className="badge-desc">{badge.desc}</span>
    </div>
  )
}
