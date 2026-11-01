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

/** Development loop (dev server, or ?darshanDemo on the URL), one full cycle every 10 seconds:
    closed 2s → countdown 3s → open 5s. */
const DEMO = { closed: 2, countdown: 3, open: 5 }
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
 * While the screen is open, ask the server (every minute) whether the temple's YouTube channel is
 * streaming, and return the stream to embed. ?liveTest=<videoId> on the URL forces a video, for
 * trying the screen out when the temple is not live.
 */
function useLiveStream(open) {
  const [stream, setStream] = useState(null)
  useEffect(() => {
    if (!open) return
    const test = new URLSearchParams(window.location.search).get('liveTest')
    const forced = test && /^[\w-]{11}$/.test(test)
    let stop = false
    const check = () =>
      (forced
        ? Promise.resolve({
            live: true,
            embedUrl: `https://www.youtube-nocookie.com/embed/${test}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`,
            watchUrl: `https://www.youtube.com/watch?v=${test}`,
          })
        : fetch('/api/app/v1/live').then((r) => (r.ok ? r.json() : null))
      )
        .then((s) => !stop && setStream(s?.live ? s : null))
        .catch(() => {})
    check()
    const id = setInterval(check, 60_000)
    return () => {
      stop = true
      clearInterval(id)
    }
  }, [open])
  return open ? stream : null
}

/**
 * The live darshan "screen": the deity photo (children) behind two sandal-coloured curtains that
 * draw back at darshan time and close again after 45 minutes. A countdown appears 10 minutes before.
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
  const stream = useLiveStream(open)
  const total = status?.demoTotal ?? COUNTDOWN
  const progress = countdown ? 1 - status.left / total : 0
  const R = 52
  const C = 2 * Math.PI * R

  return (
    <div className={`${styles.screen} ${open ? styles.isOpen : ''}`} aria-live="polite">
      <div className={styles.view}>{children}</div>

      {/* The temple's YouTube live stream plays in the screen when the channel is live
          (muted to start, as browsers require; the player's own button unmutes it) */}
      {stream?.embedUrl && (
        <iframe
          className={styles.stream}
          src={stream.embedUrl}
          title="Live darshan from Sri Jagannath Mandir"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}

      {/* Live badge (only when actually streaming) and closing time while the screen is open */}
      <div className={styles.liveBar} aria-hidden={!open}>
        {stream ? (
          <a href={stream.watchUrl} target="_blank" rel="noopener noreferrer" className={styles.onAir}>
            <span className={styles.dot} />
            Live
          </a>
        ) : (
          <span className={`${styles.onAir} ${styles.darshanOpen}`}>Darshan open</span>
        )}
        {open && (
          <span className={styles.closes}>
            {status.slot.label} · closes in {clock(status.left)}
          </span>
        )}
      </div>

      {/* The curtains, under a valance that stays in place */}
      <div className={`${styles.door} ${styles.left}`} aria-hidden />
      <div className={`${styles.door} ${styles.right}`} aria-hidden />
      <div className={styles.valance} aria-hidden />

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
