import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const HEADLINES = [
  'Not today.',
  "You've come too far.",
  'Ride it out.',
  '3 minutes. That\'s all.',
  'This feeling will pass.',
  'Your lungs are healing.',
  "Don't throw it away.",
  'Stay. The. Course.',
]

const TIPS = [
  'A craving peaks at 3 minutes then fades whether you smoke or not.',
  'Drink a full glass of cold water right now. Seriously.',
  "You've already beaten every craving you've ever had. You're undefeated.",
  "The cigarette won't make you feel better — it just ends the withdrawal you created.",
  "In 5 minutes you won't even remember what you were craving.",
  'Change your location. Go to a different room. Right now.',
  "Your brain is lying to you. It's just chemistry. You are not your craving.",
  'Every craving you beat makes the next one weaker.',
]

const MODES = [
  { id: 'breathing', emoji: '🫁', label: 'Breathe',       subtitle: 'Guided breathing'   },
  { id: 'tap',       emoji: '👆', label: 'Tap challenge',  subtitle: 'Burn the energy'    },
  { id: 'facts',     emoji: '🧠', label: 'Weird facts',    subtitle: 'Distract your brain' },
  { id: 'memory',    emoji: '🎮', label: 'Memory game',    subtitle: 'Focus elsewhere'    },
]

const FACTS = [
  'Your heart has already beaten over 100,000 times today — without you thinking about it.',
  "Cravings are just dopamine dips. Your brain is literally throwing a tantrum like a toddler.",
  'The average smoker spends over €2,000 a year on cigarettes.',
  'Your sense of smell can distinguish over 1 trillion different scents.',
  'Within 20 minutes of quitting, your fingernails and toenails start getting more oxygen.',
  'Nicotine leaves your bloodstream completely within 72 hours.',
  "The term 'cold turkey' comes from the goosebumps that appear during withdrawal — resembling cold turkey skin.",
  'Your lungs have about 300 million tiny air sacs called alveoli. They\'re healing right now.',
  "Ex-smokers' brains return to normal dopamine levels within 3 months.",
  "Every cigarette you didn't smoke added roughly 11 minutes back to your life.",
]

const COMPLETION_TEXTS = [
  "That craving is gone. You're still here.",
  "One more down. You're getting stronger.",
  'Your streak is safe. Keep going.',
  'Nicotine lost. You won.',
]

const MEMORY_EMOJIS = ['🫁', '❤️', '🌿', '💪', '✨', '🏆']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* ═══════════════════════════════════════════════════════
   SHARED: BACK BUTTON
   ═══════════════════════════════════════════════════════ */
