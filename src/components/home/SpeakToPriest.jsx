import { WhatsAppIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { waLink } from '@/lib/format'
import styles from './SpeakToPriest.module.css'

const icon = (paths) => (
  <svg
    viewBox="0 0 24 24"
    width="26"
    height="26"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {paths}
  </svg>
)

const TOPICS = [
  {
    title: 'Samskaras & home pujas',
    text: 'Naming, annaprasana, griha pravesh, marriage and more',
    // A diya (lamp) with its flame
    icon: icon(
      <>
        <path d="M12 3c1.6 2 1.6 4 0 5.6C10.4 7 10.4 5 12 3Z" />
        <path d="M3.5 13c0 3.3 3.8 6 8.5 6s8.5-2.7 8.5-6Z" />
        <path d="M9 21h6" />
      </>,
    ),
  },
  {
    title: 'Spiritual guidance',
    text: 'Questions on the Gita, chanting and daily sadhana',
    // An open book
    icon: icon(
      <>
        <path d="M3 5.5c2.8-.9 5.8-.6 9 1.5 3.2-2.1 6.2-2.4 9-1.5V19c-2.8-.9-5.8-.6-9 1.5-3.2-2.1-6.2-2.4-9-1.5Z" />
        <path d="M12 7v13.5" />
      </>,
    ),
  },
  {
    title: 'Family & life questions',
    text: 'A quiet, caring conversation, always in confidence',
    // A heart
    icon: icon(
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />,
    ),
  },
]

/** Home page: invite visitors to speak with a temple priest on WhatsApp or by phone. */
export function SpeakToPriest({ whatsapp, phone }) {
  return (
    <section className={styles.section} aria-labelledby="priest-title">
      <Mandala className={`spin-slow ${styles.mandala}`} rings={6} />
      <div className={styles.glow} aria-hidden />

      <div className={`container-x ${styles.inner}`}>
        <p className={styles.eyebrow}>
          <Sparkle size={10} />
          Speak to a priest
          <Sparkle size={10} />
        </p>
        <h2 id="priest-title" className={styles.title}>
          Guidance, blessings and{' '}
          <span className={`text-gold-gradient ${styles.accent}`}>a listening ear</span>
        </h2>
        <p className={styles.text}>
          Our temple priests are here for your ceremonies, your questions and the moments that
          matter in your family&apos;s life.
        </p>

        <ul className={styles.topics}>
          {TOPICS.map((t) => (
            <li key={t.title} className={styles.card}>
              <span className={styles.iconRing}>{t.icon}</span>
              <span className={styles.cardTitle}>{t.title}</span>
              <span className={styles.cardText}>{t.text}</span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {whatsapp && (
            <a
              href={waLink(whatsapp, 'Hare Krishna! I would like to speak to a priest.')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primary}
            >
              <WhatsAppIcon size={20} /> Message a priest
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className={styles.secondary}>
              Call {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
