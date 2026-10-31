import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Courses',
  description:
    'Bhagavad-gita, Srimad Bhagavatam and chanting classes at ISKCON Coimbatore, online and at the temple.',
}

const MODE = { online: 'Online (Zoom)', temple: 'At the temple', both: 'Online & at the temple' }

export default async function CoursesPage() {
  const payload = await getPayloadClient()
  const [courses, settings] = await Promise.all([
    payload.find({ collection: 'courses', sort: 'order', limit: 50 }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  return (
    <>
      <PageHero
        eyebrow="Learn and grow"
        title="Courses and classes"
        intro="Timeless wisdom explained simply. Join online or at Sri Jagannath Mandir; everyone is welcome."
        crumbs={[{ label: 'Services', href: '/services' }, { label: 'Courses' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          {courses.docs.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>New courses are coming soon</p>
              <p className={styles.emptyText}>
                Follow us on WhatsApp to hear when the next batch starts.
              </p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {courses.docs.map((c) => (
                <article key={c.id} className={styles.card}>
                  <div className={styles.cardImage}>
                    <ImageOrPlaceholder
                      media={c.image}
                      art="book"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{c.title}</h2>
                    <div className={styles.meta}>
                      {c.schedule && <span className={styles.tag}>{c.schedule}</span>}
                      {c.mode && (
                        <span className={`${styles.tag} ${styles.tagGold}`}>{MODE[c.mode]}</span>
                      )}
                    </div>
                    <p className={styles.cardText}>{c.description}</p>
                    <div className={styles.cardFoot}>
                      {c.zoomLink && c.mode !== 'temple' && (
                        <a
                          href={c.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                        >
                          Join on Zoom
                        </a>
                      )}
                      {settings.whatsapp && (
                        <a
                          href={waLink(
                            settings.whatsapp,
                            `Hare Krishna! I would like to join the ${c.title}.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={
                            c.zoomLink && c.mode !== 'temple' ? styles.more : 'btn-primary'
                          }
                        >
                          Register on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