function BackButton({ onClick }) {
  return (
    <button className="game-back" onClick={onClick}>
      ← Back
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   MODE SELECTOR
   ═══════════════════════════════════════════════════════ */
function ModeSelector({ onSelect }) {
  return (
    <div>
      <p className="craving-mode-title">Choose your weapon</p>
      <div className="craving-mode-list">
        {MODES.map((m) => (
          <button
            key={m.id}
            className="craving-mode-btn"
            onClick={() => onSelect(m.id)}
          >
            <span className="craving-mode-emoji">{m.emoji}</span>
            <span className="craving-mode-text">
              <span className="craving-mode-label">{m.label}</span>
              <span className="craving-mode-sub">{m.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   BREATHING GAME
   ═══════════════════════════════════════════════════════ */
function BreathingGame({ onComplete, onBack }) {
  const [phase, setPhase] = useState('idle')
  const [round, setRound] = useState(1)

  // Stable ref so the sequence useEffect never stale-captures onComplete
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  // Kick off first inhale after a single frame so the CSS transition plays
  useEffect(() => {
    const t = setTimeout(() => setPhase('inhale'), 60)
    return () => clearTimeout(t)
  }, [])

  // Drive the inhale → hold → exhale sequence
  useEffect(() => {
    if (phase === 'inhale') {
      const t = setTimeout(() => setPhase('hold'), 4000)
      return () => clearTimeout(t)
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('exhale'), 2000)
      return () => clearTimeout(t)
    }
    if (phase === 'exhale') {
      const t = setTimeout(() => {
        if (round >= 4) {
          onCompleteRef.current()
        } else {
          setRound((r) => r + 1)
          setPhase('inhale')
        }
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [phase, round]) // intentionally omit onComplete — we use the ref

  const expanded = phase === 'inhale' || phase === 'hold'

  const circleStyle = {
    transform:  `scale(${expanded ? 1.6 : 1})`,
    background: expanded ? 'rgba(180,160,230,0.7)' : 'rgba(180,160,230,0.3)',
    transition: phase === 'hold' || phase === 'idle'
      ? 'none'
      : 'transform 4s ease-in-out, background 4s ease-in-out',
  }

  const phaseLabel =
    phase === 'hold'   ? 'Hold'    :
    phase === 'exhale' ? 'Exhale'  : 'Inhale'

  return (
    <div className="breathing-wrap">
      <BackButton onClick={onBack} />
      <div className="breath-circle" style={circleStyle}>
        <span className="breath-text">{phaseLabel}</span>
      </div>
      <p className="breath-progress">Round {round} of 4</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   TAP GAME
   ═══════════════════════════════════════════════════════ */
function TapGame({ onComplete, onBack }) {
  const [taps, setTaps] = useState(0)
  const circleRef      = useRef(null)
  const onCompleteRef  = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const handleTap = useCallback(() => {
    setTaps((prev) => {
      if (prev >= 50) return prev
      const next = prev + 1
      if (next >= 50) setTimeout(() => onCompleteRef.current(), 80)
      return next
    })
    if (navigator.vibrate) navigator.vibrate(10)
    const el = circleRef.current
    if (el) {
      el.style.transition = 'transform 10ms ease'
      el.style.transform  = 'scale(0.92)'
      setTimeout(() => { if (el) el.style.transform = 'scale(1)' }, 80)
    }
  }, [])

  const pct = (taps / 50) * 100

  return (
    <div className="tap-wrap">
      <BackButton onClick={onBack} />
      <div
        ref={circleRef}
        className="tap-circle"
        onClick={handleTap}
        /* Prevent 300ms click-delay on mobile while avoiding double-fire */
        onTouchStart={(e) => { e.preventDefault(); handleTap() }}
      >
        <span className="tap-count">{taps}</span>
        <span className="tap-sub">tap as fast as you can</span>
      </div>
      <div className="tap-bar-wrap">
        <div className="tap-bar">
          <div className="tap-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   FACTS GAME
   ═══════════════════════════════════════════════════════ */
function FactsGame({ onComplete, onBack }) {
  const [factIndex, setFactIndex] = useState(0)
  const [elapsed,   setElapsed]   = useState(0)
  const [done,      setDone]      = useState(false)

  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  // Elapsed timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-advance every 5 s
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => {
      if (factIndex >= FACTS.length - 1) {
        setDone(true)
        onCompleteRef.current()
      } else {
        setFactIndex((i) => i + 1)
      }
    }, 5000)
    return () => clearTimeout(t)
  }, [factIndex, done])

  return (
    <div className="facts-wrap">
      <BackButton onClick={onBack} />
      <p className="facts-timer">{elapsed}s</p>
      <div className="fact-card">
        <p>{FACTS[factIndex]}</p>
      </div>
      <div className="facts-dots">
        {FACTS.map((_, i) => (
          <span
            key={i}
            className={`facts-dot${i === factIndex ? ' active' : i < factIndex ? ' seen' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MEMORY GAME
   ═══════════════════════════════════════════════════════ */
function shuffleDeck() {
  const deck = MEMORY_EMOJIS.flatMap((emoji, pairId) => [
    { cardId: pairId * 2,     emoji, pairId },
    { cardId: pairId * 2 + 1, emoji, pairId },
  ])
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function MemoryGame({ onComplete, onBack }) {
  const [cards]      = useState(shuffleDeck)
  const [revealed,   setRevealed]   = useState([])   // card indices currently flipped
  const [matched,    setMatched]    = useState([])   // pairIds confirmed matched
  const [moves,      setMoves]      = useState(0)
  const [checking,   setChecking]   = useState(false)

  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const handleCardTap = (index) => {
    const card = cards[index]
    if (matched.includes(card.pairId)) return   // already matched
    if (revealed.includes(index))      return   // already face-up
    if (checking)                      return   // cooldown
    if (revealed.length >= 2)          return   // two already up

    const next = [...revealed, index]
    setRevealed(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      setChecking(true)
      const [i1, i2] = next
      const c1 = cards[i1]
      const c2 = cards[i2]

      setTimeout(() => {
        if (c1.pairId === c2.pairId) {
          const newMatched = [...matched, c1.pairId]
          setMatched(newMatched)
          setRevealed([])
          if (newMatched.length === MEMORY_EMOJIS.length) {
            onCompleteRef.current()
          }
        } else {
          setRevealed([])
        }
        setChecking(false)
      }, 600)
    }
  }

  return (
    <div className="memory-wrap">
      <BackButton onClick={onBack} />
      <p className="memory-moves">{moves} moves</p>
      <div className="memory-grid">
        {cards.map((card, index) => {
          const isMatched  = matched.includes(card.pairId)
          const isFaceUp   = isMatched || revealed.includes(index)
          return (
            <div
              key={card.cardId}
              className={`memory-card${isMatched ? ' matched' : isFaceUp ? ' face-up' : ''}`}
              onClick={() => handleCardTap(index)}
            >
              {isFaceUp ? card.emoji : '?'}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   COMPLETION STATE
   ═══════════════════════════════════════════════════════ */
function CompletionState({ onSaveAndClose, onPlayAgain }) {
  const [sub] = useState(() => pick(COMPLETION_TEXTS))
  return (
    <div className="completion-wrap">
      <span className="completion-icon">✅</span>
      <h2 className="completion-headline">You beat it.</h2>
      <p className="completion-sub">{sub}</p>
      <span className="completion-xp">+100 XP</span>
      <button className="craving-btn-primary" onClick={onSaveAndClose}>
        Back to home
      </button>
      <button className="craving-btn-secondary" onClick={onPlayAgain}>
        Play another
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export default function CravingTakeover({ cravingNumber, onDismiss, onSave }) {
  const [mode,          setMode]          = useState(null)
  const [completed,     setCompleted]     = useState(false)
  const [completedMode, setCompletedMode] = useState(null)

  // Headline + tip are random but stable for this session
  const [headline] = useState(() => pick(HEADLINES))
  const [tip]      = useState(() => pick(TIPS))

  const handleGameComplete = useCallback((gameMode) => {
    setCompleted(true)
    setCompletedMode(gameMode)
  }, [])

  const handleSaveAndClose = () => {
    onSave({
      timestamp: new Date().toISOString(),
      mode:      completedMode,
      completed: true,
      xpEarned:  100,
    })
  }

  const handlePlayAgain = () => {
    setMode(null)
    setCompleted(false)
    setCompletedMode(null)
  }

  const renderContent = () => {
    if (completed) {
      return (
        <CompletionState
          onSaveAndClose={handleSaveAndClose}
          onPlayAgain={handlePlayAgain}
        />
      )
    }
    const back = () => setMode(null)
    switch (mode) {
      case 'breathing':
        return <BreathingGame onBack={back} onComplete={() => handleGameComplete('breathing')} />
      case 'tap':
        return <TapGame       onBack={back} onComplete={() => handleGameComplete('tap')} />
      case 'facts':
        return <FactsGame     onBack={back} onComplete={() => handleGameComplete('facts')} />
      case 'memory':
        return <MemoryGame    onBack={back} onComplete={() => handleGameComplete('memory')} />
      default:
        return <ModeSelector  onSelect={setMode} />
    }
  }

  return (
    <div className="craving-overlay" role="dialog" aria-modal="true">
      {/* Fixed header — counter top-left, close top-right */}
      <span className="craving-num" aria-live="polite">Craving #{cravingNumber}</span>
      <button
        className="craving-close"
        onClick={onDismiss}
        aria-label="Dismiss craving overlay"
      >
        ✕
      </button>

      {/* Scrollable content — max 430px, centered */}
      <div className="craving-scroll">
        {/* Hero — motivational headline fills available vertical space */}
        <div className="craving-hero">
          <h1 className="craving-headline">{headline}</h1>
          <p className="craving-tip">{tip}</p>
        </div>

        {/* Game or mode selector */}
        {renderContent()}
      </div>
    </div>
  )
}
