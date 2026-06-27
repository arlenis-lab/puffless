import { useState } from 'react'
import Wordmark from '../components/Wordmark.jsx'

const NOW_ISO = () => new Date().toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"

const DEFAULT = {
  name:              '',
  quitDate:          NOW_ISO(),
  cigarettesPerDay:  '20',
  cigarettesPerPack: '20',
  costPerPack:       '',
}

export default function Onboarding({ onComplete }) {
  const [step,   setStep]   = useState(0)
  const [form,   setForm]   = useState(DEFAULT)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  /* ── Validation ──────────────────────────────────────── */
  const validateStep0 = () => {
    const errs = {}
    if (!form.name.trim())     errs.name     = 'Please enter your name'
    if (!form.quitDate)        errs.quitDate = 'Please pick a date'
    else if (new Date(form.quitDate) > new Date())
      errs.quitDate = 'Quit date must be in the past'
    return errs
  }

  const validateStep1 = () => {
    const errs = {}
    if (!form.cigarettesPerDay  || Number(form.cigarettesPerDay)  <= 0)
      errs.cigarettesPerDay  = 'Enter a valid number'
    if (!form.cigarettesPerPack || Number(form.cigarettesPerPack) <= 0)
      errs.cigarettesPerPack = 'Enter a valid number'
    if (!form.costPerPack       || Number(form.costPerPack)       <= 0)
      errs.costPerPack       = 'Enter a valid amount'
    return errs
  }

  const nextStep = () => {
    const errs = validateStep0()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(1)
  }

  const finish = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onComplete({
      name:              form.name.trim(),
      quitDate:          new Date(form.quitDate).toISOString(),
      cigarettesPerDay:  Number(form.cigarettesPerDay),
      cigarettesPerPack: Number(form.cigarettesPerPack),
      costPerPack:       Number(form.costPerPack),
    })
  }

  return (
    <div className="onboarding">
      {/* Step dots */}
      <div className="step-dots">
        <span className={`step-dot${step === 0 ? ' active' : ''}`} />
        <span className={`step-dot${step === 1 ? ' active' : ''}`} />
      </div>

      <Wordmark size={32} />

      {step === 0 ? (
        <div className="onboarding-step" key="step0">
          <div>
            <h1 className="heading">Let's begin your<br />smoke-free journey.</h1>
            <p className="onboarding-sub mt-8">
              A few quick details and you're off.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="ob-name">Your name</label>
            <input
              id="ob-name"
              className={`input${errors.name ? ' input--error' : ''}`}
              type="text"
              placeholder="Alex"
              autoComplete="given-name"
              inputMode="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <span className="input-error-msg">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="ob-quit">When did you stop?</label>
            <input
              id="ob-quit"
              className={`input${errors.quitDate ? ' input--error' : ''}`}
              type="datetime-local"
              max={NOW_ISO()}
              inputMode="none"
              value={form.quitDate}
              onChange={(e) => set('quitDate', e.target.value)}
            />
            {errors.quitDate && (
              <span className="input-error-msg">{errors.quitDate}</span>
            )}
          </div>

          <button className="btn-primary mt-8" onClick={nextStep}>
            Continue →
          </button>
        </div>
      ) : (
        <div className="onboarding-step" key="step1">
          <div>
            <h1 className="heading">Track your savings.</h1>
            <p className="onboarding-sub mt-8">
              We'll calculate money and time you're winning back.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="ob-cpd">
              Cigarettes per day
            </label>
            <input
              id="ob-cpd"
              className={`input${errors.cigarettesPerDay ? ' input--error' : ''}`}
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="20"
              value={form.cigarettesPerDay}
              onChange={(e) => set('cigarettesPerDay', e.target.value)}
            />
            {errors.cigarettesPerDay && (
              <span className="input-error-msg">{errors.cigarettesPerDay}</span>
            )}
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="input-label" htmlFor="ob-cpp">
                Per pack
              </label>
              <input
                id="ob-cpp"
                className={`input${errors.cigarettesPerPack ? ' input--error' : ''}`}
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="20"
                value={form.cigarettesPerPack}
                onChange={(e) => set('cigarettesPerPack', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="ob-cost">
                Pack cost (€)
              </label>
              <input
                id="ob-cost"
                className={`input${errors.costPerPack ? ' input--error' : ''}`}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="6.50"
                value={form.costPerPack}
                onChange={(e) => set('costPerPack', e.target.value)}
              />
              {errors.costPerPack && (
                <span className="input-error-msg">{errors.costPerPack}</span>
              )}
            </div>
          </div>

          <button className="btn-primary mt-8" onClick={finish}>
            Start my journey 🎉
          </button>

          <button
            className="btn-ghost"
            style={{ marginTop: 8 }}
            onClick={() => setStep(0)}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Inline error text style (no hex in JSX — token used via CSS var) */}
      <style>{`
        .input--error { border-color: var(--danger) !important; }
        .input-error-msg {
          font-size: 12px;
          color: var(--danger);
          margin-top: -4px;
        }
      `}</style>
    </div>
  )
}
