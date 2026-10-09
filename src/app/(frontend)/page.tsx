import Link from 'next/link'
import type { Seva } from '@/payload-types'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons'
import { SectionHeading } from '@/components/SectionHeading'
import { DonationCard } from '@/components/home/DonationCard'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { SubscribeForm } from '@/components/home/SubscribeForm'
import { formatDate, waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { isSevaActive, populated } from '@/lib/sevas'

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayloadClient()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [home, settings, festivals, services, courses, posts, monthlySevas, latestDarshan] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({ collection: 'festivals', where: { date: { greater_than_equal: todayStart } }, sort: 'date', limit: 3 }),
    payload.find({ collection: 'services', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({ collection: 'courses', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }),
    payload.find({ collection: 'sevas', where: { allowMonthly: { equals: true } }, limit: 20 }),
    payload.find({ collection: 'darshan-days', sort: '-date', limit: 1 }),
  ])

  const slide = home.heroSlides?.[0]
  const heroImage = slide?.image ?? populated(latestDarshan.docs[0]?.photos)[0]
  const highlights = populated<Seva>(home.highlightSevas).filter((s) => isSevaActive(s))
  const donationSevas = populated<Seva>(home.donationSevas).filter((s) => isSevaActive(s))

  return (
    <>
      {/* 1. Hero */}
      <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden bg-purple-950 text-white">
        {heroImage && <ImageOrPlaceholder media={heroImage} size="hero" sizes="100vw" priority className="-z-10 opacity-60" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-950 via-purple-950/50 to-purple-900/20" />
        <div className="container-x py-24 pb-40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-saffron-300">Hare Krishna · Welcome</p>
          <h1 className="max-w-3xl text-4xl leading-tight text-white md:text-6xl">
            {slide?.heading || 'Abode of Sri Sri Jagannath, Baladeva & Subhadra'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-purple-100">
            {slide?.text || 'Come for darshan, stay for kirtan and prasadam. Everyone is welcome at Sri Jagannath Mandir, Coimbatore.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={slide?.link || '/contact#timings'} className="btn-donate">
              Temple Schedule
            </Link>
            <Link href="/daily-darshan" className="btn-outline text-white">
              View Daily Darshan
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Highlight cards overlapping the banner */}
      {highlights.length > 0 && (
        <section className="container-x relative z-10 -mt-24 grid gap-4 md:grid-cols-3">
          {highlights.map((s) => (
            <Link
              key={s.id}
              href={`/donate/${s.slug}`}
              className="group rounded-2xl border-b-4 border-saffron-500 bg-white p-6 shadow-xl transition hover:-translate-y-1"
            >
              <h3 className="text-xl group-hover:text-purple-600">{s.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{s.shortDescription}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-purple-700">Offer seva →</span>
            </Link>
          ))}
        </section>
      )}

      {/* 3. About */}
      <section className="container-x grid items-center gap-12 py-20 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg">
          <ImageOrPlaceholder media={home.about?.image} alt="Srila Prabhupada" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div>
          <SectionHeading eyebrow="About ISKCON" title="A home for everyone seeking Krishna" />
          <p className="whitespace-pre-line text-muted">
            {home.about?.text ||
              'ISKCON Coimbatore was established to share the timeless teachings of Bhagavad-gita and the joy of chanting the holy names, as taught by His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada.\n\nAt Sri Jagannath Mandir we welcome families, students and seekers to daily worship, festivals, classes and prasadam.'}
          </p>
          <ul className="mt-6 space-y-3">
            {['Spiritual guidance for everyone', 'Festivals, seva & community programmes', 'Prasadam distribution'].map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-saffron-100 text-xs text-purple-800">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <Link href="/about" className="btn-primary mt-8">
            Read More
          </Link>
        </div>
      </section>

      {/* 4. WhatsApp help strip */}
      {settings.whatsapp && (
        <section className="bg-saffron-100">
          <div className="container-x flex flex-col items-center gap-4 py-8 text-center md:flex-row md:text-left">
            <WhatsAppIcon className="size-10 shrink-0 text-[#25d366]" />
            <p className="flex-1 text-purple-900">
              <strong className="font-serif text-lg">Your personal seva assistant</strong> — download receipts, ask questions and get
              temple information on WhatsApp.
            </p>
            <a href={waLink(settings.whatsapp, 'Hare Krishna!')} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Chat on WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* 5. Quote */}
      <section className="bg-purple-800 py-20 text-center text-white">
        <div className="container-x max-w-3xl">
          <p className="font-serif text-2xl leading-relaxed md:text-3xl">
            “Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform — do that as an
            offering unto Me.”
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-300">Bhagavad-gītā 9.27</p>
        </div>
      </section>

      {/* 6. Donation cards */}
      {donationSevas.length > 0 && (
        <section className="bg-cream py-20">
          <div className="container-x">
            <SectionHeading eyebrow="Offer a seva" title="Turn your offering into prasad" center />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {donationSevas.map((s) => (
                <DonationCard
                  key={s.id}
                  slug={s.slug}
                  title={s.title}
                  description={s.shortDescription}
                  amounts={(s.presetAmounts ?? []).map((p) => p.amount)}
                  image={<ImageOrPlaceholder media={s.image} sizes="(min-width: 1024px) 25vw, 50vw" />}
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/donate" className="btn-primary">
                View All Sevas
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. Nitya Seva */}
      {monthlySevas.docs.length > 0 && (
        <section className="container-x py-16">
          <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-purple-900 p-8 text-white md:p-12">
            <div className="mb-6 max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300">Nitya Seva</p>
              <h2 className="text-3xl text-white">Offer a little every month</h2>
            </div>
            <NityaSevaForm sevas={monthlySevas.docs.map((s) => ({ slug: s.slug, title: s.title }))} />
            <p className="mt-4 text-sm text-purple-100">All donations are eligible for 80G and an instant receipt.</p>
          </div>
        </section>
      )}

      {/* 8. Live puja */}
      {home.livePuja?.link && (
        <section className="container-x pb-16">
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-purple-100 p-8 md:flex-row md:items-center">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">Live</span>
            <div className="flex-1">
              <h2 className="text-2xl">Join the daily puja live</h2>
              <p className="text-muted">{home.livePuja.schedule} · Free to join</p>
            </div>
            <a href={home.livePuja.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Join
            </a>
          </div>
        </section>
      )}

      {/* 9. Upcoming festivals */}
      {festivals.docs.length > 0 && (
        <section className="bg-cream py-20">
          <div className="container-x">
            <SectionHeading eyebrow="Celebrate with us" title="Upcoming festivals" center />
            <div className="grid gap-6 md:grid-cols-3">
              {festivals.docs.map((f) => (
                <article key={f.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative aspect-video">
                    <ImageOrPlaceholder media={f.image} />
                    <span className="absolute left-4 top-4 rounded-full bg-saffron-500 px-3 py-1 text-xs font-bold text-purple-950">
                      {formatDate(f.date, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl">
                      <Link href={`/festivals/${f.slug}`} className="hover:text-purple-600">{f.name}</Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{f.shortDescription}</p>
                    <Link href={`/festivals/${f.slug}`} className="btn-donate mt-4">Support</Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/festivals" className="btn-primary">View All Festivals</Link>
            </div>
          </div>
        </section>
      )}

      {/* 10. Festival alerts */}
      <section className="bg-purple-900 py-16">
        <div className="container-x max-w-3xl">
          <h2 className="mb-2 text-center text-3xl text-white">Never miss a festival</h2>
          <p className="mb-8 text-center text-purple-100">Get a reminder before every festival and special programme.</p>
          <SubscribeForm />
        </div>
      </section>

      {/* 11. Devotional services */}
      {services.docs.length > 0 && (
        <section className="container-x py-20">
          <SectionHeading eyebrow="Serve and be served" title="Devotional services" center />
          <div className="grid gap-6 md:grid-cols-3">
            {services.docs.map((s) => (
              <article key={s.id} className="overflow-hidden rounded-2xl border border-purple-100">
                <div className="relative aspect-video">
                  <ImageOrPlaceholder media={s.image} />
                </div>
                <div className="p-5">
                  <h3 className="text-xl">{s.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{s.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="btn-primary">View All Services</Link>
          </div>
        </section>
      )}

      {/* 13. Courses (12. YouTube strip needs a YouTube API key; added later) */}
      {courses.docs.length > 0 && (
        <section className="bg-cream py-20">
          <div className="container-x">
            <SectionHeading eyebrow="Learn" title="Spiritual courses" center />
            <div className="grid gap-6 md:grid-cols-3">
              {courses.docs.map((c) => (
                <article key={c.id} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-xl">{c.title}</h3>
                  {c.schedule && <p className="mt-1 text-sm font-medium text-saffron-600">{c.schedule}</p>}
                  <p className="mt-3 flex-1 text-sm text-muted">{c.description}</p>
                  {c.zoomLink ? (
                    <a href={c.zoomLink} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">Join on Zoom</a>
                  ) : (
                    <Link href="/courses" className="btn-primary mt-5">Register</Link>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/courses" className="btn-outline text-purple-700">View All Courses</Link>
            </div>
          </div>
        </section>
      )}

      {/* 14. Latest blogs */}
      {posts.docs.length > 0 && (
        <section className="container-x py-20">
          <SectionHeading eyebrow="From the blog" title="Latest articles" center />
          <div className="grid gap-6 md:grid-cols-3">
            {posts.docs.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-2xl border border-purple-100">
                <div className="relative aspect-video">
                  <ImageOrPlaceholder media={p.image} />
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted">{formatDate(p.publishedAt)}</p>
                  <h3 className="mt-1 text-lg group-hover:text-purple-600">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/blog" className="btn-primary">View All Blogs</Link>
          </div>
        </section>
      )}

      {/* 15. Instagram */}
      {settings.instagram && (
        <section className="border-t border-purple-100 py-12 text-center">
          <p className="font-serif text-2xl text-purple-800">Follow ISKCON Coimbatore on Instagram</p>
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
            <InstagramIcon /> Follow us
          </a>
        </section>
      )}
    </>
  )
}
