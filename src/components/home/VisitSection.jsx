import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { TempleStatus } from '@/components/TempleStatus'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import styles from './VisitSection.module.css'

/**
 * "Plan your visit": elegant card with live open/closed status, today's timings,
 * address and directions, beside a photo of the temple.
 * Timings and address come from admin (Temple timings, Site settings).
 */
export function VisitSection({ image, address, mapUrl, schedule = [], sessions = [] }) {
  const oneLineAddress = address ? address.replace(/,?\s*\n\s*/g, ', ') : ''
  const directions =
    mapUrl ||
    (oneLineAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(oneLineAddress)}`
      : null)

  return (
    <section id="timings" className={styles.section}>
      <div className={`container-x ${styles.grid}`}>
        <div className={styles.photoWrap}>
          <div className={styles.photo}>
            <ImageOrPlaceholder
              media={image}
              size="hero"
              art="temple"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>

        <div className={styles.card}>
          <span aria-hidden className={styles.frame}>
            {['tl', 'tr', 'bl', 'br'].map((c) => (
              <Sparkle key={c} size={9} className={`${styles.corner} ${styles[`corner-${c}`]}`} />
            ))}
          </span>
          <Mandala className={styles.mandala} rings={4} />

          <div className={styles.top}>
            <p className={styles.eyebrow}>
              <Sparkle size={10} />
              Plan your visit
            </p>
            {sessions.length > 0 && (
              <span className={styles.status}>
                <TempleStatus sessions={sessions} />
              </span>
            )}
          </div>

          <h2 className={styles.title}>Darshan timings</h2>
          <div className={styles.rule}>
            <Sparkle size={8} />
          </div>

          {schedule.length > 0 && (
            <ul className={styles.times}>
              {schedule.map((t) => (
                <li key={`${t.time}-${t.activity}`}>
                  <span className={styles.activity}>{t.activity}</span>
                  <span className={styles.time}>{t.time}</span>
                </li>
              ))}
            </ul>
          )}

          {oneLineAddress && (
            <p className={styles.address}>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              {oneLineAddress}
            </p>
          )}

          <div className={styles.buttons}>
            {directions && (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-donate btn-lg ${styles.primary}`}
              >
                Get directions
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            )}
            <Link href="/contact" className={styles.secondary}>
              Contact the temple
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
