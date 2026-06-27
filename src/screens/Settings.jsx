import { useState }   from 'react'
import { Navigate }   from 'react-router-dom'

import Wordmark from '../components/Wordmark.jsx'

const NOW_ISO = () => new Date().toISOString().slice(0, 16)

export default function Settings({ profile, setProfile, resetAll }) {
  if (!profile?.quitDate) return <Navigate to="/" replace />

  const [editing,  setEditing]  = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [form,     setForm]     = useState({
    name:              profile.name,
    quitDate:          new Date(profile.quitDate).toISOString().slice(0, 16),
    cigarettesPerDay:  String(profile.cigarettesPerDay),
    cigarettesPerPack: String(profile.cigarettesPerPack),
    costPerPack:       String(profile.costPerPack),
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const saveEdits = () => {
    if (!form.name.trim() || !form.quitDate) return
    setProfile({
      ...profile,
      name:              form.name.trim(),
      quitDate:          new Date(form.quitDate).toISOString(),
      cigarettesPerDay:  Number(form.cigarettesPerDay),
      cigarettesPerPack: Number(form.cigarettesPerPack),
      costPerPack:       Number(form.costPerPack),
    })
    setEditing(false)
  }

  const handleReset = () => {
    if (!confirm) { setConfirm(true); return }
    resetAll()
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year:   'numeric',
      month:  'long',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="screen">
      <div className="top-bar">
        <Wordmark size={26} />
      </div>

      {/* ── Profile section ──────────────────────────── */}
      <div className="section-hd mt-8">
        <span className="section-title">Profile</span>
        <button
          onClick={() => (editing ? saveEdits() : setEditing(true))}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div className="card gap-stack-md">
          <div className="input-group">
            <label className="input-label" htmlFor="s-name">Name</label>
            <input
              id="s-name"
              className="input"
              type="text"
              inputMode="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="s-quit">Quit date</label>
            <input
              id="s-quit"
              className="input"
              type="datetime-local"
              max={NOW_ISO()}
              inputMode="none"
              value={form.quitDate}
              onChange={(e) => set('quitDate', e.target.value)}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="input-label" htmlFor="s-cpd">Cigs/day</label>
              <input
                id="s-cpd"
                className="input"
                type="number"
                inputMode="numeric"
                min="1"
                value={form.cigarettesPerDay}
                onChange={(e) => set('cigarettesPerDay', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="s-cpp">Per pack</label>
              <input
                id="s-cpp"
                className="input"
                type="number"
                inputMode="numeric"
                min="1"
                value={form.cigarettesPerPack}
                onChange={(e) => set('cigarettesPerPack', e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="s-cost">Pack cost (€)</label>
            <input
              id="s-cost"
              className="input"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={form.costPerPack}
              onChange={(e) => set('costPerPack', e.target.value)}
            />
          </div>

          <button
            className="btn-ghost"
            onClick={() => setEditing(false)}
            style={{ marginTop: 4 }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="settings-list">
          <div className="settings-row">
            <span className="settings-row-label">Name</span>
            <span className="settings-row-value">{profile.name}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Quit date</span>
            <span className="settings-row-value" style={{ fontSize: 12 }}>
              {formatDate(profile.quitDate)}
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Cigarettes / day</span>
            <span className="settings-row-value">{profile.cigarettesPerDay}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Cigarettes / pack</span>
            <span className="settings-row-value">{profile.cigarettesPerPack}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Pack cost</span>
            <span className="settings-row-value">€{profile.costPerPack}</span>
          </div>
        </div>
      )}

      {/* ── App section ──────────────────────────────── */}
      <div className="section-hd mt-28">
        <span className="section-title">App</span>
      </div>

      <div className="settings-list">
        <div className="settings-row">
          <span className="settings-row-label">Version</span>
          <span className="settings-row-value">1.0.0</span>
        </div>
      </div>

      {/* ── Danger zone ──────────────────────────────── */}
      <div className="section-hd mt-28">
        <span className="section-title" style={{ color: 'var(--danger)' }}>
          Danger zone
        </span>
      </div>

      <button className="btn-danger" onClick={handleReset}>
        {confirm ? '⚠️ Tap again to confirm reset' : 'Reset all data'}
      </button>

      {confirm && (
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
          This clears everything — timer, cravings, badges.
        </p>
      )}

      {confirm && (
        <button
          className="btn-ghost"
          style={{ marginTop: 8 }}
          onClick={() => setConfirm(false)}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
