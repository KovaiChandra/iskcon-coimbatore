import Link from 'next/link'
import { waLink } from '@/lib/format'
import { WhatsAppIcon } from './Icons'
import styles from './MobileDock.module.css'

const Svg = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
)

/**
 * App-style bar fixed to the bottom of the screen on phones: Darshan, Timings, Donate (raised,
 * in the middle), WhatsApp and Call. Replaces the floating WhatsApp button on phones.
 */
export function MobileDock({ whatsapp, phone }) {
  return (
    <nav className={styles.dock} aria-label="Quick actions">
      <Link href="/daily-darshan" className={styles.item}>
        <Svg>
          <path d="M12 3c2.5 3 2.5 6 0 9-2.5-3-2.5-6 0-9ZM4 14c4 0 7 2 8 6 1-4 4-6 8-6M4 20h16" />
        </Svg>
        Darshan
      </Link>
      <Link href="/contact#timings" className={styles.item}>
        <Svg>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </Svg>
        Timings
      </Link>
      <Link href="/donate" className={`${styles.item} ${styles.donate}`}>
        <span className={styles.donateIcon}>
          <Svg>
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
          </Svg>
        </span>
        Donate
      </Link>
      {whatsapp && (
        <a
          href={waLink(whatsapp, 'Hare Krishna! I have a question.')}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.item}
        >
          <WhatsAppIcon size={22} />
          WhatsApp
        </a>
      )}
      {phone && (
        <a href={`tel:${phone.replace(/\s/g, '')}`} className={styles.item}>
          <Svg>
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
          </Svg>
          Call
        </a>
      )}
    </nav>
  )
}
