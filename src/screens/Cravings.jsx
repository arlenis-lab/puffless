import { useState }  from 'react'
import { Navigate }  from 'react-router-dom'
import Wordmark      from '../components/Wordmark.jsx'

/* ── Mode icons (craving games) ─────────────────────────── */
const MODE_ICONS = {
  breathing: '🫁',
  tap:       '👆',
  facts:     '🧠',
  memory:    '🎮',
}

/* ── Slip severity order (higher = worse) ───────────────── */
const SEVERITY = { minor_slip: 0, significant_slip: 1, full_relapse: 2 }

/* ── Slip type badge display ────────────────────────────── */
const TYPE_BADGE = {
  full_relapse:     { label: 'Relapse',     color: 'var(--danger)' },
  significant_slip: { label: 'Significant',  color: 'var(--orange)' },
  minor_slip:       { label: 'Minor',        color: 'var(--muted)'  },
}

/* ── Helpers ────────────────────────────────────────────── */
function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getDayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function getDayLabel(iso) {
  const d   = new Date(iso)
  const now = new Date()
  const yest = new Date(now); yest.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString())  return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric' })
}

function worstType(slips) {
  return slips.reduce((w, s) =>
    SEVERITY[s.type] > SEVERITY[w.type] ? s : w
  ).type
}

/* Group slips into [{date, slips[]}] sorted most-recent-first */
function groupByDay(slips) {
  const map = new Map()
  for (const s of slips) {
    const key = getDayKey(s.timestamp)
    if (!map.has(key)) map.set(key, { firstTs: s.timestamp, slips: [] })
    map.get(key).slips.push(s)
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.firstTs) - new Date(a.firstTs)
  )
}

/* ── Cravings tab ───────────────────────────────────────── */
function CravingsTab({ cravings, openCraving }) {
  const totalXP     = cravings.reduce((s, c) => s + (c.xpEarned ?? c.xp ?? 0), 0)
  const beatenCount = cravings.filter((c) => c.completed ?? c.resisted).length

  return (
    <>
      <button
        onClick={openCraving}
        style={{
          width: '100%', marginTop: 4,
          background: 'transparent',
          border: '1.5px solid var(--accent)',
          borderRadius: 14, padding: 18,
          color: 'var(--accent)', fontSize: 16, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent', textAlign: 'center',
        }}
      >
        ⚡ Log a craving
      </button>

      {cravings.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <span className="chip">{cravings.length} logged</span>
          <span className="chip accent">{beatenCount} beaten</span>
          <span className="chip accent">+{totalXP} XP</span>
        </div>
      )}

      {cravings.length === 0 ? (
        <div className="empty-state mt-32">
          <span className="empty-icon">⚡</span>
          <p style={{ fontWeight: 600, color: 'var(--text)' }}>No cravings yet</p>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}>
            When you feel the urge, tap the button.<br />
            Every one you beat earns XP.
          </p>
        </div>
      ) : (
        <div className="mt-16 gap-stack-sm">
          {cravings.map((c) => {
            const xp     = c.xpEarned ?? c.xp ?? 0
            const beaten = c.completed ?? c.resisted ?? false
            const icon   = MODE_ICONS[c.mode]
            return (
              <div key={c.id} className="craving-item">
                <div className="craving-info">
                  <p className="craving-title">
                    {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
                    {beaten ? '✅ Beaten' : '📝 Logged'}
                  </p>
                  <p className="craving-meta">
                    {formatTime(c.timestamp)}
                    {c.mode && ` · ${c.mode}`}
                  </p>
                </div>
                <span className="craving-xp">+{xp} XP</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ── Slips tab — grouped by calendar day ────────────────── */
function SlipsTab({ slips }) {
  if (slips.length === 0) {
    return (
      <div className="empty-state mt-32">
        <span className="empty-icon">🟢</span>
        <p style={{ fontWeight: 600, color: 'var(--text)' }}>No slips logged</p>
        <p style={{ fontSize: 13, lineHeight: 1.5 }}>
          If you smoke, log it here honestly.<br />
          It helps you see your patterns.
        </p>
      </div>
    )
  }

  const groups = groupByDay(slips)

  return (
    <div className="mt-4">
      {groups.map((group) => {
        const totalCigs = group.slips.reduce((sum, s) => sum + s.count, 0)
        const worst     = worstType(group.slips)
        const badge     = TYPE_BADGE[worst] ?? { label: worst, color: 'var(--muted)' }
        const hadReset  = group.slips.some((s) => s.type === 'full_relapse')
        const n         = group.slips.length

        return (
          <div key={group.firstTs} className="slip-day-section">
            {/* Date label above the card */}
            <p className="slip-day-header">{getDayLabel(group.firstTs)}</p>

            <div className="slip-day-card">
              {/* Top row: cigarette count + type badge */}
              <div className="slip-day-top">
                <div className="slip-day-left">
                  <span className="slip-day-cigs">{totalCigs}</span>
                  <span className="slip-day-unit">
                    cigarette{totalCigs === 1 ? '' : 's'}
                  </span>
                </div>
                <span
                  className="slip-day-badge"
                  style={{ color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>

              {/* Bottom row: slip count + timer reset indicator */}
              <p className="slip-day-meta">
                {n} slip{n === 1 ? '' : 's'} logged
              </p>
              {hadReset && (
                <p className="slip-day-reset">⟳ Timer was reset this day</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Cravings screen ────────────────────────────────────── */
export default function Cravings({ profile, cravings, slips = [], openCraving }) {
  if (!profile?.quitDate) return <Navigate to="/" replace />

  const [activeTab, setActiveTab] = useState('cravings')

  return (
    <div className="screen">
      <div className="top-bar">
        <Wordmark size={26} />
      </div>

      <div className="screen-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'cravings'}
          className={`screen-tab${activeTab === 'cravings' ? ' active' : ''}`}
          onClick={() => setActiveTab('cravings')}
        >
          ⚡ Cravings{cravings.length > 0 && ` · ${cravings.length}`}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'slips'}
          className={`screen-tab${activeTab === 'slips' ? ' active' : ''}`}
          onClick={() => setActiveTab('slips')}
        >
          🚬 Slips{slips.length > 0 && ` · ${slips.length}`}
        </button>
      </div>

      {activeTab === 'cravings'
        ? <CravingsTab cravings={cravings} openCraving={openCraving} />
        : <SlipsTab    slips={slips} />
      }
    </div>
  )
}
