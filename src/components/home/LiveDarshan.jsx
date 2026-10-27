'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Sparkle } from '@/components/art/Mandala'
import styles from './LiveDarshan.module.css'

/** Demo loop for the development server (and ?darshanDemo=1): curtains closed, then open. */
const DEMO_CLOSED = 6 // seconds
const DEMO_OPEN = 10 // seconds

const toSeconds = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 3600 + (m || 0) * 60
}

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

/** Is darshan open now, and how many seconds until the curtains change? */
function realStatus(sessions) {
  const now = nowInIndia()
  const sorted = [...sessions].sort((a, b) => toSeconds(a.opens) - toSeconds(b.opens))
  const current = sorted.find((s) => now >= toSeconds(s.opens) && now < toSeconds(s.closes))
  if (current) return { open: true, left: toSeconds(current.closes) - now }
  const next = sorted.find((s) => toSeconds(s.opens) > now)
  const left = next ? toSeconds(next.opens) - now : 86400 - now + toSeconds(sorted[0].opens)
  return { open: false, left }
}

function demoStatus(startedAt) {
  const t = Math.floor((Date.now() - startedAt) / 1000) % (DEMO_CLOSED + DEMO_OPEN)
  return t < DEMO_CLOSED
    ? { open: false, left: DEMO_CLOSED - t }
    : { open: true, left: DEMO_CLOSED + DEMO_OPEN - t }
}

const pad = (n) => String(n).padStart(2, '0')

export function LiveDarshan({ sessions = [], image, link, demo = false }) {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const isDemo = demo || new URLSearchParams(window.location.search).has('darshanDemo')
    const startedAt = Date.now()
    const tick = () =>
      setStatus(isDemo || sessions.length === 0 ? demoStatus(startedAt) : realStatus(sessions))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [demo, sessions])

  const open = status?.open ?? false
  const left = status?.left ?? 0
  const units = [
    ['Hours', Math.floor(left / 3600)],
    ['Minutes', Math.floor((left % 3600) / 60)],
    ['Seconds', left % 60],
  ]

  return (
    <section className={styles.section}>
      <div className={`container-x ${styles.grid}`}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>
            <Sparkle size={10} />
            Live darshan
          </p>
          <h2 className={styles.title}>Get darshan of the Lord, live</h2>
          <p className={styles.lead}>
            Watch the arati and darshan from Sri Jagannath Mandir wherever you are. The curtains
            open and close with the temple&apos;s darshan timings.
          </p>
          <div className={styles.buttons}>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="btn-donate btn-lg">
                Watch live darshan
              </a>
            )}
            <Link href="#timings" className={`btn-outline btn-lg ${styles.outline}`}>
              Darshan timings
            </Link>
          </div>
        </div>

        {/* The stage: Krishna behind curtains, with the countdown in front */}
        <div className={styles.stage} aria-live="polite">
          <div className={styles.backdrop}>
            {image?.url && (
              <Image
                src={image.url}
                alt={image.alt || 'Lord Krishna'}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className={styles.krishna}
              />
            )}
            <div className={styles.glow} />
          </div>

          <div className={`${styles.curtain} ${styles.left} ${open ? styles.opened : ''}`} />
          <div className={`${styles.curtain} ${styles.right} ${open ? styles.opened : ''}`} />
          <div className={styles.valance} />

          <div className={styles.timerCard}>
            <p className={styles.state}>
              <span className={`${styles.dot} ${open ? styles.dotOpen : ''}`} />
              {status ? (open ? 'Darshan open' : 'Curtains closed') : 'Darshan'}
            </p>
            <p className={styles.timerLabel}>
              {open ? 'Curtains close in' : 'Next darshan in'}
            </p>
            <div className={styles.timer}>
              {units.map(([label, value], i) => (
                <div key={label} className={styles.unit}>
                  <span className={styles.digits}>{status ? pad(value) : '--'}</span>
                  <span className={styles.unitLabel}>{label}</span>
                  {i < 2 && <span className={styles.colon}>:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
