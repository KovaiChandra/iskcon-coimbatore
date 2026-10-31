/** Live screen timing: how long the screen stays open, and when the countdown starts. */
export const OPEN_MINUTES = 45
export const COUNTDOWN_MINUTES = 10

/** Which Temple timings rows open the live screen (by their activity name). */
const OPENS_SCREEN = /arati|darshan/i

/** "4:15 AM" → seconds after midnight. A range like "4:00–8:15 PM" uses its start time. */
export function parseStart(time) {
  const m = String(time).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) return null
  const suffix =
    m[3] ||
    String(time)
      .slice(m.index + m[0].length)
      .match(/am|pm/i)?.[0]
  let h = Number(m[1]) % 12
  if (suffix?.toLowerCase() === 'pm') h += 12
  return h * 3600 + Number(m[2] ?? 0) * 60
}

/** Temple timings schedule → darshan slots [{ label, time, start }] sorted by time. */
export function darshanSlots(schedule = []) {
  return schedule
    .filter((s) => OPENS_SCREEN.test(s.activity ?? ''))
    .map((s) => ({ label: s.activity, time: s.time, start: parseStart(s.time) }))
    .filter((s) => s.start !== null)
    .sort((a, b) => a.start - b.start)
}
