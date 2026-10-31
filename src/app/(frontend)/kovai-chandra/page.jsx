import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { Sparkle } from '@/components/art/Mandala'
import { inr } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { getSitePhotos } from '@/lib/site-photos'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Kovai Chandra – New Temple',
  description:
    'Kovai Chandra, the new temple and Educational & Cultural Center of ISKCON Coimbatore. See the progress and support construction.',
}

/** Construction photos found by their alt text, used until photos are uploaded in admin (Photos & Videos → Kovai Chandra) */
const PHOTOS = [
  'Kovai Chandra new temple under construction (banner)',
  'Kovai Chandra, the new temple, under construction',
  'Kovai Chandra, the new temple design, under a full moon',
]

const WAYS = [
  {
    title: 'Offer a donation',
    text: 'Every contribution, large or small, becomes part of the temple.',
    href: '/donate/new-temple',
    label: 'Donate for the temple',
  },
  {
    title: 'Volunteer',
    text: 'Help on site, with events or with spreading the word.',
    href: '/volunteer',
    label: 'Join as a volunteer',
  },
  {
    title: 'Visit and see the progress',
    text: 'Come for darshan and see the new temple taking shape.',
    href: '/contact#timings',
    label: 'Plan your visit',
  },
]

export default async function KovaiChandraPage() {
  const payload = await getPayloadClient()
  const [media, sevas, sitePhotos] = await Promise.all([
    payload.find({ collection: 'media', where: { alt: { in: PHOTOS } }, limit: PHOTOS.length }),
    payload.find({ collection: 'sevas', where: { slug: { equals: 'new-temple' } }, limit: 1 }),
    getSitePhotos(payload),
  ])
  const byAlt = new Map(media.docs.map((m) => [m.alt, m]))
  const { banner, photos: uploaded = [] } = sitePhotos.kovai ?? {}
  const photos =
    banner || uploaded.length > 0
      ? [banner, ...uploaded].filter((p) => p && typeof p === 'object')
      : PHOTOS.map((alt) => byAlt.get(alt)).filter(Boolean)
  const seva = sevas.docs[0]
  const amounts = (seva?.presetAmounts ?? []).map((p) => p.amount)

  return (
    <>
      <PageHero
        eyebrow="Temple construction"
        title="Kovai Chandra"
        intro="Our new temple and Educational & Cultural Center is rising in Coimbatore. Be part of history: offer your seva for the house of the Lord."
        image={photos[0]}
        crumbs={[{ label: 'Kovai Chandra' }]}
      >
        <Link href="/donate/new-temple" className="btn-donate btn-lg">
          Donate for the temple
        </Link>
        <Link href="/volunteer" className="btn-outline btn-lg">
          Volunteer
        </Link>
      </PageHero>

      <section className={styles.section}>
        <div className={`container-x ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> The project
            </p>
            <h2 className={styles.h2}>A home for the Lord and for the community</h2>
            <p className={styles.lead}>
              {seva?.shortDescription ||
                'Kovai Chandra will be a grand temple for Sri Sri Jagannath, Baladeva and Subhadra, with an Educational & Cultural Center for classes, festivals and prasadam.'}
            </p>
            <p className={styles.lead}>
              Construction is under way. Your support helps complete the temple halls, domes and the
              cultural center.
            </p>
          </div>
          <div className={styles.photo}>
            <ImageOrPlaceholder
              media={photos[1] || photos[0]}
              size="hero"
              art="temple"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      {photos.length > 1 && (
        <section className={styles.sectionAlt}>
          <div className="container-x">
            <div className={styles.head}>
              <p className={styles.eyebrow}>
                <Sparkle size={10} /> Progress
              </p>
              <h2 className={styles.h2}>From the construction site</h2>
            </div>
            <div className={styles.grid3}>
              {photos.map((p) => (
                <div key={p.id} className={styles.photo}>
                  <ImageOrPlaceholder media={p} sizes="(min-width: 1024px) 30vw, 100vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className="container-x">
          <div className={styles.headCenter}>
            <p className={styles.eyebrow}>
              <Sparkle size={10} /> Ways to help
            </p>
            <h2 className={styles.h2}>Build Kovai Chandra with us</h2>
          </div>
          <div className={styles.grid3}>
            {WAYS.map((w) => (
              <div key={w.title} className={styles.feature}>
                <p className={styles.featureTitle} style={{ marginTop: 0, fontSize: '1.2rem' }}>
                  {w.title}
                </p>
                <p className={styles.featureText}>{w.text}</p>
                <Link
                  href={w.href}
                  className={styles.more}
                  style={{ display: 'inline-block', marginTop: '1rem' }}
                >
                  {w.label} →
                </Link>
              </div>
            ))}
          </div>

          <div className={styles.cta} style={{ marginTop: '3.5rem' }}>
            <div>
              <p className={styles.ctaTitle}>Offer your seva for Kovai Chandra</p>
              <p className={styles.ctaText}>
                {amounts.length > 0
                  ? `Suggested offerings: ${amounts.map(inr).join(', ')} or any amount.`
                  : 'Any amount, offered with love.'}{' '}
                Donations are eligible for 80G.
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/donate/new-temple" className="btn-donate btn-lg">
                Donate now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
