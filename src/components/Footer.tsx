import Link from 'next/link'
import type { SiteSetting, TempleTiming } from '@/payload-types'
import { LotusMark } from './Icons'
import { SocialLinks } from './SocialLinks'

const COLUMNS = [
  {
    title: 'About',
    links: [
      { label: 'About ISKCON', href: '/about' },
      { label: 'Founder – Srila Prabhupada', href: '/about#founder' },
      { label: 'Sri Jagannath Mandir', href: '/about#temple' },
      { label: 'Kovai Chandra (New Temple)', href: '/about#new-temple' },
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
      { label: 'Festivals Calendar', href: '/festivals' },
      { label: 'Blog', href: '/blog' },
      { label: 'Donate / Offer Seva', href: '/donate' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
]

export function Footer({ settings, timings }: { settings: SiteSetting; timings: TempleTiming }) {
  const footerTimings = (timings.schedule ?? []).filter((t) => t.showInFooter)

  return (
    <footer>
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="container-x flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-white">Begin Your Journey With Krishna Today</h2>
            <p className="mt-2 text-purple-100">Sponsor a meal, offer a seva, join a course or visit the temple.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/donate/annadaan" className="btn-donate">
              Sponsor a Meal
            </Link>
            <Link href="/contact#timings" className="btn-outline text-white">
              Visit the Temple
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-purple-950 text-sm text-purple-100">
        <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <LotusMark />
              <span className="font-serif text-xl text-white">ISKCON Coimbatore</span>
            </div>
            <p className="whitespace-pre-line">{settings.address}</p>
            <p>
              Phone:{' '}
              <a href={`tel:${settings.phone}`} className="hover:text-saffron-300">
                {settings.phone}
              </a>
            </p>
            <p>
              Email:{' '}
              <a href={`mailto:${settings.email}`} className="hover:text-saffron-300">
                {settings.email}
              </a>
            </p>
            <SocialLinks settings={settings} className="pt-2 text-white" />
          </div>
          {COLUMNS.map((col) => {
            const links = (
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href === 'youtube' ? settings.youtube || '#' : l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )
            return (
              <div key={col.title}>
                <div className="hidden md:block">
                  <h3 className="font-serif text-lg text-saffron-300">{col.title}</h3>
                  {links}
                </div>
                <details className="border-b border-white/10 pb-3 md:hidden">
                  <summary className="cursor-pointer font-serif text-lg text-saffron-300">{col.title}</summary>
                  {links}
                </details>
              </div>
            )
          })}
        </div>

        <div className="container-x space-y-2 border-t border-white/10 py-6 text-xs text-purple-100/80">
          <p>
            Donations to ISKCON Coimbatore are eligible for tax exemption under Section 80G.
            {settings.reg80G && <> Registration no.: {settings.reg80G}.</>}
          </p>
          {footerTimings.length > 0 && <p>{footerTimings.map((t) => `${t.activity} ${t.time}`).join(' · ')}</p>}
        </div>

        <div className="border-t border-white/10">
          <div className="container-x flex flex-col gap-2 py-5 text-xs md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} ISKCON Coimbatore. All rights reserved.</p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/refund-policy" className="hover:text-white">Refund Policy</Link>
              <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
