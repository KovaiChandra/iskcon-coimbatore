import { WhatsAppIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { waLink } from '@/lib/format'
import styles from './SpeakToPriest.module.css'

const TOPICS = [
  ['Samskaras & home pujas', 'Naming, annaprasana, griha pravesh, marriage and more'],
  ['Spiritual guidance', 'Questions on the Gita, chanting and daily sadhana'],
  ['Family & life questions', 'A quiet, caring conversation, in confidence'],
]

/** Home page: invite visitors to speak with a temple priest on WhatsApp or by phone. */
export function SpeakToPriest({ whatsapp, phone }) {
  return (
    <section className={styles.section} aria-labelledby="priest-title">
      <Mandala className={`spin-slow ${styles.mandala}`} rings={6} />
      <div className={`container-x ${styles.inner}`}>
        <p className={styles.eyebrow}>
          <span className={styles.line} />
          Speak to a priest
          <span className={styles.line} />
        </p>
        <h2 id="priest-title" className={styles.title}>
          Guidance, blessings and <em className={styles.accent}>a listening ear</em>
        </h2>
        <p className={styles.text}>
          Our temple priests are here for your ceremonies, your questions and the moments that
          matter in your family&apos;s life.
        </p>

        <div className={styles.ornament} aria-hidden>
          <span />
          <Sparkle size={8} />
          <Sparkle size={13} />
          <Sparkle size={8} />
          <span />
        </div>

        <ul className={styles.topics}>
          {TOPICS.map(([title, text], i) => (
            <li key={title} className={styles.topic}>
              <span className={styles.no}>{['I', 'II', 'III'][i]}</span>
              <span className={styles.topicTitle}>{title}</span>
              <span className={styles.topicText}>{text}</span>
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
              <WhatsAppIcon size={18} /> Message a priest
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
