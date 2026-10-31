import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { formatDate } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { bannerFor, getSitePhotos } from '@/lib/site-photos'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Festivals',
  description: 'Festival calendar of ISKCON Coimbatore: dates, schedules and how to take part.',
}

function FestivalCard({ f, past }) {
  return (
    <Link href={`/festivals/${f.slug}`} className={styles.card}>
      <div className={styles.cardImage}>
        <ImageOrPlaceholder
          media={f.image}
          art={f.artwork ?? 'lotus'}
          sizes="(min-width: 1024px) 30vw, 100vw"
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.meta} style={{ marginTop: 0 }}>
          <span className={`${styles.tag} ${past ? '' : styles.tagGold}`}>
            {formatDate(f.date, {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <h2 className={styles.cardTitle} style={{ marginTop: '0.75rem' }}>
          {f.name}
        </h2>
        <p className={styles.cardText}>{f.shortDescription}</p>
        <span className={`${styles.cardFoot} ${styles.more}`}>Festival details →</span>
      </div>
    </Link>
  )
}

export default async function FestivalsPage() {
  const payload = await getPayloadClient()
  const photos = await getSitePhotos(payload)
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'festivals',
      where: { date: { greater_than_equal: todayStart } },
      sort: 'date',
      limit: 50,
    }),
    payload.find({
      collection: 'festivals',
      where: { date: { less_than: todayStart } },
      sort: '-date',
      limit: 6,
    }),
  ])

  return (
    <>
      <PageHero
        image={bannerFor(photos, 'festivals')}
        eyebrow="Festivals"
        title="Festival calendar"
        intro="Celebrate with kirtan, abhishek, drama and a grand prasadam feast. Every festival is open to all."
        crumbs={[{ label: 'Festivals' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          <div className={styles.head}>
            <h2 className={styles.h2}>Upcoming festivals</h2>
          </div>
          {upcoming.docs.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>The next festival dates will be announced soon</p>
              <p className={styles.emptyText}>
                <Link href="/#festival-alerts" className={styles.more}>
                  Get festival alerts →
                </Link>
              </p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {upcoming.docs.map((f) => (
                <FestivalCard key={f.id} f={f} />
              ))}
            </div>
          )}
        </div>
      </section>

      {past.docs.length > 0 && (
        <section className={styles.sectionAlt}>
          <div className="container-x">
            <div className={styles.head}>
              <h2 className={styles.h2}>Recent festivals</h2>
            </div>
            <div className={styles.grid3}>
              {past.docs.map((f) => (
                <FestivalCard key={f.id} f={f} past />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
