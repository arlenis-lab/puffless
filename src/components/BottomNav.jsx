import { NavLink } from 'react-router-dom'

/* ── Inline SVG icons (24 × 24, stroke-based) ──────────── */

function IconHome({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1V11.5z"/>
    </svg>
  )
}

function IconProgress({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="14" width="4" height="7" rx="1"/>
      <rect x="10" y="9"  width="4" height="12" rx="1"/>
      <rect x="17" y="4"  width="4" height="17" rx="1"/>
    </svg>
  )
}

function IconBenefits({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      {/* heart with a small upward pulse line */}
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}

function IconCravings({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      {/* lightning bolt */}
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

function IconSettings({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

/* ── Nav tabs config ────────────────────────────────────── */
const TABS = [
  { to: '/',          label: 'Home',     Icon: IconHome     },
  { to: '/progress',  label: 'Progress', Icon: IconProgress },
  { to: '/benefits',  label: 'Benefits', Icon: IconBenefits },
  { to: '/cravings',  label: 'Cravings', Icon: IconCravings },
  { to: '/settings',  label: 'Settings', Icon: IconSettings },
]

export default function BottomNav({ hidden = false }) {
  // Hide while the craving takeover is open (it's position:fixed and covers everything,
  // but removing the nav also prevents ghost touches and keeps layout clean)
  if (hidden) return null

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <span className="nav-icon">
                <Icon active={isActive} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
