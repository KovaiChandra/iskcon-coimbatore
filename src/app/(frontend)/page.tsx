import Link from 'next/link'
import type { Festival, Seva } from '@/payload-types'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import type { ArtTheme } from '@/components/art/FestivalArt'
import { DonationCard } from '@/components/home/DonationCard'
import { HeroSlider, type HeroSlide } from '@/components/home/HeroSlider'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { ScheduleTicker } from '@/components/home/ScheduleTicker'
import { SubscribeForm } from '@/components/home/SubscribeForm'
import { formatDate, mediaUrl, waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { isSevaActive, populated } from '@/lib/sevas'

export const revalidate = 60

const DAY = 86_400_000

function daysUntil(date: string) {
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  const d = Math.round((new Date(date).setHours(0, 0, 0, 0) - startOfToday) / DAY)
  return d <= 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`
}

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${light ? 'text-saffron-300' : 'text-saffron-600'}`}>
      <Sparkle className="size-2.5" />
      {children}
    </p>
  )
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [home, settings, timings, festivals, services, courses, posts, monthlySevas, festivalSevas] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'temple-timings' }),
    payload.find({ collection: 'festivals', where: { date: { greater_than_equal: todayStart } }, sort: 'date', limit: 4 }),
    payload.find({ collection: 'services', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({ collection: 'courses', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }),
    payload.find({ collection: 'sevas', where: { allowMonthly: { equals: true } }, limit: 20 }),
    payload.find({ collection: 'sevas', where: { category: { equals: 'festival' } }, limit: 10 }),
  ])

  // ---- Slideshow: admin slides → running festival sevas → upcoming festivals → welcome
  const imageOf = (m: Parameters<typeof mediaUrl>[0]) => {
    const url = mediaUrl(m, 'hero')
    return url && typeof m === 'object' && m ? { url, alt: m.alt } : null
  }
  const slides: HeroSlide[] = [
    ...(home.heroSlides ?? []).map((s, i) => ({
      id: `custom-${s.id ?? i}`,
      eyebrow: s.eyebrow || 'ISKCON Coimbatore',
      title: s.heading,
      text: s.text,
      image: imageOf(s.image),
      art: (s.artwork ?? 'temple') as ArtTheme,
      primary: { label: s.buttonLabel || 'Learn more', href: s.link || '/festivals' },
      navLabel: s.heading,
      navMeta: s.eyebrow || '',
    })),
    ...festivalSevas.docs.filter((s) => isSevaActive(s)).map((s) => ({
      id: `seva-${s.id}`,
      eyebrow: s.endDate ? `Offer seva until ${formatDate(s.endDate, { day: 'numeric', month: 'short' })}` : 'Festival seva',
      title: s.title,
      text: s.shortDescription,
      image: imageOf(s.image),
      art: (s.artwork ?? 'lamps') as ArtTheme,
      primary: { label: 'Offer this seva', href: `/donate/${s.slug}` },
      secondary: { label: 'All sevas', href: '/donate' },
      navLabel: s.title,
      navMeta: 'Seva now open',
    })),
    ...festivals.docs.filter((f) => f.showInHero !== false).map((f) => ({
      id: `festival-${f.id}`,
      eyebrow: `${formatDate(f.date, { weekday: 'short', day: 'numeric', month: 'long' })} · ${daysUntil(f.date)}`,
      title: f.name,
      text: f.shortDescription,
      image: imageOf(f.image),
      art: (f.artwork ?? 'lotus') as ArtTheme,
      primary: { label: 'Sponsor the festival', href: `/festivals/${f.slug}` },
      secondary: { label: 'Festival calendar', href: '/festivals' },
      navLabel: f.name,
      navMeta: `${formatDate(f.date, { day: 'numeric', month: 'short' })} · ${daysUntil(f.date)}`,
    })),
  ]
  slides.unshift({
    id: 'welcome',
    eyebrow: 'Hare Krishna · Welcome home',
    title: 'Abode of Sri Sri Jagannath, Baladeva & Subhadra',
    text: 'Come for darshan, stay for kirtan and prasadam. Everyone is welcome at Sri Jagannath Mandir, Coimbatore.',
    image: null,
    art: 'temple',
    primary: { label: "Today's Darshan", href: '/daily-darshan' },
    secondary: { label: 'Temple timings', href: '/contact#timings' },
    navLabel: 'Sri Jagannath Mandir',
    navMeta: 'Open daily',
  })

  const highlights = populated<Seva>(home.highlightSevas).filter((s) => isSevaActive(s))
  const donationSevas = populated<Seva>(home.donationSevas).filter((s) => isSevaActive(s))

  return (
    <>
      <HeroSlider slides={slides.slice(0, 6)} />
      <ScheduleTicker items={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))} />

      {/* Three ways to serve — arch cards */}
      {highlights.length > 0 && (
        <section className="relative overflow-hidden bg-cream py-20">
          <Mandala className="pointer-events-none absolute -right-48 top-10 size-[520px] text-purple-200/60" />
          <div className="container-x relative">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Eyebrow>Begin with one offering</Eyebrow>
                <h2 className="text-4xl md:text-5xl">Three ways to serve today</h2>
              </div>
              <Link href="/donate" className="font-semibold text-purple-700 hover:text-purple-900">All sevas →</Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {highlights.map((s, i) => (
                <Link key={s.id} href={`/donate/${s.slug}`} className="group text-center">
                  <div className="arch relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden md:max-w-xs ring-4 ring-white shadow-xl transition duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                    <div className="absolute inset-0 transition duration-700 group-hover:scale-110">
                      <ImageOrPlaceholder media={s.image} art={(s.artwork ?? (['lotus', 'lamps', 'book'] as const)[i % 3]) as ArtTheme} />
                    </div>
                    <div className="arch pointer-events-none absolute inset-3 border border-saffron-300/70" />
                  </div>
                  <h3 className="mt-6 text-2xl group-hover:text-purple-600">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{s.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="container-x grid items-center gap-16 py-24 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-md">
          <Mandala className="spin-slow absolute -inset-16 text-saffron-500/25" />
          <div className="arch relative aspect-[4/5] overflow-hidden shadow-2xl ring-8 ring-white">
            <ImageOrPlaceholder media={home.about?.image} art="temple" alt="Srila Prabhupada" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-2xl bg-saffron-500 px-5 py-4 text-purple-950 shadow-xl md:-right-10">
            <p className="font-serif text-3xl leading-none">1966</p>
            <p className="text-xs font-semibold uppercase tracking-wider">ISKCON founded</p>
          </div>
        </div>
        <div>
          <Eyebrow>About ISKCON Coimbatore</Eyebrow>
          <h2 className="text-4xl leading-tight md:text-5xl">
            A spiritual home for <span className="italic text-purple-600">everyone</span> seeking Krishna
          </h2>
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted">
            {home.about?.text ||
              'ISKCON Coimbatore shares the timeless teachings of Bhagavad-gita and the joy of chanting the holy names, as taught by His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada.\n\nAt Sri Jagannath Mandir, families, students and seekers gather for daily worship, festivals, classes and prasadam.'}
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Spiritual guidance for everyone', 'Festivals, seva & community', 'Prasadam for all'].map((p, i) => (
              <li key={p} className="rounded-2xl border border-purple-100 p-4">
                <span className="font-serif text-2xl text-saffron-600">0{i + 1}</span>
                <p className="mt-1 text-sm font-medium">{p}</p>
              </li>
            ))}
          </ol>
          <Link href="/about" className="btn-primary mt-8 px-7 py-3">Our story →</Link>
        </div>
      </section>

      {/* Quote */}
      <section className="relative isolate overflow-hidden bg-purple-950 py-28 text-center text-white">
        <Mandala className="spin-slow absolute left-1/2 top-1/2 -z-10 size-[760px] -translate-x-1/2 -translate-y-1/2 text-saffron-500/15" rings={5} />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#1c0a33_70%)]" />
        <div className="container-x max-w-3xl">
          <p className="font-serif text-6xl leading-none text-saffron-500">“</p>
          <p className="text-gold-gradient font-serif text-3xl leading-snug md:text-4xl">
            Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform — do that as an offering unto Me.
          </p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">Bhagavad-gītā 9.27</p>
        </div>
      </section>

      {/* Donation bento */}
      {donationSevas.length > 0 && (
        <section className="py-24">
          <div className="container-x">
            <div className="mb-12 text-center">
              <Eyebrow>Offer a seva</Eyebrow>
              <h2 className="text-4xl md:text-5xl">Turn your offering into prasad</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {donationSevas.map((s, i) => (
                <DonationCard
                  key={s.id}
                  featured={i === 0}
                  wide={donationSevas.length === 4 && i === 3}
                  badge={s.category === 'festival' ? 'Festival' : i === 0 ? 'Most loved' : undefined}
                  slug={s.slug}
                  title={s.title}
                  description={s.shortDescription}
                  amounts={(s.presetAmounts ?? []).map((p) => p.amount)}
                  image={<ImageOrPlaceholder media={s.image} art={(s.artwork ?? 'lotus') as ArtTheme} sizes="(min-width: 1024px) 33vw, 100vw" />}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nitya Seva + WhatsApp, side by side */}
      <section className="container-x grid gap-5 pb-24 lg:grid-cols-[1.6fr_1fr]">
        {monthlySevas.docs.length > 0 && (
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 p-8 text-white md:p-12">
            <Mandala className="absolute -bottom-32 -right-32 -z-10 size-96 text-saffron-500/20" />
            <Eyebrow light>Nitya Seva · monthly</Eyebrow>
            <h2 className="max-w-md text-3xl text-white md:text-4xl">Offer a little, every month</h2>
            <p className="mb-8 mt-3 max-w-md text-purple-100">Set it once, serve all year. Cancel anytime on WhatsApp or email.</p>
            <NityaSevaForm sevas={monthlySevas.docs.map((s) => ({ slug: s.slug, title: s.title }))} />
            <p className="mt-4 text-xs text-purple-100/80">Eligible for 80G · Instant receipt</p>
          </div>
        )}
        <div className="flex flex-col gap-5">
          {settings.whatsapp && (
            <a
              href={waLink(settings.whatsapp, 'Hare Krishna!')}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-1 flex-col justify-between rounded-3xl bg-[#e7f9ee] p-8 transition hover:bg-[#d8f5e3]"
            >
              <WhatsAppIcon className="size-10 text-[#25d366]" />
              <div className="mt-6">
                <h3 className="text-2xl">Your seva assistant</h3>
                <p className="mt-1 text-sm text-muted">Receipts, questions and temple information on WhatsApp.</p>
                <span className="mt-4 inline-block font-semibold text-[#128c4a] group-hover:underline">Start a chat →</span>
              </div>
            </a>
          )}
          {home.livePuja?.link && (
            <a
              href={home.livePuja.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-1 flex-col justify-between rounded-3xl bg-saffron-100 p-8 transition hover:bg-saffron-300/50"
            >
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase text-white">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                Live
              </span>
              <div className="mt-6">
                <h3 className="text-2xl">Join the puja live</h3>
                <p className="mt-1 text-sm text-muted">{home.livePuja.schedule} · Free to join</p>
                <span className="mt-4 inline-block font-semibold text-purple-700 group-hover:underline">Watch now →</span>
              </div>
            </a>
          )}
        </div>
      </section>

      {/* Festival timeline */}
      {festivals.docs.length > 0 && (
        <section className="relative overflow-hidden bg-cream py-24">
          <div className="container-x">
            <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Eyebrow>Celebrate with us</Eyebrow>
                <h2 className="text-4xl md:text-5xl">The festival calendar</h2>
              </div>
              <Link href="/festivals" className="font-semibold text-purple-700 hover:text-purple-900">Full calendar →</Link>
            </div>
            <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <span className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-saffron-500 via-purple-300 to-transparent lg:block" />
              {festivals.docs.map((f: Festival) => (
                <li key={f.id} className="group relative">
                  <div className="relative mb-6 flex items-end gap-3">
                    <div className="z-10 grid size-[76px] shrink-0 place-items-center rounded-2xl bg-purple-800 text-center text-white shadow-lg ring-4 ring-cream transition group-hover:bg-saffron-500 group-hover:text-purple-950">
                      <div>
                        <p className="font-serif text-3xl leading-none">{formatDate(f.date, { day: 'numeric' })}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider">{formatDate(f.date, { month: 'short' })}</p>
                      </div>
                    </div>
                    <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-saffron-600">{daysUntil(f.date)}</p>
                  </div>
                  <Link href={`/festivals/${f.slug}`} className="block overflow-hidden rounded-2xl bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <ImageOrPlaceholder media={f.image} art={(f.artwork ?? 'lotus') as ArtTheme} sizes="(min-width: 1024px) 25vw, 50vw" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl">{f.name}</h3>
                      {f.timeLabel && <p className="text-xs text-muted">{f.timeLabel}</p>}
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{f.shortDescription}</p>
                      <span className="mt-4 inline-block text-sm font-semibold text-purple-700">Support →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className="relative isolate overflow-hidden bg-purple-800 py-20">
        <Mandala className="absolute -left-40 -top-40 -z-10 size-[480px] text-saffron-500/15" />
        <Mandala className="absolute -bottom-40 -right-40 -z-10 size-[480px] text-saffron-500/15" />
        <div className="container-x max-w-3xl text-center">
          <Eyebrow light>Festival alerts</Eyebrow>
          <h2 className="text-4xl text-white md:text-5xl">Never miss a festival</h2>
          <p className="mb-10 mt-3 text-purple-100">One gentle reminder before every festival and special programme.</p>
          <SubscribeForm />
        </div>
      </section>

      {/* Services */}
      {services.docs.length > 0 && (
        <section className="container-x py-24">
          <div className="mb-12 text-center">
            <Eyebrow>Serve and be served</Eyebrow>
            <h2 className="text-4xl md:text-5xl">Devotional services</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.docs.map((s, i) => (
              <article key={s.id} className="group overflow-hidden rounded-3xl border border-purple-100 bg-white transition hover:-translate-y-1 hover:border-saffron-300 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 transition duration-700 group-hover:scale-105">
                    <ImageOrPlaceholder media={s.image} art={(['lotus', 'temple', 'lamps'] as const)[i % 3]} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="btn-primary px-7 py-3">All services</Link>
          </div>
        </section>
      )}

      {/* Courses — numbered list */}
      {courses.docs.length > 0 && (
        <section className="bg-purple-50 py-24">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <Eyebrow>Learn</Eyebrow>
              <h2 className="text-4xl md:text-5xl">Wisdom for everyday life</h2>
              <p className="mt-4 text-muted">Free classes on chanting, Bhagavad-gita and Srimad Bhagavatam, online and at the temple.</p>
              <Link href="/courses" className="btn-primary mt-8 px-7 py-3">All courses</Link>
            </div>
            <ol className="divide-y divide-purple-200 border-y border-purple-200">
              {courses.docs.map((c, i) => (
                <li key={c.id} className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 py-7 sm:grid-cols-[auto_1fr_auto]">
                  <span className="font-serif text-4xl text-saffron-500 transition group-hover:text-purple-600">0{i + 1}</span>
                  <div>
                    <h3 className="text-2xl">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {c.schedule}
                      {c.mode && ` · ${c.mode === 'online' ? 'Online' : c.mode === 'temple' ? 'At the temple' : 'Online & at the temple'}`}
                    </p>
                  </div>
                  {c.zoomLink ? (
                    <a href={c.zoomLink} target="_blank" rel="noopener noreferrer" className="btn-outline col-start-2 w-fit text-purple-700 sm:col-start-auto">Join on Zoom</a>
                  ) : (
                    <Link href="/courses" className="btn-outline col-start-2 w-fit text-purple-700 sm:col-start-auto">Register</Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Blog */}
      {posts.docs.length > 0 && (
        <section className="container-x py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Eyebrow>From the blog</Eyebrow>
              <h2 className="text-4xl md:text-5xl">Latest articles</h2>
            </div>
            <Link href="/blog" className="font-semibold text-purple-700">All articles →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.docs.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                  <ImageOrPlaceholder media={p.image} className="transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-saffron-600">{p.category} · {formatDate(p.publishedAt)}</p>
                <h3 className="mt-1 text-xl group-hover:text-purple-600">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Instagram */}
      {settings.instagram && (
        <section className="border-t border-purple-100 bg-cream">
          <div className="container-x flex flex-col items-center justify-between gap-6 py-12 md:flex-row">
            <p className="font-serif text-3xl text-purple-800">
              Darshan, every day, on <span className="italic text-purple-600">Instagram</span>
            </p>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="btn-primary px-7 py-3">
              <InstagramIcon /> Follow us
            </a>
          </div>
        </section>
      )}
    </>
  )
}
