import { describe, expect, it } from 'vitest'
import { templeStatus } from '@/lib/temple-status'

const sessions = [
  { opens: '04:15', closes: '13:00' },
  { opens: '16:00', closes: '20:15' },
]
const at = (hh: number, mm = 0) => hh * 60 + mm

describe('templeStatus', () => {
  it('is open during a session and shows the closing time', () => {
    expect(templeStatus(sessions, at(17, 30))).toEqual({ open: true, label: 'Temple Open · closes 8:15 PM' })
  })

  it('shows the next opening between sessions', () => {
    expect(templeStatus(sessions, at(14))).toEqual({ open: false, label: 'Closed · opens 4:00 PM' })
  })

  it("rolls over to tomorrow's first session after closing", () => {
    expect(templeStatus(sessions, at(22))).toEqual({ open: false, label: 'Closed · opens 4:15 AM' })
  })

  it('treats the closing minute as closed', () => {
    expect(templeStatus(sessions, at(13)).open).toBe(false)
  })
})
