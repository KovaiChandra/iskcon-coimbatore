import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { InstagramIcon, WhatsAppIcon, YoutubeIcon } from '@/components/Icons'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import { DonationCard } from '@/components/home/DonationCard'
import { HeroSlider } from '@/components/home/HeroSlider'
import { NityaSevaForm } from '@/components/home/NityaSevaForm'
import { ScheduleTicker } from '@/components/home/ScheduleTicker'
import { SubscribeForm } from '@/components/home/SubscribeForm'
import { VisitSection } from '@/components/home/VisitSection'
import { blurDataURL } from '@/lib/blur'
import { formatDate, inr, mediaUrl, waLink } from '@/lib/format'
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

/** Video id from a YouTube link (watch?v=, youtu.be/, /live/, /shorts/) */
function youtubeId(url = '') {
  const m = url.match(/(?:v=|youtu\.be\/|\/live\/|\/shorts\/|\/embed\/)([\w-]{11})/)
  return m ? m[1] : null
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

  const highlights = populated(home.highlightSevas).filter((s) => isSevaActive(s))
  const donationSevas = populated(home.donationSevas).filter((s) => isSevaActive(s))

  return (
    <>
      <HeroSlider slides={slides} />
      <ScheduleTicker
        items={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))}
      />

      {/* About */}
      <section className={styles.about2}>
        <div className={`container-x ${styles.about2Grid}`}>
          {/* Collage: large deity photo, small photo top-left, Prabhupada card bottom-left */}
          <div className={styles.collage}>
            <div className={styles.collageMain}>
              <ImageOrPlaceholder
                media={home.about?.image}
                art="temple"
                alt="Sri Sri Jagannath, Baladeva and Subhadra"
                sizes="(min-width: 1024px) 35vw, 75vw"
              />
            </div>
            <div className={styles.collageSmall}>
              <ImageOrPlaceholder
                media={home.about?.smallImage}
                art="lotus"
                sizes="(min-width: 1024px) 14vw, 35vw"
              />
            </div>
            <div className={styles.collageFounder}>
              <div className={styles.collageFounderPhoto}>
                <ImageOrPlaceholder
                  media={home.about?.cardImage || home.founder?.image}
                  art="book"
                  alt={home.about?.cardTitle || 'Srila Prabhupada'}
                  sizes="(min-width: 1024px) 18vw, 45vw"
                />
              </div>
              <p className={styles.collageFounderName}>
                {home.about?.cardTitle || 'Srila Prabhupada'}
                <span>{home.about?.cardSubtitle || 'Founder-Acharya of ISKCON'}</span>
              </p>
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
            <ul className={`${styles.about2Cards} ${styles.swipe}`}>
              {[
                {
                  title: 'Spiritual guidance',
                  text: 'Classes, counselling and japa for every age',
                  icon: <path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-4a3 3 0 0 0-3 3" />,
                },
                {
                  title: 'Festivals & seva',
                  text: 'Kirtan, abhishek and a community to serve with',
                  icon: (
                    <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9ZM5 14c3 0 6 2 7 6 1-4 4-6 7-6M4 20h16" />
                  ),
                },
                {
                  title: 'Prasadam for all',
                  text: 'Sanctified food offered with love, every day',
                  icon: <path d="M4 12h16a8 8 0 0 1-16 0ZM12 4v4M8 6v2M16 6v2" />,
                },
              ].map((c) => (
                <li key={c.title} className={styles.about2Card}>
                  <span className={styles.about2Icon}>
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {c.icon}
                    </svg>
                  </span>
                  <p className={styles.about2CardTitle}>{c.title}</p>
                  <p className={styles.about2CardText}>{c.text}</p>
                </li>
              ))}
            </ul>
            <Link href="/about" className={`btn-primary ${styles.btnBig} ${styles.aboutButton}`}>
              Our story →
            </Link>
          </div>
        </div>
      </section>

      {/* Founder-acharya and how ISKCON began */}
      <section className={styles.founder}>
        <Mandala className={`spin-slow ${styles.founderMandala}`} rings={5} />
        <div className={`container-x ${styles.founderGrid}`}>
          <div className={styles.founderPortraitWrap}>
            <div className={styles.founderPortrait}>
              <ImageOrPlaceholder
                media={home.founder?.image}
                art="book"
                alt="His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada"
                sizes="(min-width: 1024px) 30vw, 80vw"
              />
            </div>
            <p className={styles.founderCaption}>
              His Divine Grace
              <span>A.C. Bhaktivedanta Swami Srila Prabhupada</span>
              Founder-Acharya of ISKCON
            </p>
          </div>
          <div>
            <Eyebrow light>How ISKCON began</Eyebrow>
            <h2 className={`${styles.h2} ${styles.h2White}`}>
              One sage, a trunk of books, and a promise to his teacher
            </h2>
            <p className={styles.founderText}>
              In 1965, at the age of sixty-nine, Srila Prabhupada sailed from Kolkata to New York on
              a cargo ship, carrying little more than his translations of Srimad Bhagavatam. He had
              been asked by his spiritual master to share Lord Krishna&apos;s teachings in the
              English language. A year later he founded the International Society for Krishna
              Consciousness.
            </p>
            <ol className={styles.timeline2}>
              {[
                ['1896', 'Born in Kolkata as Abhay Charan De'],
                ['1922', 'Meets his guru, who asks him to preach in English'],
                ['1965', 'Sails to America aboard the Jaladuta'],
                ['1966', 'Founds ISKCON in New York City'],
                ['1977', 'Leaves a worldwide family of temples and devotees'],
              ].map(([year, text]) => (
                <li key={year}>
                  <span className={styles.tlYear}>{year}</span>
                  <span className={styles.tlText}>{text}</span>
                </li>
              ))}
            </ol>
            <Link
              href="/about#founder"
              className={`btn-donate ${styles.btnBig} ${styles.founderButton}`}
            >
              Read his story →
            </Link>
          </div>
        </div>
      </section>

      {/* Three ways to serve — seva cards */}
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
            <div className={`${styles.serveGrid} ${styles.swipe}`}>
              {highlights.map((s, i) => {
                const from = Math.min(...(s.presetAmounts ?? []).map((p) => p.amount))
                return (
                  <Link key={s.id} href={`/donate/${s.slug}`} className={styles.sevaCard}>
                    <div className={styles.sevaImage}>
                      <div className={styles.media}>
                        <ImageOrPlaceholder
                          media={s.image}
                          art={s.artwork ?? ['lotus', 'lamps', 'book'][i % 3]}
                          sizes="(min-width: 768px) 33vw, 100vw"
                        />
                      </div>
                      <span className={styles.sevaTag}>
                        {s.allowMonthly ? 'Monthly or one-time' : 'One-time seva'}
                      </span>
                    </div>
                    <div className={styles.sevaBody}>
                      <h3 className={styles.sevaTitle}>{s.title}</h3>
                      <p className={styles.sevaText}>{s.shortDescription}</p>
                      <div className={styles.sevaFoot}>
                        {Number.isFinite(from) && (
                          <p className={styles.sevaFrom}>
                            <span>From</span> {inr(from)}
                          </p>
                        )}
                        <span className={styles.sevaButton}>
                          Offer seva
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            aria-hidden
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Plan your visit: darshan timings card */}
      <VisitSection
        image={home.visitImage}
        address={settings.address}
        mapUrl={settings.mapUrl}
        schedule={(timings.schedule ?? []).map(({ time, activity }) => ({ time, activity }))}
        sessions={(timings.openSessions ?? []).map(({ opens, closes }) => ({ opens, closes }))}
      />

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
            <div className={`${styles.donateGrid} ${styles.swipe}`}>
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
                      media={s.cardImage || s.image}
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
        </div>
      </section>

      {/* Live puja */}
      {home.livePuja?.link && (
        <section className={styles.live}>
          <div className={`container-x ${styles.liveGrid}`}>
            <div className={styles.liveFrame}>
              <div className={styles.livePhoto}>
                <ImageOrPlaceholder
                  media={home.livePuja.image}
                  art="temple"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
              <span className={styles.liveOnAir}>
                <span className={styles.liveDot}>
                  <span className={styles.liveDotPing} />
                  <span className={styles.liveDotCore} />
                </span>
                Live
              </span>
            </div>
            <div>
              <Eyebrow>Blessings from Sri Sri Jagannath</Eyebrow>
              <h2 className={styles.h2}>{home.livePuja.title || 'Live online puja'}</h2>
              <p className={styles.liveText}>
                {home.livePuja.text ||
                  'Join the daily arati at Sri Jagannath Mandir from wherever you are. Offer your prayers at the lotus feet of the Lord for your family, health and spiritual growth.'}
              </p>
              <div className={styles.liveFacts}>
                <div className={styles.liveFact}>
                  <span className={styles.liveIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <div>
                    <p className={styles.liveFactLabel}>Schedule</p>
                    <p className={styles.liveFactValue}>
                      {home.livePuja.time || home.livePuja.schedule}
                    </p>
                  </div>
                </div>
                <div className={styles.liveFact}>
                  <span className={styles.liveIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden
                    >
                      <rect x="3" y="6" width="13" height="12" rx="2" />
                      <path d="m16 10 5-3v10l-5-3" />
                    </svg>
                  </span>
                  <div>
                    <p className={styles.liveFactLabel}>Platform</p>
                    <p className={styles.liveFactValue}>
                      {home.livePuja.platform || 'Free to join'}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={home.livePuja.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-donate ${styles.btnBig} ${styles.liveButton}`}
              >
                Join the live puja
              </a>
            </div>
          </div>
        </section>
      )}

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

      {/* Services */}
      {services.docs.length > 0 && (
        <section className={`container-x ${styles.services}`}>
          <div className={styles.sectionHeadCenter}>
            <Eyebrow>Serve and be served</Eyebrow>
            <h2 className={styles.h2}>Devotional services</h2>
          </div>
          <div className={`${styles.threeGrid} ${styles.swipe}`}>
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

      {/* YouTube */}
      {(home.youtubeVideos?.length > 0 || settings.youtube) && (
        <section className={styles.youtube}>
          <div className="container-x">
            <div className={styles.sectionHeadCenter}>
              <Eyebrow>Watch and hear</Eyebrow>
              <h2 className={styles.h2}>ISKCON Coimbatore on YouTube</h2>
              <p className={styles.youtubeIntro}>
                Darshan, kirtan and classes from Sri Jagannath Mandir: watch, reflect and deepen
                your connection with the Lord.
              </p>
            </div>
            {home.youtubeVideos?.length > 0 && (
              <div className={`${styles.threeGrid} ${styles.swipe}`}>
                {home.youtubeVideos.slice(0, 3).map((v) => {
                  const id = youtubeId(v.url)
                  return (
                    <a
                      key={v.id ?? v.url}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.ytCard}
                    >
                      <div className={styles.ytThumb}>
                        {id && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span className={styles.ytPlay} aria-hidden>
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <div className={styles.ytBody}>
                        <h3 className={styles.ytTitle}>{v.title}</h3>
                        {v.date && <p className={styles.small}>{formatDate(v.date)}</p>}
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
            {settings.youtube && (
              <div className={styles.buttonRow}>
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-primary ${styles.btnBig}`}
                >
                  <YoutubeIcon size={18} /> Visit our channel
                </a>
              </div>
            )}
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
