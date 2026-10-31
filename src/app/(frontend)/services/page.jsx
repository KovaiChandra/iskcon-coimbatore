import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Devotional Services',
  description:
    'Annadaan, prasadam, speaking to a priest and other devotional services at ISKCON Coimbatore.',
}

/** Where a service's button goes, from its "Action" in the admin */
function serviceLink(service, whatsapp) {
  switch (service.action) {
    case 'donate':
      return typeof service.seva === 'object' && service.seva?.slug
        ? { href: `/donate/${service.seva.slug}`, label: 'Offer seva' }
        : { href: '/donate', label: 'Offer seva' }
    case 'whatsapp':
      return whatsapp
        ? {
            href: waLink(whatsapp, `Hare Krishna! I would like to know about ${service.title}.`),
            label: 'Chat on WhatsApp',
            external: true,
          }
        : { href: '/contact', label: 'Contact us' }
    case 'link':
      return service.url ? { href: service.url, label: 'Learn more', external: true } : null
    default:
      return { href: '/contact?topic=Seva', label: 'Send an enquiry' }
  }
}

export default async function ServicesPage() {
  const payload = await getPayloadClient()
  const [services, settings] = await Promise.all([
    payload.find({ collection: 'services', sort: 'order', limit: 50, depth: 1 }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  return (
    <>
      <PageHero
        eyebrow="Devotional services"
        title="Serve, receive and grow in devotion"
        intro="From sponsoring prasadam to speaking with a priest, here is how the temple can serve you and your family."
        crumbs={[{ label: 'Services' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          {services.docs.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Services are being updated</p>
              <p className={styles.emptyText}>Please contact the temple office for details.</p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {services.docs.map((s) => {
                const link = serviceLink(s, settings.whatsapp)
                return (
                  <article key={s.id} className={styles.card}>
                    <div className={styles.cardImage}>
                      <ImageOrPlaceholder
                        media={s.image}
                        art="lotus"
                        sizes="(min-width: 1024px) 30vw, 100vw"
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{s.title}</h2>
                      <p className={styles.cardText}>{s.description}</p>
                      {link && (
                        <div className={styles.cardFoot}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary"
                            >
                              {s.buttonLabel || link.label}
                            </a>
                          ) : (
                            <Link href={link.href} className="btn-primary">
                              {s.buttonLabel || link.label}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className={styles.cta} style={{ marginTop: '4rem' }}>
            <div>
              <p className={styles.ctaTitle}>Learn with us</p>
              <p className={styles.ctaText}>
                Bhagavad-gita, Srimad Bhagavatam and chanting classes for every age.
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/courses" className="btn-donate">
                See courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
