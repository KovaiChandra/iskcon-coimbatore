const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

const to12h = (hhmm) => {
  const mins = toMinutes(hhmm)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** Minutes since midnight in India, regardless of the visitor's timezone. */
export function nowInIndia(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (t) => Number(parts.find((p) => p.type === t)?.value)
  return (get('hour') % 24) * 60 + get('minute')
}

export function templeStatus(sessions, now = nowInIndia()) {
  const sorted = [...sessions].sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens))
  const current = sorted.find((s) => now >= toMinutes(s.opens) && now < toMinutes(s.closes))
  if (current) return { open: true, label: `Temple Open · closes ${to12h(current.closes)}` }
  const next = sorted.find((s) => toMinutes(s.opens) > now) ?? sorted[0]
  return { open: false, label: next ? `Closed · opens ${to12h(next.opens)}` : 'Closed' }
}
