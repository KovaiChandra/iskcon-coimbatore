'use client'

import { useEffect, useState } from 'react'
import { Sparkle } from '@/components/art/Mandala'
import { COUNTDOWN_MINUTES, OPEN_MINUTES } from '@/lib/darshan-slots'
import styles from './LiveScreen.module.css'

const DAY = 86400
const OPEN = OPEN_MINUTES * 60
const COUNTDOWN = COUNTDOWN_MINUTES * 60

/** Seconds since midnight in India, whatever the visitor's timezone. */
function nowInIndia() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (t) => Number(parts.find((p) => p.type === t)?.value)
  return (get('hour') % 24) * 3600 + get('minute') * 60 + get('second')
}

/**
 * Where we are in the day:
 *   open      – a darshan started less than 45 min ago (screen open)
 *   countdown – a darshan starts within 10 min (screen closed, timer running)
 *   closed    – otherwise (screen closed, next darshan shown)
 */
function statusAt(now, slots) {
  for (const s of slots) {
    const since = (now - s.start + DAY) % DAY
    if (since < OPEN) return { state: 'open', slot: s, left: OPEN - since }
  }
  let next = null
  for (const s of slots) {
    const until = (s.start - now + DAY) % DAY
    if (!next || until < next.left) next = { slot: s, left: until }
  }
  if (!next) return { state: 'closed', slot: null, left: 0 }
  return { state: next.left <= COUNTDOWN ? 'countdown' : 'closed', ...next }
}

/** Development loop (dev server, or ?darshanDemo on the URL), one full cycle per minute:
    closed 10s → countdown 15s → open 35s. */
const DEMO = { closed: 10, countdown: 15, open: 35 }
function demoStatus(startedAt) {
  const cycle = DEMO.closed + DEMO.countdown + DEMO.open
  const t = Math.floor((Date.now() - startedAt) / 1000) % cycle
  const opensAt = DEMO.closed + DEMO.countdown
  const slot = { label: 'Sandhya Arati', time: '7:00 PM' }
  if (t < DEMO.closed) return { state: 'closed', slot, left: opensAt - t }
  if (t < opensAt) return { state: 'countdown', slot, left: opensAt - t, demoTotal: DEMO.countdown }
  return { state: 'open', slot, left: cycle - t }
}

const pad = (n) => String(n).padStart(2, '0')
const clock = (secs) => `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`
const hhmm = (secs) =>
  secs >= 3600 ? `${Math.floor(secs / 3600)}h ${pad(Math.floor((secs % 3600) / 60))}m` : clock(secs)

/**
 * The live darshan "screen": the deity photo (children) behind two minimal doors that slide
 * open at darshan time and close again after 45 minutes. A countdown appears 10 minutes before.
 * slots: [{ label, time, start }] from lib/darshan-slots.
 * demo:  loop every minute instead of following the real timings (the home page sets this
 *        on the development server only).
 */
export function LiveScreen({ slots = [], demo = false, children }) {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const loop = demo || new URLSearchParams(window.location.search).has('darshanDemo')
    const startedAt = Date.now()
    const tick = () => setStatus(loop ? demoStatus(startedAt) : statusAt(nowInIndia(), slots))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [slots, demo])

  const open = status?.state === 'open'
  const countdown = status?.state === 'countdown'
  const total = status?.demoTotal ?? COUNTDOWN
  const progress = countdown ? 1 - status.left / total : 0
  const R = 52
  const C = 2 * Math.PI * R

  return (
    <div className={`${styles.screen} ${open ? styles.isOpen : ''}`} aria-live="polite">
      <div className={styles.view}>{children}</div>

      {/* Live badge and closing time while the screen is open */}
      <div className={styles.liveBar} aria-hidden={!open}>
        <span className={styles.onAir}>
          <span className={styles.dot} />
          Live
        </span>
        {open && (
          <span className={styles.closes}>
            {status.slot.label} · closes in {clock(status.left)}
          </span>
        )}
      </div>

      {/* The doors */}
      <div className={`${styles.door} ${styles.left}`} aria-hidden />
      <div className={`${styles.door} ${styles.right}`} aria-hidden />

      {/* Message on the closed screen */}
      <div className={styles.panel} aria-hidden={open}>
        {countdown ? (
          <div className={styles.timer}>
            <svg viewBox="0 0 120 120" className={styles.ring} aria-hidden>
              <circle cx="60" cy="60" r={R} className={styles.ringTrack} />
              <circle
                cx="60"
                cy="60"
                r={R}
                className={styles.ringFill}
                style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress) }}
              />
            </svg>
            <div className={styles.timerText}>
              <span className={styles.timerLabel}>Darshan in</span>
              <span className={styles.digits}>{clock(status.left)}</span>
            </div>
          </div>
        ) : (
          <Sparkle size={18} className={styles.emblem} />
        )}
        <p className={styles.caption}>
          {status?.slot ? (
            countdown ? (
              <>
                {status.slot.label} · {status.slot.time}
              </>
            ) : (
              <>
                Next darshan
                <span className={styles.captionStrong}>
                  {status.slot.label} · {status.slot.time}
                </span>
                <span className={styles.captionSoft}>in {hhmm(status.left)}</span>
              </>
            )
          ) : (
            'Darshan'
          )}
        </p>
      </div>
    </div>
  )
}
