/** All possible badges, in order of unlock time. */
export const BADGES = [
  {
    id:    'first_hour',
    emoji: '🌱',
    name:  '1 Hour',
    desc:  'One full hour smoke-free',
    hours: 1,
  },
  {
    id:    'first_day',
    emoji: '☀️',
    name:  '1 Day',
    desc:  '24 hours of clean air',
    hours: 24,
  },
  {
    id:    'three_days',
    emoji: '💪',
    name:  '3 Days',
    desc:  'Nicotine leaving your body',
    hours: 72,
  },
  {
    id:    'one_week',
    emoji: '🌟',
    name:  '1 Week',
    desc:  'One full week, let\'s go!',
    hours: 168,
  },
  {
    id:    'two_weeks',
    emoji: '🔥',
    name:  '2 Weeks',
    desc:  'Taste and smell restored',
    hours: 336,
  },
  {
    id:    'one_month',
    emoji: '🏆',
    name:  '1 Month',
    desc:  'Lungs clearing fast',
    hours: 720,
  },
  {
    id:    'three_months',
    emoji: '💎',
    name:  '3 Months',
    desc:  'Circulation improving',
    hours: 2160,
  },
  {
    id:    'six_months',
    emoji: '🦋',
    name:  '6 Months',
    desc:  'Half a year of freedom',
    hours: 4380,
  },
  {
    id:    'one_year',
    emoji: '👑',
    name:  '1 Year',
    desc:  'Heart disease risk halved',
    hours: 8760,
  },
]

/**
 * Return the IDs of all badges earned given a quit date.
 * @param {string|null} quitDate – ISO string
 * @returns {string[]}
 */
export function getEarnedBadgeIds(quitDate) {
  if (!quitDate) return []
  const elapsedHours = (Date.now() - new Date(quitDate).getTime()) / 3_600_000
  return BADGES.filter((b) => elapsedHours >= b.hours).map((b) => b.id)
}

/**
 * Compute total XP and level from elapsed time + craving history.
 * @param {number} elapsedSeconds
 * @param {Array}  cravings
 * @returns {{ totalXP: number, level: number, progress: number, xpInLevel: number }}
 */
export function computeXP(elapsedSeconds, cravings = []) {
  const elapsedDays = elapsedSeconds / 86400
  const timeXP    = Math.floor(elapsedDays) * 100
  // Handle both old format (c.xp) and new format (c.xpEarned)
  const cravingXP = cravings.reduce((sum, c) => sum + (c.xpEarned ?? c.xp ?? 0), 0)
  const totalXP   = timeXP + cravingXP

  const XP_PER_LEVEL = 500
  const level      = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const xpInLevel  = totalXP % XP_PER_LEVEL
  const progress   = xpInLevel / XP_PER_LEVEL

  return { totalXP, level, progress, xpInLevel, xpPerLevel: XP_PER_LEVEL }
}
