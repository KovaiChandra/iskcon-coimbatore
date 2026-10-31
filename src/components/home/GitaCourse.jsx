import { Sparkle } from '@/components/art/Mandala'
import { waLink } from '@/lib/format'
import styles from './GitaCourse.module.css'

/** The 18 chapters of the Bhagavad-gita, one per class */
const CHAPTERS = [
  'Observing the Armies',
  'Contents of the Gita Summarized',
  'Karma-yoga',
  'Transcendental Knowledge',
  'Karma-yoga — Action in Krishna Consciousness',
  'Dhyana-yoga',
  'Knowledge of the Absolute',
  'Attaining the Supreme',
  'The Most Confidential Knowledge',
  'The Opulence of the Absolute',
  'The Universal Form',
  'Devotional Service',
  'Nature, the Enjoyer and Consciousness',
  'The Three Modes of Material Nature',
  'The Yoga of the Supreme Person',
  'The Divine and Demoniac Natures',
  'The Divisions of Faith',
  'Conclusion — The Perfection of Renunciation',
]

const FACTS = [
  ['18', 'classes, one chapter each'],
  ['700', 'verses explained simply'],
  ['All', 'ages welcome, no experience needed'],
]

/** Home page: the 18-chapter Bhagavad-gita course, with registration on WhatsApp. */
export function GitaCourse({ whatsapp }) {
  const register = whatsapp
    ? waLink(whatsapp, 'Hare Krishna! I would like to join the 18-chapter Bhagavad-gita course.')
    : '/contact?topic=General'

  return (
    <section className={styles.section} aria-labelledby="gita-course-title">
      <div className={`container-x ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <Sparkle size={10} />
            Bhagavad-gita course
          </p>
          <h2 id="gita-course-title" className={styles.title}>
            The Bhagavad-gita, <span className={styles.accent}>chapter by chapter</span>
          </h2>
          <p className={styles.text}>
            Study all 18 chapters of Bhagavad-gita As It Is with a senior devotee at Sri Jagannath
            Mandir. Each class takes one chapter, with time for questions, kirtan and prasadam.
          </p>

          <dl className={styles.facts}>
            {FACTS.map(([value, label]) => (
              <div key={label} className={styles.fact}>
                <dt className={styles.factValue}>{value}</dt>
                <dd className={styles.factLabel}>{label}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.cta}>
            <a
              href={register}
              target={whatsapp ? '_blank' : undefined}
              rel={whatsapp ? 'noopener noreferrer' : undefined}
              className={`btn-donate ${styles.button}`}
            >
              Register for the course <span aria-hidden>→</span>
            </a>
            <p className={styles.note}>Next batch details on WhatsApp</p>
          </div>
        </div>

        <ol className={styles.chapters} aria-label="The 18 chapters">
          {CHAPTERS.map((name, i) => (
            <li key={name} className={styles.chapter}>
              <span className={styles.no}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.name}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
