import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { RichText } from '@/components/RichText'
import { formatDate } from '@/lib/format'
import { populated } from '@/lib/sevas'
import { getPayloadClient } from '@/lib/payload'
import styles from '../../pages.module.css'

export const revalidate = 60

async function getFestival(slug) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'festivals',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0]
}

export async function generateMetadata({ params }) {
  const festival = await getFestival((await params).slug)
  return festival ? { title: festival.name, description: festival.shortDescription } : {}
}

export default async function FestivalPage({ params }) {
  const festival = await getFestival((await params).slug)
  if (!festival) notFound()

  const seva = typeof festival.seva === 'object' ? festival.seva : null
  const gallery = populated(festival.gallery)
  const isPast = new Date(festival.date) < new Date(new Date().setHours(0, 0, 0, 0))
  const dateLabel = formatDate(festival.date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <PageHero
        eyebrow={dateLabel}
        title={festival.name}
        intro={festival.shortDescription}
        image={festival.image}
        crumbs={[{ label: 'Festivals', href: '/festivals' }, { label: festival.name }]}
      >
        {!isPast && (
          <Link href={seva ? `/donate/${seva.slug}` : '/donate'} className="btn-donate btn-lg">
            Sponsor the festival
          </Link>
        )}
      </PageHero>

      <section className={styles.section}>
        <div className={`container-x ${styles.splitTop}`}>
          <div>
            {festival.significance ? (
              <>
                <h2 className={styles.h2} style={{ marginTop: 0, marginBottom: '1.25rem' }}>
                  Significance
                </h2>
                <RichText data={festival.significance} />
              </>
            ) : (
              <p className={styles.text}>{festival.shortDescription}</p>
            )}

            {festival.schedule?.length > 0 && (
              <>
                <h2 className={styles.h2} style={{ marginTop: '3rem', marginBottom: '1.25rem' }}>
                  Festival schedule
                </h2>
                <ul className={styles.rows}>
                  {festival.schedule.map((s) => (
                    <li key={`${s.time}-${s.activity}`}>
                      <span>{s.activity}</span>
                      <span className={styles.rowTime}>{s.time}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className={`${styles.aside} ${styles.sticky}`}>
            <p className={styles.asideTitle}>{isPast ? 'Celebrated on' : 'Join us on'}</p>
            <p
              className={styles.lead}
              style={{ marginTop: '0.5rem', color: 'var(--purple-900)', fontWeight: 600 }}
            >
              {dateLabel}
              {festival.timeLabel && (
                <>
                  <br />
                  {festival.timeLabel}
                </>
              )}
            </p>
            <p className={styles.cardText}>
              At Sri Jagannath Mandir, Coimbatore. Everyone is welcome.
            </p>
            <div className={styles.cardFoot}>
              {!isPast && (
                <Link href={seva ? `/donate/${seva.slug}` : '/donate'} className="btn-donate">
                  {seva ? `Offer ${seva.title}` : 'Sponsor the festival'}
                </Link>
              )}
              <Link href="/contact#timings" className={styles.more}>
                Directions →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className={styles.sectionAlt}>
          <div className="container-x">
            <div className={styles.head}>
              <h2 className={styles.h2}>Gallery</h2>
            </div>
            <div className={styles.gallery}>
              {gallery.map((p) => (
                <div key={p.id} className={styles.galleryItem}>
                  <ImageOrPlaceholder media={p} sizes="(min-width: 1024px) 25vw, 50vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
