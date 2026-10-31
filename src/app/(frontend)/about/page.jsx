import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { getPayloadClient } from '@/lib/payload'
import { getSitePhotos } from '@/lib/site-photos'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'About',
  description:
    'ISKCON Coimbatore and Sri Jagannath Mandir: our temple, our founder Srila Prabhupada and the Kovai Chandra new temple.',
}

const ABOUT_TEXT =
  'ISKCON Coimbatore shares the timeless teachings of Bhagavad-gita and the joy of chanting the holy names, as taught by His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada.\n\nAt Sri Jagannath Mandir, families, students and seekers gather for daily worship, festivals, classes and prasadam.'

const VALUES = [
  {
    title: 'Chanting the holy names',
    text: 'The Hare Krishna maha-mantra, sung together in kirtan and chanted daily on japa beads.',
    icon: (
      <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    ),
  },
  {
    title: 'Wisdom of the Gita',
    text: 'Bhagavad-gita and Srimad Bhagavatam, explained simply for everyday life.',
    icon: <path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-4a3 3 0 0 0-3 3" />,
  },
  {
    title: 'Prasadam for all',
    text: 'Pure vegetarian food offered to the Lord, shared with every visitor and those in need.',
    icon: <path d="M4 12h16a8 8 0 0 1-16 0ZM12 4v4M8 6v2M16 6v2" />,
  },
  {
    title: 'Service with love',
    text: 'Seva in the temple, the kitchen, the goshala and the community, open to everyone.',
    icon: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
  },
]

const TIMELINE = [
  ['1896', 'Born in Kolkata as Abhay Charan De'],
  ['1922', 'Meets his guru, who asks him to preach in English'],
  ['1965', 'Sails to America aboard the Jaladuta'],
  ['1966', 'Founds ISKCON in New York City'],
  ['1977', 'Leaves a worldwide family of temples and devotees'],
]

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'home-page', depth: 1 })
  const about = home.about ?? {}
  const photos = await getSitePhotos(payload)
  const [kovaiByAlt] = (
    await payload.find({
      collection: 'media',
      where: { alt: { equals: 'Kovai Chandra new temple under construction (banner)' } },
      limit: 1,
    })
  ).docs
  const kovai = photos.kovai?.banner || kovaiByAlt

  return (
    <>
      <PageHero
        eyebrow="About ISKCON Coimbatore"
        title="A spiritual home for everyone seeking Krishna"
        intro="Sri Jagannath Mandir is a branch of the International Society for Krishna Consciousness, founded by Srila Prabhupada in 1966."
        image={about.image}
        crumbs={[{ label: 'About' }]}
      />

      {/* The temple */}
      <section id="temple" className={styles.section}>
        <div className={`container-x ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> Sri Jagannath Mandir
            </p>
            <h2 className={styles.h2}>Our temple in Coimbatore</h2>
            <p className={styles.text} style={{ marginTop: '1.25rem' }}>
              {about.text || ABOUT_TEXT}
            </p>
            <div className={styles.cardFoot}>
              <Link href="/daily-darshan" className="btn-primary">
                Today&apos;s darshan
              </Link>
              <Link href="/contact#timings" className="btn-outline">
                Timings &amp; directions
              </Link>
            </div>
          </div>
          <div className={styles.photo}>
            <ImageOrPlaceholder
              media={about.smallImage || about.image}
              art="temple"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* What we practise */}
      <section className={styles.sectionAlt}>
        <div className="container-x">
          <div className={styles.headCenter}>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> What we practise
            </p>
            <h2 className={styles.h2}>Bhakti, the path of loving devotion</h2>
          </div>
          <div className={styles.grid4}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.feature}>
                <span className={styles.featureIcon}>
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
                    {v.icon}
                  </svg>
                </span>
                <p className={styles.featureTitle}>{v.title}</p>
                <p className={styles.featureText}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder-acharya */}
      <section id="founder" className={styles.sectionDark}>
        <Mandala className={`spin-slow ${styles.darkMandala}`} rings={5} />
        <div className={`container-x ${styles.split}`}>
          <div className={`${styles.photo} ${styles.photoTall}`} style={{ maxWidth: '26rem' }}>
            <ImageOrPlaceholder
              media={home.founder?.image}
              art="book"
              alt="His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada"
              sizes="(min-width: 1024px) 30vw, 80vw"
            />
          </div>
          <div>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> Founder-Ācārya of ISKCON
            </p>
            <h2 className={styles.h2}>
              His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada
            </h2>
            <p className={styles.lead}>
              In 1965, at the age of sixty-nine, Srila Prabhupada sailed from Kolkata to New York on
              a cargo ship, carrying little more than his translations of Srimad Bhagavatam. He had
              been asked by his spiritual master to share Lord Krishna&apos;s teachings in the
              English language. A year later he founded the International Society for Krishna
              Consciousness.
            </p>
            <ol className={styles.timeline}>
              {TIMELINE.map(([year, text]) => (
                <li key={year}>
                  <span className={styles.timelineYear}>{year}</span>
                  <span className={styles.timelineText}>{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* New temple */}
      <section id="new-temple" className={styles.section}>
        <div className={`container-x ${styles.split} ${styles.splitReverse}`}>
          <div>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> Kovai Chandra
            </p>
            <h2 className={styles.h2}>A new temple, rising in Coimbatore</h2>
            <p className={styles.lead}>
              Kovai Chandra, our new temple and Educational &amp; Cultural Center, is being built
              for the deities and for everyone who comes to see Them.
            </p>
            <div className={styles.cardFoot}>
              <Link href="/kovai-chandra" className="btn-primary">
                About the project
              </Link>
              <Link href="/donate/new-temple" className="btn-donate">
                Support construction
              </Link>
            </div>
          </div>
          <div className={styles.photo}>
            <ImageOrPlaceholder
              media={kovai}
              size="hero"
              art="temple"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>
    </>
  )
}
