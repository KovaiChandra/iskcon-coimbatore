import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { VisitSection } from '@/components/home/VisitSection'
import { formatDate } from '@/lib/format'
import { populated } from '@/lib/sevas'
import { getPayloadClient } from '@/lib/payload'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Daily Darshan',
  description: "Today's darshan of Sri Sri Jagannath, Baladeva and Subhadra at ISKCON Coimbatore.",
}

/** Day key in India, e.g. "2026-10-31", for matching ?date= */
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export default async function DailyDarshanPage({ searchParams }) {
  const { date } = await searchParams
  const payload = await getPayloadClient()
  const [days, settings, timings, home] = await Promise.all([
    payload.find({ collection: 'darshan-days', sort: '-date', limit: 7, depth: 1 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'temple-timings' }),
    payload.findGlobal({ slug: 'home-page', depth: 1 }),
  ])
  const day = days.docs.find((d) => dayKey(d.date) === date) ?? days.docs[0]
  const photos = populated(day?.photos)

  return (
    <>
      <PageHero
        eyebrow="Daily darshan"
        title="Darshan of Sri Sri Jagannath, Baladeva & Subhadra"
        intro="The Lord's beautiful dress and decorations, photographed at the temple every day."
        crumbs={[{ label: 'Daily Darshan' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          {days.docs.length > 1 && (
            <nav aria-label="Choose a day" className={styles.chips}>
              {days.docs.map((d) => (
                <Link
                  key={d.id}
                  href={`/daily-darshan?date=${dayKey(d.date)}`}
                  aria-current={d.id === day.id ? 'page' : undefined}
                  className={`${styles.chip} ${d.id === day.id ? styles.chipOn : ''}`}
                >
                  {formatDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                </Link>
              ))}
            </nav>
          )}

          {day ? (
            <>
              <div className={styles.head}>
                <h2 className={styles.h2}>
                  {formatDate(day.date, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
              </div>
              <div className={styles.gallery}>
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.galleryItem}
                  >
                    <ImageOrPlaceholder
                      media={p}
                      alt={p.alt || 'Darshan of the deities'}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Today&apos;s darshan photos are on their way</p>
              <p className={styles.emptyText}>Please check back after the morning arati.</p>
            </div>
          )}
        </div>
      </section>

      <VisitSection
        image={home.visitImage}
        address={settings.address}
        mapUrl={settings.mapUrl}
        schedule={timings.schedule ?? []}
        sessions={(timings.openSessions ?? []).map(({ opens, closes }) => ({ opens, closes }))}
      />
    </>
  )
}
