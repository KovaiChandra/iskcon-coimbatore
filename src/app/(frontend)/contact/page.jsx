import { PageHero } from '@/components/PageHero'
import { WhatsAppIcon } from '@/components/Icons'
import { VisitSection } from '@/components/home/VisitSection'
import { ContactForm } from '@/components/forms/ContactForm'
import { waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { bannerFor, getSitePhotos } from '@/lib/site-photos'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Contact',
  description:
    'Contact ISKCON Coimbatore, Sri Jagannath Mandir: address, phone, WhatsApp, email and temple timings.',
}

const icon = (d) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
)

export default async function ContactPage() {
  const payload = await getPayloadClient()
  const photos = await getSitePhotos(payload)
  const [settings, timings, home] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'temple-timings' }),
    payload.findGlobal({ slug: 'home-page', depth: 1 }),
  ])

  const details = [
    settings.address && {
      label: 'Address',
      value: settings.address,
      icon: icon(
        'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
      ),
    },
    settings.phone && {
      label: 'Phone',
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, '')}`,
      icon: icon(
        'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z',
      ),
    },
    settings.whatsapp && {
      label: 'WhatsApp',
      value: 'Chat with the temple',
      href: waLink(settings.whatsapp, 'Hare Krishna!'),
      external: true,
      icon: <WhatsAppIcon size={20} />,
    },
    settings.email && {
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
      icon: icon(
        'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm18 2-10 7L2 6',
      ),
    },
  ].filter(Boolean)

  return (
    <>
      <PageHero
        image={bannerFor(photos, 'contact')}
        eyebrow="Contact"
        title="We'd love to hear from you"
        intro="Questions about darshan, seva, receipts or events? Write to us, call, or simply visit the temple."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className={styles.section}>
        <div className={`container-x ${styles.splitTop}`}>
          <div className={styles.aside}>
            <p className={styles.asideTitle} style={{ marginBottom: '1.5rem' }}>
              Send a message
            </p>
            <ContactForm />
          </div>
          <div className={styles.sticky}>
            <ul className={styles.contactList}>
              {details.map((d) => (
                <li key={d.label} className={styles.contactItem}>
                  <span className={styles.contactIcon}>{d.icon}</span>
                  <div>
                    <p className={styles.contactLabel}>{d.label}</p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className={styles.contactValue}
                        {...(d.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className={styles.contactValue}>{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
