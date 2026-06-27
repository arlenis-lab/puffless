/**
 * Body-healing benefits — each one tracks a real physiological milestone.
 * startsAt / fullAt are in hours since quit.
 *
 * Extended fields used by BenefitDetail popup:
 *   detail      – in-depth paragraph explaining what's happening
 *   notices     – 3 real-world sensations the user will feel
 *   motivation  – short italic closing quote
 */
export const BENEFITS = [
  {
    id:       'blood_pressure',
    icon:     '❤️',
    title:    'Blood pressure',
    subtitle: 'Normalizing',
    description: 'Your heart rate and blood pressure are returning to healthy levels.',
    startsAt: 0,
    fullAt:   0.33,      // 20 minutes
    detail:
      'Within 20 minutes of your last cigarette, your body begins undoing years of damage. ' +
      'Nicotine caused your blood vessels to constrict and your heart to beat faster than normal. ' +
      'As nicotine clears, your vessels relax and your heart finds its natural rhythm again.',
    notices: [
      'Hands and feet feel warmer as circulation improves',
      'Resting heart rate starts dropping toward normal',
      'Fewer tension headaches caused by constricted vessels',
    ],
    motivation: "Your heart has been working overtime for years. It's already starting to rest.",
  },
  {
    id:       'oxygen',
    icon:     '🫁',
    title:    'Blood oxygen',
    subtitle: 'Carbon monoxide clearing',
    description: 'CO levels in your blood are dropping. Oxygen is taking its place.',
    startsAt: 0,
    fullAt:   8,
    detail:
      'Every cigarette fills your blood with carbon monoxide — the same gas in car exhaust. ' +
      'CO binds to red blood cells 200× more strongly than oxygen, literally starving your organs. ' +
      'Within 8 hours, CO levels halve and your blood oxygen returns to normal levels ' +
      'for the first time in years.',
    notices: [
      'Less brain fog and fatigue as oxygen reaches your brain',
      'Skin starts looking less grey and more alive',
      'Physical endurance begins to improve',
    ],
    motivation: 'Your blood is carrying real oxygen again. Every cell in your body is noticing.',
  },
  {
    id:       'nicotine',
    icon:     '🧬',
    title:    'Nicotine clearance',
    subtitle: 'Leaving your system',
    description: 'Nicotine and its byproducts are being flushed from your body.',
    startsAt: 0,
    fullAt:   72,
    detail:
      'Nicotine has a half-life of about 2 hours, but its byproduct cotinine stays in your system ' +
      'much longer. Within 72 hours both are fully cleared. This is the hardest window — your brain ' +
      'is recalibrating its dopamine system after years of nicotine hijacking it. The cravings you ' +
      'feel are your brain healing, not a sign you need to smoke.',
    notices: [
      'Cravings peak then start getting shorter and weaker',
      'Mood swings and irritability begin to settle',
      'Sleep may be disrupted briefly as your brain rebalances',
    ],
    motivation: "The chemical that owned you for years is almost gone. Your brain is yours again.",
  },
  {
    id:       'taste_smell',
    icon:     '👅',
    title:    'Taste & smell',
    subtitle: 'Nerve endings regenerating',
    description: 'Sensory nerve endings are regrowing. Food is about to taste different.',
    startsAt: 24,
    fullAt:   48,
    detail:
      'Smoking destroys the tiny nerve endings responsible for taste and smell. Within 24–48 hours ' +
      'of quitting they begin to regenerate — and they do it fast. Most ex-smokers are genuinely ' +
      'shocked by how different food tastes within just a few days.',
    notices: [
      'Food starts tasting noticeably more complex and rich',
      'Smells you forgot existed come back — coffee, rain, food',
      'You may notice cigarette smoke smells terrible now',
    ],
    motivation:
      "You're about to rediscover food. Some ex-smokers say it's like eating for the first time.",
  },
  {
    id:       'lung_cilia',
    icon:     '🌿',
    title:    'Lung cilia',
    subtitle: 'Regrowing',
    description: 'Tiny hair-like structures in your lungs are regenerating, clearing out debris.',
    startsAt: 72,
    fullAt:   720,       // 1 month
    detail:
      'Your airways are lined with millions of tiny hair-like structures called cilia. Smoking ' +
      'paralyzes them — which is why smokers cough so much (the cough is the only backup system ' +
      'left). Once you quit, cilia start regrowing within days and are fully functional within a ' +
      'month. You might cough more at first — that\'s them working.',
    notices: [
      'Morning cough may temporarily increase as cilia clear debris',
      'Chest feels less congested and heavy over time',
      'Fewer respiratory infections as immune defense rebuilds',
    ],
    motivation:
      'Your lungs are literally growing new parts. That cough is the sound of them cleaning themselves.',
  },
  {
    id:       'circulation',
    icon:     '🩸',
    title:    'Circulation',
    subtitle: 'Improving',
    description: 'Blood flow to your hands and feet is improving. Exercise feels easier.',
    startsAt: 168,       // 1 week
    fullAt:   1440,      // 2 months
    detail:
      'Nicotine causes blood vessels to constrict continuously, reducing blood flow to your ' +
      'extremities and organs. Over weeks and months after quitting, vessels regain their ' +
      'elasticity, blood pressure normalises and circulation throughout your entire body ' +
      'improves dramatically.',
    notices: [
      'Hands and feet feel warmer, especially in cold weather',
      'Wound healing speeds up noticeably',
      'Exercise feels easier — you can go harder for longer',
    ],
    motivation:
      'Your body is rebuilding its entire delivery system. Every workout from here gets better.',
  },
  {
    id:       'lung_function',
    icon:     '💨',
    title:    'Lung function',
    subtitle: 'Capacity increasing',
    description: 'Your lung capacity is increasing. You can breathe deeper with less effort.',
    startsAt: 720,       // 1 month
    fullAt:   8760,      // 1 year
    detail:
      'Lung capacity in smokers is significantly reduced by inflammation, mucus buildup and ' +
      'damaged airways. Over the first year of quitting, inflammation decreases, mucus clears ' +
      'and airways widen. Most ex-smokers gain back 10–15% lung capacity within a year — ' +
      'which is enormous.',
    notices: [
      'Climbing stairs without getting winded',
      'Deeper breaths that actually feel satisfying',
      'Better performance in any physical activity',
    ],
    motivation:
      "Your lungs have more room than you've felt in years. Keep going and they'll keep opening up.",
  },
  {
    id:       'heart_risk',
    icon:     '🫀',
    title:    'Heart disease risk',
    subtitle: 'Dropping',
    description: 'Your risk of coronary heart disease is falling toward that of a non-smoker.',
    startsAt: 8760,      // 1 year
    fullAt:   43800,     // 5 years
    detail:
      'Smoking doubles your risk of heart disease. Within a year of quitting, that excess risk ' +
      'drops by half. Within 15 years, your risk is virtually the same as someone who never ' +
      'smoked. Your heart has been under constant attack — every day smoke-free is a day of repair.',
    notices: [
      'Lower resting heart rate becomes measurable',
      'Blood pressure readings start improving',
      'Reduced risk of blood clots forming',
    ],
    motivation: "Your heart survived years of smoking. Now give it the years it deserves.",
  },
  {
    id:       'cancer_risk',
    icon:     '🛡️',
    title:    'Cancer risk',
    subtitle: 'Reducing',
    description:
      'Your risk of lung, mouth, throat and esophageal cancer is now half that of a smoker.',
    startsAt: 43800,     // 5 years
    fullAt:   87600,     // 10 years
    detail:
      'Five years after quitting, your risk of cancers of the mouth, throat, esophagus and ' +
      'bladder drops by half. After 10 years, your lung cancer risk is half that of a current ' +
      'smoker. The body\'s ability to repair DNA damage from smoke is remarkable — but it needs ' +
      'time and clean air.',
    notices: [
      'Pre-cancerous cells in the mouth and throat begin to clear',
      'Immune system strengthens, better at catching abnormal cells',
      'Annual health checkups become less anxiety-inducing',
    ],
    motivation: "Every day smoke-free is your body quietly undoing the damage. It's working.",
  },
]

/**
 * Compute status and progress percentage for a single benefit.
 * @param {Object} benefit
 * @param {number} elapsedHours
 * @returns {{ pct: number, status: 'locked'|'active'|'complete' }}
 */
export function benefitProgress(benefit, elapsedHours) {
  const { startsAt, fullAt } = benefit

  if (elapsedHours >= fullAt) {
    return { pct: 100, status: 'complete' }
  }
  if (elapsedHours >= startsAt) {
    const pct = ((elapsedHours - startsAt) / (fullAt - startsAt)) * 100
    return { pct, status: 'active' }
  }
  return { pct: 0, status: 'locked' }
}

/**
 * Format a raw hour value into a human-readable label.
 * e.g. 0.33 → "20m", 8 → "8h", 72 → "3d", 720 → "1mo"
 */
export function fmtHours(h) {
  if (h < 1)    return `${Math.round(h * 60)}m`
  if (h < 24)   return `${Math.round(h)}h`
  if (h < 168)  return `${Math.round(h / 24)}d`
  if (h < 720)  return `${Math.round(h / 168)}w`
  if (h < 8760) return `${Math.round(h / 720)}mo`
  return `${Math.round(h / 8760)}yr`
}
