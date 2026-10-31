import Image from 'next/image'
import { WhatsAppIcon } from '@/components/Icons'
import { Sparkle } from '@/components/art/Mandala'
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

/** Three simple steps to speak with a priest */
const TOPICS = [
  {
    title: 'Send a message',
    text: 'Tell us on WhatsApp what you would like to ask or discuss',
    // A chat bubble
    icon: icon(<path d="M4 5.5h16v10H9l-5 4v-14Z" />),
  },
  {
    title: 'We arrange a time',
    text: 'A temple priest will find a time that suits you',
    // A calendar
    icon: icon(
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </>,
    ),
  },
  {
    title: 'Speak with a priest',
    text: 'In person at Sri Jagannath Mandir, or over the phone',
    // An open book
    icon: icon(
      <>
        <path d="M3 5.5c2.8-.9 5.8-.6 9 1.5 3.2-2.1 6.2-2.4 9-1.5V19c-2.8-.9-5.8-.6-9 1.5-3.2-2.1-6.2-2.4-9-1.5Z" />
        <path d="M12 7v13.5" />
      </>,
    ),
  },
]

/** Home page: invite visitors to speak with a temple priest on WhatsApp or by phone. */
export function SpeakToPriest({ whatsapp, phone }) {
  return (
    <section className={styles.section} aria-labelledby="priest-title">
      {/* Faint ISKCON lotus watermark behind the section */}
      <Image
        src="/brand/mark-gold.png"
        alt=""
        width={370}
        height={334}
        className={styles.watermark}
        aria-hidden
      />
      <div className={`container-x ${styles.inner}`}>
        {/* ISKCON lotus mark above the heading */}
        <Image
          src="/brand/mark-gold.png"
          alt="ISKCON"
          width={370}
          height={334}
          className={styles.mark}
        />
        <p className={styles.eyebrow}>
          <Sparkle size={10} />
          Speak to a priest
        </p>
        <h2 id="priest-title" className={styles.title}>
          Guidance, blessings and <span className={styles.accent}>a listening ear</span>
        </h2>
        <p className={styles.text}>
          Have a question on the Bhagavad-gita, chanting or your spiritual life? Talk one-to-one
          with a temple priest, at the temple or over the phone.
        </p>

        <ul className={styles.topics}>
          {TOPICS.map((t, i) => (
            <li key={t.title} className={styles.card}>
              <span className={styles.step}>Step {i + 1}</span>
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
