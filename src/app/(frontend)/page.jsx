import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { HeroSlider } from '@/components/home/HeroSlider'
import { LiveDarshan } from '@/components/home/LiveDarshan'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { ScheduleTicker } from '@/components/home/ScheduleTicker'
import { SevaOfferCard } from '@/components/home/SevaOfferCard'
import { SubscribeForm } from '@/components/home/SubscribeForm'
import { TempleGallery } from '@/components/home/TempleGallery'
import { VisitSection } from '@/components/home/VisitSection'
import { blurDataURL } from '@/lib/blur'
import { formatDate, mediaUrl, waLink } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { isSevaActive, populated } from '@/lib/sevas'
import styles from './home.module.css'

export const revalidate = 60

const DAY = 86_400_000

/** Default tiles and photos, matched by each photo's description (alt text) in Media */
const DEFAULT_EXPLORE = [
  {
    title: 'The Deities',
    text: 'Sri Sri Jagannath, Baladeva & Subhadra',
    alt: 'Sri Sri Jagannath, Baladeva and Subhadra',
    link: '/daily-darshan',
  },
  {
    title: 'Arati & Kirtan',
    text: 'Six aratis every day',
    alt: 'Sri Sri Jagannath, Baladeva and Subhadra in the glow of Kartik lamps',
    link: '#timings',
  },
  {
    title: 'Prasadam',
    text: 'Sanctified food for everyone',
    alt: 'Devotees serving Annadaan prasadam',
    link: '/donate/annadaan',
  },
  {
    title: 'Kovai Chandra',
    text: 'Our new temple, rising',
    alt: 'Kovai Chandra new temple under construction (banner)',
    link: '/donate/new-temple',
  },
  {
    title: 'Goshala',
    text: 'Caring for the cows',
    alt: 'A devotee feeding the cows at the goshala',
    link: '/donate/gau-seva',
  },
]
const DEFAULT_GALLERY = [
  'Sri Sri Jagannath, Baladeva and Subhadra with fruit garlands',
  'Devotees singing kirtan at Sri Jagannath Mandir',
  'Lord Jagannath in full shringar',
  'Sri Sri Jagannath, Baladeva and Subhadra in the glow of Kartik lamps',
  'Sri Jagannath Mandir at golden hour',
  'The main altar with Srila Prabhupada and the parampara',
  'Devotees serving prasadam at the temple mandapam',
  'A family honouring prasadam on the temple lawn',
  'Sri Jagannath with Sri Sri Gaura-Nitai, ISKCON Coimbatore',
  'Temple shikhara and flag at dusk',
  'A devotee feeding the cows at the goshala',
  'A family choosing Bhagavad-gita books at the temple',
]
const DEFAULT_REELS = [
  {
    video: 'A family visiting Sri Jagannath Mandir (video)',
    poster: 'A family arriving at Sri Jagannath Mandir',
  },
  { poster: 'Devotees singing kirtan at Sri Jagannath Mandir' },
  { poster: 'Lord Jagannath in full shringar' },
  { poster: 'Devotees serving prasadam at the temple mandapam' },
]
const NAMED_ALTS = [
  ...DEFAULT_EXPLORE.map((t) => t.alt),
  ...DEFAULT_GALLERY,
  ...DEFAULT_REELS.flatMap((r) => [r.video, r.poster]).filter(Boolean),
  'Krishna lifting Govardhan Hill',
  'His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada',
  'Lord Krishna speaking the Bhagavad-gita to Arjuna',
]

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
    courses,
    posts,
    monthlySevas,
    festivalSevas,
    namedMedia,
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
    payload.find({ collection: 'courses', where: { featured: { equals: true } }, limit: 3 }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 3,
    }),
    payload.find({ collection: 'sevas', where: { allowMonthly: { equals: true } }, limit: 20 }),
    payload.find({ collection: 'sevas', where: { category: { equals: 'festival' } }, limit: 10 }),
    payload.find({ collection: 'media', where: { alt: { in: NAMED_ALTS } }, limit: 100, depth: 0 }),
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
  const videoOf = (m) =>
    m && typeof m === 'object' && m.url ? { url: m.url, type: m.mimeType || 'video/mp4' } : null
  const customSlides = (home.heroSlides ?? []).map((s, i) => ({
    id: `custom-${s.id ?? i}`,
    eyebrow: s.eyebrow || 'ISKCON Coimbatore',
    title: s.heading,
    text: s.text,
    verse: s.verse,
    layout: s.layout ?? 'arch',
    tone: s.tone ?? 'purple',
    image: imageOf(s.image),
    video: videoOf(s.video),
    videoWebm: videoOf(s.videoWebm),
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

  // ---- Sevas for the single donation section (highlights first, then the rest)
  const sevas = []
  for (const sv of [...populated(home.highlightSevas), ...populated(home.donationSevas)]) {
    if (isSevaActive(sv) && !sevas.some((x) => x.id === sv.id)) sevas.push(sv)
  }

  // ---- Photos chosen by name, used when staff haven't picked their own in admin
  const byAlt = new Map(namedMedia.docs.map((m) => [m.alt, m]))
  const pick = (m, fallbackAlt) => (m && typeof m === 'object' ? m : byAlt.get(fallbackAlt))
  const photo = (m, size = 'card') => {
    const url = mediaUrl(m, size)
    return url && m
      ? { url, alt: m.alt, focalX: m.focalX, focalY: m.focalY, full: mediaUrl(m, 'hero') }
      : null
  }

  const exploreTiles = (home.exploreTiles?.length ? home.exploreTiles : DEFAULT_EXPLORE).map(
    (t) => ({
      title: t.title,
      text: t.text,
      link: t.link || '#',
      image: pick(t.image, t.alt),
    }),
  )

  const galleryMedia = populated(home.gallery).length
    ? populated(home.gallery)
    : DEFAULT_GALLERY.map((alt) => byAlt.get(alt)).filter(Boolean)
  const galleryPhotos = galleryMedia
    .slice(0, 12)
    .map((m) => photo(m))
    .filter(Boolean)

  const krishna = photo(pick(home.liveDarshan?.image, 'Krishna lifting Govardhan Hill'), 'hero')
  const founderImage = pick(
    home.founder?.image,
    'His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada',
  )
  const gitaImage = pick(
    home.gitaCourse?.image,
    'Lord Krishna speaking the Bhagavad-gita to Arjuna',
  )
  const youthImage = pick(home.youth?.image, 'Devotees singing kirtan at Sri Jagannath Mandir')
  const priestImage = pick(null, 'Sri Sri Jagannath, Baladeva and Subhadra with fruit garlands')

  const reels = home.instagramReels?.length
    ? home.instagramReels.map((r) => ({
        video: r.video && typeof r.video === 'object' ? r.video.url : null,
        poster: mediaUrl(r.poster, 'card'),
        link: r.link || settings.instagram,
      }))
    : DEFAULT_REELS.map((r) => ({
        video: byAlt.get(r.video)?.url ?? null,
        poster: mediaUrl(byAlt.get(r.poster), 'card'),
        link: settings.instagram,
      }))

  const whatsappChat = (text) => (settings.whatsapp ? waLink(settings.whatsapp, text) : '/contact')

  return (
    <>
      {/* 1. Hero */}
      <HeroSlider slides={slides} />
      <ScheduleTicker
        items={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))}
      />

      {/* 3. Explore the temple */}
      <section className={styles.explore}>
        <div className="container-x">
          <div className={styles.sectionHead}>
            <div>
              <Eyebrow>Explore the temple</Eyebrow>
              <h2 className={styles.h2}>Step inside Sri Jagannath Mandir</h2>
            </div>
            <Link href="/about" className={styles.moreLink}>
              About the temple →
            </Link>
          </div>
          <div className={`${styles.exploreGrid} ${styles.swipe}`}>
            {exploreTiles.map((t, i) => (
              <Link key={t.title} href={t.link} className={styles.exploreTile}>
                <div className={styles.media}>
                  <ImageOrPlaceholder
                    media={t.image}
                    art={['temple', 'lamps', 'lotus', 'temple', 'hill', 'book'][i % 6]}
                    sizes={
                      i === 0 ? '(min-width: 1024px) 50vw, 85vw' : '(min-width: 1024px) 25vw, 85vw'
                    }
                  />
                </div>
                <div className={styles.exploreShade} />
                <div className={styles.exploreBody}>
                  <h3 className={styles.exploreTitle}>{t.title}</h3>
                  {t.text && <p className={styles.exploreText}>{t.text}</p>}
                  <span className={styles.exploreArrow} aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Donations: one section for every seva */}
      {sevas.length > 0 && (
        <section className={styles.offer}>
          <Mandala className={styles.offerMandala} />
          <div className={`container-x ${styles.relative}`}>
            <div className={styles.sectionHead}>
              <div>
                <Eyebrow>Offer a seva</Eyebrow>
                <h2 className={styles.h2}>Turn your offering into prasad</h2>
                <p className={styles.sectionIntro}>
                  Every offering serves the Lord and His devotees. All donations are eligible for
                  80G tax exemption.
                </p>
              </div>
              <Link href="/donate" className={styles.moreLink}>
                All sevas →
              </Link>
            </div>
            <div className={`${styles.offerGrid} ${styles.swipe}`}>
              {sevas.map((sv, i) => (
                <SevaOfferCard
                  key={sv.id}
                  slug={sv.slug}
                  title={sv.title}
                  description={sv.shortDescription}
                  amounts={(sv.presetAmounts ?? []).map((p) => p.amount)}
                  badge={
                    sv.category === 'festival' ? 'Festival' : i === 0 ? 'Most loved' : undefined
                  }
                  tag={sv.allowMonthly ? 'Monthly or one-time' : undefined}
                  image={
                    <ImageOrPlaceholder
                      media={sv.cardImage || sv.image}
                      art={sv.artwork ?? 'lotus'}
                      sizes="(min-width: 1024px) 33vw, 85vw"
                    />
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Nitya Seva: a short strip */}
      {monthlySevas.docs.length > 0 && (
        <section className={styles.nityaStrip}>
          <div className={`container-x ${styles.nityaInner}`}>
            <div className={styles.nityaCopy}>
              <span className={styles.nityaIcon} aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9ZM5 14c3 0 6 2 7 6 1-4 4-6 7-6M4 20h16" />
                </svg>
              </span>
              <div>
                <h2 className={styles.nityaHeading}>Become a Nitya Sevak</h2>
                <p className={styles.nityaLine}>
                  Offer a little every month and serve the Lord all year. Cancel anytime.
                </p>
              </div>
            </div>
            <div className={styles.nityaForm}>
              <NityaSevaForm
                sevas={monthlySevas.docs.map((m) => ({ slug: m.slug, title: m.title }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* 6. Darshan timings */}
      <VisitSection
        image={home.visitImage}
        address={settings.address}
        mapUrl={settings.mapUrl}
        schedule={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))}
        sessions={(timings.openSessions ?? []).map(({ opens, closes }) => ({ opens, closes }))}
      />

      {/* 7. Quote with Srila Prabhupada */}
      <section className={styles.quote2}>
        <Mandala className={`spin-slow ${styles.quote2Mandala}`} rings={5} />
        <div className={`container-x ${styles.quote2Grid}`}>
          <figure className={styles.quote2Portrait}>
            <div className={styles.quote2Photo}>
              <ImageOrPlaceholder
                media={founderImage}
                art="book"
                alt="Srila Prabhupada"
                sizes="(min-width: 1024px) 26vw, 60vw"
              />
            </div>
            <figcaption className={styles.quote2Name}>
              His Divine Grace
              <span>A.C. Bhaktivedanta Swami Srila Prabhupada</span>
              Founder-Acharya of ISKCON
            </figcaption>
          </figure>
          <blockquote className={styles.quote2Body}>
            <span className={styles.quote2Mark} aria-hidden>
              “
            </span>
            <p className={styles.quote2Text}>
              Whatever you do, whatever you eat, whatever you offer or give away, and whatever
              austerities you perform — do that as an offering unto Me.
            </p>
            <footer className={styles.quote2Source}>
              Bhagavad-gītā As It Is 9.27
              <span>Translated by Srila Prabhupada</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 8. Temple gallery */}
      {galleryPhotos.length > 0 && (
        <section className={styles.gallery}>
          <div className="container-x">
            <div className={styles.sectionHead}>
              <div>
                <Eyebrow>Temple gallery</Eyebrow>
                <h2 className={styles.h2}>Moments at the temple</h2>
              </div>
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.moreLink}
                >
                  More on Instagram →
                </a>
              )}
            </div>
            <TempleGallery photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* 9. Live darshan */}
      <LiveDarshan
        sessions={(timings.openSessions ?? []).map(({ opens, closes }) => ({ opens, closes }))}
        image={krishna}
        link={home.liveDarshan?.link || home.livePuja?.link}
        demo={process.env.NODE_ENV === 'development'}
      />

      {/* Upcoming festivals */}
      {festivals.docs.length > 0 && (
        <section className={styles.festivals}>
          <div className="container-x">
            <div className={`${styles.sectionHead} ${styles.festivalsHead}`}>
              <div>
                <Eyebrow>Celebrate with us</Eyebrow>
                <h2 className={styles.h2}>Upcoming festivals</h2>
                <p className={styles.festivalsIntro}>
                  Celebrate the sacred festivals of the Vaishnava tradition with kirtan, abhishek
                  and prasadam.
                </p>
              </div>
              <Link href="/festivals" className={`btn-primary ${styles.btnBig}`}>
                View all festivals
              </Link>
            </div>
            <div className={`${styles.festGrid} ${styles.swipe}`}>
              {festivals.docs.map((f) => (
                <article key={f.id} className={styles.fest}>
                  <Link href={`/festivals/${f.slug}`} className={styles.festImage}>
                    <ImageOrPlaceholder
                      media={f.image}
                      art={f.artwork ?? 'lotus'}
                      sizes="(min-width: 1024px) 15vw, 35vw"
                    />
                  </Link>
                  <div className={styles.festBody}>
                    <span className={styles.festTag}>{daysUntil(f.date)}</span>
                    <h3 className={styles.festTitle}>
                      <Link href={`/festivals/${f.slug}`}>{f.name}</Link>
                    </h3>
                    <p className={styles.clamp2}>{f.shortDescription}</p>
                    <div className={styles.festFoot}>
                      <span className={styles.festDate}>
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M3 10h18M8 3v4M16 3v4" />
                        </svg>
                        {formatDate(f.date, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <Link href={`/festivals/${f.slug}`} className={styles.festButton}>
                        Support
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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

      {/* 12. 18-day Bhagavad-gita class and youth preaching */}
      <section className={styles.classes}>
        <div className="container-x">
          <div className={styles.sectionHeadCenter}>
            <Eyebrow>Learn and grow</Eyebrow>
            <h2 className={styles.h2}>Classes for every stage of life</h2>
          </div>
          <div className={styles.classGrid}>
            {[
              {
                key: 'gita',
                image: gitaImage,
                badge: '18 days',
                title: home.gitaCourse?.title || '18-Day Bhagavad-gita Course',
                text:
                  home.gitaCourse?.text ||
                  'One chapter a day, explained simply. Understand who you are, why we suffer and how to live peacefully, in 18 short sessions.',
                schedule:
                  home.gitaCourse?.schedule || 'New batch every month · Online & at the temple',
                link:
                  home.gitaCourse?.link ||
                  whatsappChat(
                    'Hare Krishna! I would like to join the 18-day Bhagavad-gita course.',
                  ),
                cta: 'Register for the course',
              },
              {
                key: 'youth',
                image: youthImage,
                badge: 'Ages 16–30',
                title: home.youth?.title || 'Youth Preaching',
                text:
                  home.youth?.text ||
                  'Kirtan, wisdom talks, outings and service for college students and young professionals. Make friends, find focus and grow spiritually.',
                schedule: home.youth?.schedule || 'Every Sunday, 5:00 PM · At the temple',
                link:
                  home.youth?.link ||
                  whatsappChat('Hare Krishna! I would like to join the youth programme.'),
                cta: 'Join the youth programme',
              },
            ].map((c) => (
              <article key={c.key} className={styles.classCard}>
                <div className={styles.classPhoto}>
                  <ImageOrPlaceholder
                    media={c.image}
                    art="book"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                  <span className={styles.classBadge}>{c.badge}</span>
                </div>
                <div className={styles.classBody}>
                  <h3 className={styles.classTitle}>{c.title}</h3>
                  <p className={styles.classText}>{c.text}</p>
                  <p className={styles.classSchedule}>{c.schedule}</p>
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-primary ${styles.btnBig}`}
                  >
                    {c.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
          <div className={`${styles.threeGrid} ${styles.swipe}`}>
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

      {/* 14. Speak to a priest */}
      <section className={styles.priest}>
        <div className={`container-x ${styles.priestGrid}`}>
          <div className={styles.priestPhoto}>
            <ImageOrPlaceholder
              media={priestImage}
              art="temple"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div>
            <Eyebrow>Guidance</Eyebrow>
            <h2 className={styles.h2}>Speak to a priest</h2>
            <p className={styles.sectionIntro}>
              Our temple priests can guide you on samskaras, home pujas and spiritual questions.
            </p>
            <ul className={styles.priestList}>
              {[
                'Naming ceremony and annaprasana',
                'Griha pravesh and home blessing',
                'Marriage and family samskaras',
                'Personal spiritual counselling',
              ].map((t) => (
                <li key={t}>
                  <span aria-hidden>✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className={styles.priestButtons}>
              <a
                href={whatsappChat('Hare Krishna! I would like to speak to a priest.')}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-primary ${styles.btnBig}`}
              >
                <WhatsAppIcon size={18} /> Chat on WhatsApp
              </a>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className={`btn-outline ${styles.btnBig} ${styles.priestCall}`}
                >
                  Call {settings.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 15. Instagram: follow + recent videos */}
      <section className={styles.insta}>
        <div className="container-x">
          <div className={styles.sectionHead}>
            <div>
              <Eyebrow>Follow us</Eyebrow>
              <h2 className={styles.h2}>ISKCON Coimbatore on Instagram</h2>
            </div>
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-primary ${styles.btnBig}`}
              >
                <InstagramIcon size={18} /> Follow
              </a>
            )}
          </div>
          <div className={`${styles.reels} ${styles.swipe}`}>
            {reels.map((r, i) => (
              <a
                key={i}
                href={r.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.reel}
              >
                {r.video ? (
                  <video
                    className={styles.reelMedia}
                    src={r.video}
                    poster={r.poster || undefined}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : r.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.reelMedia} src={r.poster} alt="" loading="lazy" />
                ) : null}
                <span className={styles.reelShade} />
                <span className={styles.reelIcon} aria-hidden>
                  <InstagramIcon size={16} />
                </span>
                {!r.video && (
                  <span className={styles.reelPlay} aria-hidden>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 16. WhatsApp channel */}
      <section className={styles.channel}>
        <div className={`container-x ${styles.channelInner}`}>
          <span className={styles.channelIcon} aria-hidden>
            <WhatsAppIcon size={34} />
          </span>
          <div className={styles.channelCopy}>
            <h2 className={styles.channelTitle}>Join the ISKCON Coimbatore WhatsApp Channel</h2>
            <p className={styles.channelText}>
              Daily darshan photos, festival dates and temple announcements, straight to your phone.
            </p>
          </div>
          <a
            href={
              settings.whatsappChannel ||
              whatsappChat('Hare Krishna! Please add me to the temple updates.')
            }
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${styles.channelButton}`}
          >
            Join the channel
          </a>
        </div>
      </section>
    </>
  )
}
