import type { Seva } from '@/payload-types'

/** Festival sevas are only offered between their start and end dates. */
export function isSevaActive(seva: Seva, now = new Date()) {
  if (seva.category !== 'festival') return true
  if (seva.startDate && now < new Date(seva.startDate)) return false
  if (seva.endDate && now > new Date(new Date(seva.endDate).getTime() + 86_400_000)) return false
  return true
}

export const populated = <T,>(items: (number | T)[] | null | undefined) =>
  (items ?? []).filter((i): i is T => typeof i === 'object' && i !== null)
