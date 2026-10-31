import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { WhatsAppIcon } from '@/components/Icons'
import { Sparkle } from '@/components/art/Mandala'
import { waLink } from '@/lib/format'
import styles from './SpeakToPriest.module.css'

const TOPICS = [
  ['Samskaras and home pujas', 'Naming, annaprasana, griha pravesh, marriage and more'],
  ['Spiritual guidance', 'Questions on the Gita, chanting and daily sadhana'],
  ['Family and life questions', 'A quiet, caring conversation, in confidence'],
]

/** Home page: invite visitors to speak with a temple priest on WhatsApp or by phone. */
export function SpeakToPriest({ image, whatsapp, phone }) {
  return (
    <section className={styles.section} aria-labelledby="priest-title">
      <div className={`container-x ${styles.grid}`}>
        <div className={styles.photoWrap}>
          <div className={styles.photo}>
            <ImageOrPlaceholder
              media={image}
              art="temple"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </div>

        <div>
          <p className={styles.eyebrow}>
            <Sparkle size={10} />
            Speak to a priest
          </p>
          <h2 id="priest-title" className={styles.title}>
            Guidance, blessings and <span className={styles.accent}>a listening ear</span>
          </h2>
          <p className={styles.text}>
            Our temple priests are here to help you with ceremonies, spiritual questions and the
            moments that matter in your family&apos;s life.
          </p>

          <ul className={styles.topics}>
            {TOPICS.map(([title, text]) => (
              <li key={title} className={styles.topic}>
                <span className={styles.topicMark} aria-hidden />
                <span>
                  <span className={styles.topicTitle}>{title}</span>
                  <span className={styles.topicText}>{text}</span>
                </span>
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
      </div>
    </section>
  )
}
