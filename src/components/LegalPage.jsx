import { PageHero } from '@/components/PageHero'
import { getPayloadClient } from '@/lib/payload'
import styles from './LegalPage.module.css'

/** Shared layout for the Terms, Privacy and Refund pages; contact details come from Site settings. */
export async function LegalPage({ title, intro, updated, children }) {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  return (
    <>
      <PageHero eyebrow="Policies" title={title} intro={intro} crumbs={[{ label: title }]} />
      <section className={styles.section}>
        <div className={`container-x ${styles.body}`}>
          <p className={styles.updated}>Last updated: {updated}</p>
          {children}
          <h2>Contact us</h2>
          <p>
            International Society for Krishna Consciousness (ISKCON Coimbatore)
            <br />
            {(settings.address ?? '').split('\n').map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            {settings.phone && (
              <>
                Phone: <a href={`tel:${(settings.phone ?? '').replace(/\s/g, '')}`}>{settings.phone}</a>
                <br />
              </>
            )}
            {settings.email && (
              <>
                Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </>
            )}
          </p>
        </div>
      </section>
    </>
  )
}
