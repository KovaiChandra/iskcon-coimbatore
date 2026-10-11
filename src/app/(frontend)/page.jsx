import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { DonationCard } from '@/components/home/DonationCard'
import { HeroSlider } from '@/components/home/HeroSlider'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { ScheduleTicker } from '@/components/home/ScheduleTicker'
import { SubscribeForm } from '@/components/home/SubscribeForm'
import { blurDataURL } from '@/lib/blur'
import { formatDate, mediaUrl, waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { isSevaActive, populated } from '@/lib/sevas'
import styles from './home.module.css'

export const revalidate = 60

const DAY = 86_400_000

function daysUntil(date) {
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  const d = Math.round((new Date(date).setHours(0, 0, 0, 0) - startOfToday) / DAY)
  return d <= 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`
}

function Eyebrow({ children, light }) {
  return (
    <p className={`${styles.eyebrow} ${light ? styles.eyebrowLight : ''}`}>
      <Sparkle size={10} />
      {children}
    </p>
  )
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [
    home,
    settings,
    timings,
    festivals,
    services,
    courses,
    posts,
    monthlySevas,
    festivalSevas,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 2 }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'temple-timings' }),
    payload.find({
      collection: 'festivals',
      where: { date: { greater_than_equal: todayStart } },
      sort: 'date',
      limit: 4,
    }),
    payload.find({ collection: 'services', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({ collection: 'courses', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 3,
    }),
    payload.find({ collection: 'sevas', where: { allowMonthly: { equals: true } }, limit: 20 }),
    payload.find({ collection: 'sevas', where: { category: { equals: 'festival' } }, limit: 10 }),
  ])

  // ---- Slideshow: the slides staff curate in admin; if there are none, an automatic set
  const heroMedia = new Map()
  const imageOf = (m) => {
    const url = mediaUrl(m, 'hero')
    if (!url || typeof m !== 'object' || !m) return null
    heroMedia.set(url, m)
    return {
      url,
      alt: m.alt,
      focalX: m.focalX ?? 50,
      focalY: m.focalY ?? 50,
      ratio: m.width && m.height ? m.width / m.height : undefined,
    }
  }
  const customSlides = (home.heroSlides ?? []).map((s, i) => ({
    id: `custom-${s.id ?? i}`,
    eyebrow: s.eyebrow || 'ISKCON Coimbatore',
    title: s.heading,
    text: s.text,
    verse: s.verse,
    layout: s.layout ?? 'arch',
    image: imageOf(s.image),
    art: s.artwork ?? 'temple',
    primary: { label: s.buttonLabel || 'Learn more', href: s.link || '/festivals' },
    navLabel: s.heading,
    navMeta: s.eyebrow || '',
  }))
  const autoSlides = [
    ...festivalSevas.docs
      .filter((s) => isSevaActive(s))
      .map((s) => ({
        id: `seva-${s.id}`,
        eyebrow: s.endDate
          ? `Offer seva until ${formatDate(s.endDate, { day: 'numeric', month: 'short' })}`
          : 'Festival seva',
        title: s.title,
        text: s.shortDescription,
        image: imageOf(s.image),
        art: s.artwork ?? 'lamps',
        primary: { label: 'Offer this seva', href: `/donate/${s.slug}` },
        secondary: { label: 'All sevas', href: '/donate' },
        navLabel: s.title,
        navMeta: 'Seva now open',
      })),
    ...festivals.docs
      .filter((f) => f.showInHero !== false)
      .map((f) => ({
        id: `festival-${f.id}`,
        eyebrow: `${formatDate(f.date, { weekday: 'short', day: 'numeric', month: 'long' })} · ${daysUntil(f.date)}`,
        title: f.name,
        text: f.shortDescription,
        image: imageOf(f.image),
        art: f.artwork ?? 'lotus',
        primary: { label: 'Sponsor the festival', href: `/festivals/${f.slug}` },
        secondary: { label: 'Festival calendar', href: '/festivals' },
        navLabel: f.name,
        navMeta: `${formatDate(f.date, { day: 'numeric', month: 'short' })} · ${daysUntil(f.date)}`,
      })),
  ]
  autoSlides.unshift({
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
  const slides = customSlides.length > 0 ? customSlides : autoSlides.slice(0, 3)
  // Tiny blurred previews so each hero photo appears instantly while the full image loads
  await Promise.all(
    slides.map(async (s) => {
      const m = s.image && heroMedia.get(s.image.url)
      if (s.image && m) s.image.blur = await blurDataURL(m)
    }),
  )

  const highlights = populated(home.highlightSevas).filter((s) => isSevaActive(s))
  const donationSevas = populated(home.donationSevas).filter((s) => isSevaActive(s))

  return (
    <>
      <HeroSlider slides={slides} />
      <ScheduleTicker
        items={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))}
      />

      {/* Three ways to serve — arch cards */}
      {highlights.length > 0 && (
        <section className={styles.serve}>
          <Mandala className={styles.serveMandala} />
          <div className={`container-x ${styles.relative}`}>
            <div className={styles.sectionHead}>
              <div>
                <Eyebrow>Begin with one offering</Eyebrow>
                <h2 className={styles.h2}>Three ways to serve today</h2>
              </div>
              <Link href="/donate" className={styles.moreLink}>
                All sevas →
              </Link>
            </div>
            <div className={styles.serveGrid}>
              {highlights.map((s, i) => (
                <Link key={s.id} href={`/donate/${s.slug}`} className={styles.serveCard}>
                  <div className={`arch ${styles.serveArch}`}>
                    <div className={styles.media}>
                      <ImageOrPlaceholder
                        media={s.image}
                        art={s.artwork ?? ['lotus', 'lamps', 'book'][i % 3]}
                      />
                    </div>
                    <div className={`arch ${styles.serveArchLine}`} />
                  </div>
                  <h3 className={styles.serveTitle}>{s.title}</h3>
                  <p className={styles.serveText}>{s.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className={`container-x ${styles.about}`}>
        <div className={styles.aboutPhotoWrap}>
          <Mandala className={`spin-slow ${styles.aboutMandala}`} />
          <div className={`arch ${styles.aboutPhoto}`}>
            <ImageOrPlaceholder
              media={home.about?.image}
              art="temple"
              alt="Srila Prabhupada"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div className={styles.yearBadge}>
            <p className={styles.yearNumber}>1966</p>
            <p className={styles.yearLabel}>ISKCON founded</p>
          </div>
        </div>
        <div>
          <Eyebrow>About ISKCON Coimbatore</Eyebrow>
          <h2 className={`${styles.h2} ${styles.aboutTitle}`}>
            A spiritual home for <span className={styles.accent}>everyone</span> seeking Krishna
          </h2>
          <p className={styles.aboutText}>
            {home.about?.text ||
              'ISKCON Coimbatore shares the timeless teachings of Bhagavad-gita and the joy of chanting the holy names, as taught by His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada.\n\nAt Sri Jagannath Mandir, families, students and seekers gather for daily worship, festivals, classes and prasadam.'}
          </p>
          <ol className={styles.points}>
            {[
              'Spiritual guidance for everyone',
              'Festivals, seva & community',
              'Prasadam for all',
            ].map((p, i) => (
              <li key={p} className={styles.point}>
                <span className={styles.pointNumber}>0{i + 1}</span>
                <p className={styles.pointText}>{p}</p>
              </li>
            ))}
          </ol>
          <Link href="/about" className={`btn-primary ${styles.btnBig} ${styles.aboutButton}`}>
            Our story →
          </Link>
        </div>
      </section>

      {/* Quote */}
      <section className={styles.quote}>
        <Mandala className={`spin-slow ${styles.quoteMandala}`} rings={5} />
        <div className={styles.quoteVignette} />
        <div className={`container-x ${styles.quoteInner}`}>
          <p className={styles.quoteMark}>“</p>
          <p className={`text-gold-gradient ${styles.quoteText}`}>
            Whatever you do, whatever you eat, whatever you offer or give away, and whatever
            austerities you perform — do that as an offering unto Me.
          </p>
          <p className={styles.quoteSource}>Bhagavad-gītā 9.27</p>
        </div>
      </section>

      {/* Donation bento */}
      {donationSevas.length > 0 && (
        <section className={styles.donate}>
          <div className="container-x">
            <div className={styles.sectionHeadCenter}>
              <Eyebrow>Offer a seva</Eyebrow>
              <h2 className={styles.h2}>Turn your offering into prasad</h2>
            </div>
            <div className={styles.donateGrid}>
              {donationSevas.map((s, i) => (
                <DonationCard
                  key={s.id}
                  featured={i === 0}
                  wide={donationSevas.length === 4 && i === 3}
                  badge={
                    s.category === 'festival' ? 'Festival' : i === 0 ? 'Most loved' : undefined
                  }
                  slug={s.slug}
                  title={s.title}
                  description={s.shortDescription}
                  amounts={(s.presetAmounts ?? []).map((p) => p.amount)}
                  image={
                    <ImageOrPlaceholder
                      media={s.image}
                      art={s.artwork ?? 'lotus'}
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nitya Seva + WhatsApp, side by side */}
      <section className={`container-x ${styles.trio}`}>
        {monthlySevas.docs.length > 0 && (
          <div className={styles.nitya}>
            <Mandala className={styles.nityaMandala} />
            <Eyebrow light>Nitya Seva · monthly</Eyebrow>
            <h2 className={styles.nityaTitle}>Offer a little, every month</h2>
            <p className={styles.nityaText}>
              Set it once, serve all year. Cancel anytime on WhatsApp or email.
            </p>
            <NityaSevaForm
              sevas={monthlySevas.docs.map((s) => ({ slug: s.slug, title: s.title }))}
            />
            <p className={styles.nityaNote}>Eligible for 80G · Instant receipt</p>
          </div>
        )}
        <div className={styles.sideCards}>
          {settings.whatsapp && (
            <a
              href={waLink(settings.whatsapp, 'Hare Krishna!')}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.sideCard} ${styles.whatsappCard}`}
            >
              <WhatsAppIcon size={40} className={styles.whatsappIcon} />
              <div className={styles.sideBody}>
                <h3 className={styles.sideTitle}>Your seva assistant</h3>
                <p className={styles.sideText}>
                  Receipts, questions and temple information on WhatsApp.
                </p>
                <span className={`${styles.sideLink} ${styles.whatsappLink}`}>Start a chat →</span>
              </div>
            </a>
          )}
          {home.livePuja?.link && (
            <a
              href={home.livePuja.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.sideCard} ${styles.liveCard}`}
            >
              <span className={styles.liveBadge}>
                <span className={styles.liveDot}>
                  <span className={styles.liveDotPing} />
                  <span className={styles.liveDotCore} />
                </span>
                Live
              </span>
              <div className={styles.sideBody}>
                <h3 className={styles.sideTitle}>Join the puja live</h3>
                <p className={styles.sideText}>{home.livePuja.schedule} · Free to join</p>
                <span className={`${styles.sideLink} ${styles.liveLink}`}>Watch now →</span>
              </div>
            </a>
          )}
        </div>
      </section>

      {/* Festival timeline */}
      {festivals.docs.length > 0 && (
        <section className={styles.festivals}>
          <div className="container-x">
            <div className={`${styles.sectionHead} ${styles.festivalsHead}`}>
              <div>
                <Eyebrow>Celebrate with us</Eyebrow>
                <h2 className={styles.h2}>The festival calendar</h2>
              </div>
              <Link href="/festivals" className={styles.moreLink}>
                Full calendar →
              </Link>
            </div>
            <ol className={styles.timeline}>
              <span className={styles.timelineLine} />
              {festivals.docs.map((f) => (
                <li key={f.id} className={styles.festival}>
                  <div className={styles.dateRow}>
                    <div className={styles.dateBox}>
                      <div>
                        <p className={styles.dateDay}>{formatDate(f.date, { day: 'numeric' })}</p>
                        <p className={styles.dateMonth}>{formatDate(f.date, { month: 'short' })}</p>
                      </div>
                    </div>
                    <p className={styles.countdown}>{daysUntil(f.date)}</p>
                  </div>
                  <Link href={`/festivals/${f.slug}`} className={styles.festivalCard}>
                    <div className={styles.cardImage}>
                      <ImageOrPlaceholder
                        media={f.image}
                        art={f.artwork ?? 'lotus'}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{f.name}</h3>
                      {f.timeLabel && <p className={styles.small}>{f.timeLabel}</p>}
                      <p className={styles.clamp2}>{f.shortDescription}</p>
                      <span className={styles.support}>Support →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Subscribe */}
      <section className={styles.subscribe}>
        <Mandala className={styles.subMandalaTop} />
        <Mandala className={styles.subMandalaBottom} />
        <div className={`container-x ${styles.subscribeInner}`}>
          <Eyebrow light>Festival alerts</Eyebrow>
          <h2 className={`${styles.h2} ${styles.h2White}`}>Never miss a festival</h2>
          <p className={styles.subscribeText}>
            One gentle reminder before every festival and special programme.
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* Services */}
      {services.docs.length > 0 && (
        <section className={`container-x ${styles.services}`}>
          <div className={styles.sectionHeadCenter}>
            <Eyebrow>Serve and be served</Eyebrow>
            <h2 className={styles.h2}>Devotional services</h2>
          </div>
          <div className={styles.threeGrid}>
            {services.docs.map((s, i) => (
              <article key={s.id} className={styles.service}>
                <div className={styles.cardImage}>
                  <div className={styles.media}>
                    <ImageOrPlaceholder media={s.image} art={['lotus', 'temple', 'lamps'][i % 3]} />
                  </div>
                </div>
                <div className={styles.cardBodyLarge}>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.serviceText}>{s.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.buttonRow}>
            <Link href="/services" className={`btn-primary ${styles.btnBig}`}>
              All services
            </Link>
          </div>
        </section>
      )}

      {/* Courses — numbered list */}
      {courses.docs.length > 0 && (
        <section className={styles.courses}>
          <div className={`container-x ${styles.coursesGrid}`}>
            <div>
              <Eyebrow>Learn</Eyebrow>
              <h2 className={styles.h2}>Wisdom for everyday life</h2>
              <p className={styles.coursesIntro}>
                Free classes on chanting, Bhagavad-gita and Srimad Bhagavatam, online and at the
                temple.
              </p>
              <Link
                href="/courses"
                className={`btn-primary ${styles.btnBig} ${styles.aboutButton}`}
              >
                All courses
              </Link>
            </div>
            <ol className={styles.courseList}>
              {courses.docs.map((c, i) => (
                <li key={c.id} className={styles.course}>
                  <span className={styles.courseNumber}>0{i + 1}</span>
                  <div>
                    <h3 className={styles.courseTitle}>{c.title}</h3>
                    <p className={styles.courseMeta}>
                      {c.schedule}
                      {c.mode &&
                        ` · ${c.mode === 'online' ? 'Online' : c.mode === 'temple' ? 'At the temple' : 'Online & at the temple'}`}
                    </p>
                  </div>
                  {c.zoomLink ? (
                    <a
                      href={c.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-outline ${styles.courseButton}`}
                    >
                      Join on Zoom
                    </a>
                  ) : (
                    <Link href="/courses" className={`btn-outline ${styles.courseButton}`}>
                      Register
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Blog */}
      {posts.docs.length > 0 && (
        <section className={`container-x ${styles.blog}`}>
          <div className={styles.blogHead}>
            <div>
              <Eyebrow>From the blog</Eyebrow>
              <h2 className={styles.h2}>Latest articles</h2>
            </div>
            <Link href="/blog" className={styles.moreLink}>
              All articles →
            </Link>
          </div>
          <div className={styles.threeGrid}>
            {posts.docs.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className={styles.post}>
                <div className={styles.postImage}>
                  <ImageOrPlaceholder media={p.image} className={styles.postImg} />
                </div>
                <p className={styles.postMeta}>
                  {p.category} · {formatDate(p.publishedAt)}
                </p>
                <h3 className={styles.postTitle}>{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Instagram */}
      {settings.instagram && (
        <section className={styles.instagram}>
          <div className={`container-x ${styles.instagramInner}`}>
            <p className={styles.instagramText}>
              Darshan, every day, on <span className={styles.accent}>Instagram</span>
            </p>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-primary ${styles.btnBig}`}
            >
              <InstagramIcon /> Follow us
            </a>
          </div>
        </section>
      )}
    </>
  )
}
