/** Festival sevas are only offered between their start and end dates. */
export function isSevaActive(seva, now = new Date()) {
  if (seva.category !== 'festival') return true
  if (seva.startDate && now < new Date(seva.startDate)) return false
  if (seva.endDate && now > new Date(new Date(seva.endDate).getTime() + 86_400_000)) return false
  return true
}

export const populated = (items) => (items ?? []).filter((i) => typeof i === 'object' && i !== null)
