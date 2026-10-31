import Link from 'next/link'
import Image from 'next/image'
import { SocialLinks } from './SocialLinks'
import styles from './Footer.module.css'

const COLUMNS = [
  {
    title: 'About',
    links: [
      { label: 'About ISKCON', href: '/about' },
      { label: 'Founder – Srila Prabhupada', href: '/about#founder' },
      { label: 'Sri Jagannath Mandir', href: '/about#temple' },
      { label: 'Kovai Chandra (New Temple)', href: '/kovai-chandra' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Annadaan Seva', href: '/donate/annadaan' },
      { label: 'Courses', href: '/courses' },
      { label: "Govinda's Kitchen", href: '/services' },
      { label: 'Goshala', href: '/donate/gau-seva' },
      { label: 'Lectures (YouTube)', href: 'youtube' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Daily Darshan', href: '/daily-darshan' },
      { label: 'Art Gallery', href: '/art-gallery' },
      { label: 'Festivals Calendar', href: '/festivals' },
      { label: 'Blog', href: '/blog' },
      { label: 'Donate / Offer Seva', href: '/donate' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
]

export function Footer({ settings, timings }) {
  const footerTimings = (timings.schedule ?? []).filter((t) => t.showInFooter)

  return (
    <footer>
      <section className={styles.cta}>
        <div className={`container-x ${styles.ctaInner}`}>
          <div>
            <h2 className={styles.ctaTitle}>Begin Your Journey With Krishna Today</h2>
            <p className={styles.ctaText}>
              Sponsor a meal, offer a seva, join a course or visit the temple.
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <Link href="/donate/annadaan" className="btn-donate">
              Sponsor a Meal
            </Link>
            <Link href="/contact#timings" className={`btn-outline ${styles.ctaOutline}`}>
              Visit the Temple
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.main}>
        <div className={`container-x ${styles.grid}`}>
          <div className={styles.about}>
            <Image
              src="/brand/logo-saffron.png"
              alt="ISKCON Coimbatore"
              width={1031}
              height={334}
              className={styles.logoImage}
            />
            <p className={styles.address}>{settings.address}</p>
            <p>
              Phone:{' '}
              <a href={`tel:${settings.phone}`} className={styles.hoverGold}>
                {settings.phone}
              </a>
            </p>
            <p>
              Email:{' '}
              <a href={`mailto:${settings.email}`} className={styles.hoverGold}>
                {settings.email}
              </a>
            </p>
            <SocialLinks settings={settings} className={styles.socials} />
          </div>
          {COLUMNS.map((col) => {
            const links = (
              <ul className={styles.links}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href === 'youtube' ? settings.youtube || '#' : l.href}
                      className={styles.hoverWhite}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )
            return (
              <div key={col.title}>
                <div className={styles.columnDesktop}>
                  <h3 className={styles.columnTitle}>{col.title}</h3>
                  {links}
                </div>
                <details className={styles.columnMobile}>
                  <summary className={styles.columnTitle}>{col.title}</summary>
                  {links}
                </details>
              </div>
            )
          })}
        </div>

        <div className={`container-x ${styles.notes}`}>
          <p>
            Donations to ISKCON Coimbatore are eligible for tax exemption under Section 80G.
            {settings.reg80G && <> Registration no.: {settings.reg80G}.</>}
          </p>
          {footerTimings.length > 0 && (
            <p>{footerTimings.map((t) => `${t.activity} ${t.time}`).join(' · ')}</p>
          )}
        </div>

        <div className={styles.bottom}>
          <div className={`container-x ${styles.bottomInner}`}>
            <p>© {new Date().getFullYear()} ISKCON Coimbatore. All rights reserved.</p>
            <nav className={styles.legal}>
              <Link href="/terms" className={styles.hoverWhite}>
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className={styles.hoverWhite}>
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className={styles.hoverWhite}>
                Refund Policy
              </Link>
              <Link href="/sitemap.xml" className={styles.hoverWhite}>
                Sitemap
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
