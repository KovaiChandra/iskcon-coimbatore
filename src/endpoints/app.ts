import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Endpoint, PayloadRequest, Where } from 'payload'
import { getArtworks } from '../lib/art-gallery'
import { getDonationStatus, startDonation, validateDonation } from '../lib/donations'
import { ENQUIRY_THANKS, validateEnquiry } from '../lib/enquiries'
import { getReels } from '../lib/instagram-reels'
import { getLiveStatus } from '../lib/youtube-live'
import { isSevaActive } from '../lib/sevas'
import { templeStatus } from '../lib/temple-status'

/**
 * Read-only content and form/donation endpoints for the mobile app, under /api/app/v1.
 * Responses are plain JSON shaped for screens (absolute photo URLs, rich text as HTML), so the
 * app does not depend on the admin's internal data model. Documented in docs/MOBILE_API.md.
 */

const BASE = '/app/v1'

type Doc = Record<string, any>

// ---------- helpers

const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: status === 200 ? { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } : {},
  })
const error = (status: number, code: string, message: string, field?: string) =>
  Response.json({ error: { code, message, ...(field ? { field } : {}) } }, { status, headers: { 'Cache-Control': 'no-store' } })

function origin(req: PayloadRequest) {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** When APP_API_KEY is set, every request must send it as the x-api-key header. */
function unauthorised(req: PayloadRequest) {
  const key = process.env.APP_API_KEY
  return key && req.headers.get('x-api-key') !== key
    ? error(401, 'unauthorised', 'Missing or wrong x-api-key header')
    : null
}

const route = (
  method: Endpoint['method'],
  path: string,
  handler: (req: PayloadRequest) => Promise<Response>,
  { open = false } = {},
): Endpoint => ({
  method,
  path: `${BASE}${path}`,
  handler: async (req) => {
    // `open` routes are also used by the website itself, so they never need the app key
    const denied = open ? null : unauthorised(req)
    if (denied) return denied
    try {
      return await handler(req)
    } catch (err) {
      req.payload.logger.error(`App API ${method.toUpperCase()} ${path}: ${String(err)}`)
      return error(500, 'server_error', 'Something went wrong. Please try again.')
    }
  },
})

async function body(req: PayloadRequest): Promise<Record<string, unknown> | null> {
  try {
    const b = req.json ? await req.json() : null
    return b && typeof b === 'object' ? b : null
  } catch {
    return null
  }
}

/** Photo/video → { url, alt, width, height, mimeType, sizes } with absolute URLs, or null. */
function photo(m: unknown, base: string) {
  if (!m || typeof m !== 'object') return null
  const d = m as Doc
  if (!d.url) return null
  const abs = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${base}${u}`) : null)
  return {
    url: abs(d.url),
    alt: d.alt ?? '',
    width: d.width ?? null,
    height: d.height ?? null,
    mimeType: d.mimeType ?? null,
    sizes: {
      thumb: abs(d.sizes?.thumb?.url),
      card: abs(d.sizes?.card?.url),
      hero: abs(d.sizes?.hero?.url),
    },
  }
}

const html = (data: unknown) => {
  try {
    return data && typeof data === 'object' ? convertLexicalToHTML({ data: data as never }) : null
  } catch {
    return null
  }
}

const todayStart = () => new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
const intParam = (req: PayloadRequest, key: string, fallback: number, max: number) =>
  Math.min(Math.max(Number(req.searchParams.get(key)) || fallback, 1), max)

// ---------- shapers (one per content type; the app sees only these fields)

const seva = (s: Doc, base: string) => ({
  slug: s.slug,
  title: s.title,
  category: s.category,
  shortDescription: s.shortDescription,
  image: photo(s.image, base),
  cardImage: photo(s.cardImage || s.image, base),
  presetAmounts: (s.presetAmounts ?? []).map((p: Doc) => p.amount),
  items: (s.items ?? []).map((i: Doc) => ({ label: i.label, price: i.price })),
  allowMonthly: Boolean(s.allowMonthly),
  startDate: s.startDate ?? null,
  endDate: s.endDate ?? null,
  isOpen: isSevaActive(s),
  onlinePayment: Boolean(process.env.KCM_PAYMENT_GATEWAY_SECRET && (s.schemeId || (s.items ?? []).some((i: Doc) => i.schemeId))),
})

const festival = (f: Doc, base: string, full = false) => ({
  slug: f.slug,
  name: f.name,
  date: f.date,
  timeLabel: f.timeLabel ?? null,
  shortDescription: f.shortDescription,
  image: photo(f.image, base),
  seva: f.seva && typeof f.seva === 'object' ? { slug: f.seva.slug, title: f.seva.title } : null,
  ...(full
    ? {
        significanceHtml: html(f.significance),
        schedule: (f.schedule ?? []).map(({ time, activity }: Doc) => ({ time, activity })),
        gallery: (f.gallery ?? []).map((m: unknown) => photo(m, base)).filter(Boolean),
      }
    : {}),
})

const service = (s: Doc, base: string) => ({
  id: s.id,
  title: s.title,
  description: s.description,
  image: photo(s.image, base),
  action: s.action,
  seva: s.seva && typeof s.seva === 'object' ? { slug: s.seva.slug, title: s.seva.title } : null,
  url: s.url ?? null,
  buttonLabel: s.buttonLabel ?? null,
  featured: Boolean(s.featured),
})

const course = (c: Doc, base: string) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  image: photo(c.image, base),
  schedule: c.schedule ?? null,
  mode: c.mode,
  zoomLink: c.zoomLink ?? null,
  featured: Boolean(c.featured),
})

const post = (p: Doc, base: string, full = false) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  publishedAt: p.publishedAt,
  author: p.author ?? null,
  image: photo(p.image, base),
  excerpt: p.excerpt,
  ...(full ? { contentHtml: html(p.content) } : {}),
})

const settingsOut = (s: Doc, base: string) => ({
  address: s.address ?? null,
  phone: s.phone ?? null,
  whatsapp: s.whatsapp ?? null,
  email: s.email ?? null,
  mapUrl: s.mapUrl ?? null,
  social: {
    facebook: s.facebook ?? null,
    instagram: s.instagram ?? null,
    youtube: s.youtube ?? null,
    whatsappChannel: s.whatsappChannel ?? null,
  },
  donations: {
    reg80G: s.reg80G ?? null,
    reg80GValidity: s.reg80GValidity ?? null,
    upiId: s.upiId ?? null,
    upiQr: photo(s.upiQr, base),
    bankDetails: s.bankDetails ?? null,
  },
})

const timingsOut = (t: Doc) => ({
  status: templeStatus((t.openSessions ?? []).filter((s: Doc) => s.opens && s.closes)),
  openSessions: (t.openSessions ?? []).map(({ opens, closes }: Doc) => ({ opens, closes })),
  schedule: (t.schedule ?? []).map(({ time, activity }: Doc) => ({ time, activity })),
})

// ---------- endpoints

export const appEndpoints: Endpoint[] = [
  route('get', '/home', async (req) => {
    const { payload } = req
    const base = origin(req)
    const [home, photos, settings, timings, festivals, courses, services, posts] = await Promise.all([
      payload.findGlobal({ slug: 'home-page', depth: 2 }),
      payload.findGlobal({ slug: 'site-photos', depth: 1 }),
      payload.findGlobal({ slug: 'site-settings', depth: 1 }),
      payload.findGlobal({ slug: 'temple-timings' }),
      payload.find({ collection: 'festivals', where: { date: { greater_than_equal: todayStart() } }, sort: 'date', limit: 4, depth: 1 }),
      payload.find({ collection: 'courses', where: { featured: { equals: true } }, sort: 'order', limit: 6, depth: 1 }),
      payload.find({ collection: 'services', where: { featured: { equals: true } }, sort: 'order', limit: 6, depth: 1 }),
      payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 3, depth: 1 }),
    ])
    const [artworks, reels] = await Promise.all([getArtworks(payload, 8, photos), getReels(payload, photos)])
    const sevaList = (items: unknown[] = []) =>
      items.filter((s): s is Doc => !!s && typeof s === 'object' && isSevaActive(s as Doc)).map((s) => seva(s, base))
    const p = photos as Doc
    const h = home as Doc

    return json({
      heroSlides: (h.heroSlides ?? []).map((s: Doc) => ({
        layout: s.layout,
        tone: s.tone,
        eyebrow: s.eyebrow ?? null,
        heading: s.heading,
        text: s.text ?? null,
        verse: s.verse ?? null,
        image: photo(s.image, base),
        video: photo(s.video, base),
        videoWebm: photo(s.videoWebm, base),
        buttonLabel: s.buttonLabel ?? null,
        link: s.link ?? null,
      })),
      timings: timingsOut(timings),
      highlightSevas: sevaList(h.highlightSevas),
      donationSevas: sevaList(h.donationSevas),
      about: {
        image: photo(h.about?.image, base),
        smallImage: photo(h.about?.smallImage, base),
        cardImage: photo(h.about?.cardImage || h.founder?.image, base),
        cardTitle: h.about?.cardTitle ?? null,
        cardSubtitle: h.about?.cardSubtitle ?? null,
        text: h.about?.text ?? null,
      },
      founder: { image: photo(h.founder?.image, base) },
      explore: Object.fromEntries(
        ['deities', 'kirtan', 'prasadam', 'goshala', 'kovaiChandra', 'visit'].map((k) => [k, photo(p.explore?.[k], base)]),
      ),
      visitImage: photo(h.visitImage, base),
      livePuja: h.livePuja?.link
        ? {
            title: h.livePuja.title ?? null,
            text: h.livePuja.text ?? null,
            time: h.livePuja.time ?? null,
            schedule: h.livePuja.schedule ?? null,
            platform: h.livePuja.platform ?? null,
            link: h.livePuja.link,
            image: photo(h.livePuja.image, base),
          }
        : null,
      upcomingFestivals: festivals.docs.map((f) => festival(f, base)),
      featuredCourses: courses.docs.map((c) => course(c, base)),
      featuredServices: services.docs.map((s) => service(s, base)),
      latestPosts: posts.docs.map((x) => post(x, base)),
      artGallery: artworks.map((a: Doc) => ({ ...a, url: a.url.startsWith('http') ? a.url : `${base}${a.url}` })),
      instagramReels: reels.map((r: Doc) => ({
        ...r,
        poster: r.poster?.startsWith('http') ? r.poster : `${base}${r.poster}`,
        video: r.video ? { ...r.video, url: r.video.url.startsWith('http') ? r.video.url : `${base}${r.video.url}` } : null,
      })),
      youtubeVideos: (h.youtubeVideos ?? []).map(({ title, url, date }: Doc) => ({ title, url, date: date ?? null })),
      settings: settingsOut(settings, base),
    })
  }),

  // Is the temple's YouTube channel live right now? (also polled by the home page darshan screen)
  route('get', '/live', async () => json(await getLiveStatus()), { open: true }),

  route('get', '/settings', async (req) =>
    json(settingsOut(await req.payload.findGlobal({ slug: 'site-settings', depth: 1 }), origin(req))),
  ),

  route('get', '/timings', async (req) => json(timingsOut(await req.payload.findGlobal({ slug: 'temple-timings' })))),

  route('get', '/photos', async (req) => {
    const base = origin(req)
    const p = (await req.payload.findGlobal({ slug: 'site-photos', depth: 1 })) as Doc
    const group = (g: Doc | undefined, keys: string[]) => Object.fromEntries(keys.map((k) => [k, photo(g?.[k], base)]))
    return json({
      explore: group(p.explore, ['deities', 'kirtan', 'prasadam', 'goshala', 'kovaiChandra', 'visit']),
      pageBanners: group(p.banners, [
        'services', 'courses', 'festivals', 'donate', 'volunteer', 'dailyDarshan', 'artGallery', 'blog', 'contact',
      ]),
      kovaiChandra: {
        banner: photo(p.kovai?.banner, base),
        photos: (p.kovai?.photos ?? []).map((m: unknown) => photo(m, base)).filter(Boolean),
      },
    })
  }),

  route('get', '/sevas', async (req) => {
    const base = origin(req)
    const where: Where = {}
    const category = req.searchParams.get('category')
    if (category === 'regular' || category === 'festival') where.category = { equals: category }
    if (req.searchParams.get('monthly') === 'true') where.allowMonthly = { equals: true }
    const { docs } = await req.payload.find({ collection: 'sevas', where, sort: 'order', limit: 100, depth: 1 })
    const all = req.searchParams.get('includeClosed') === 'true'
    return json({ docs: docs.filter((s) => all || isSevaActive(s)).map((s) => seva(s, base)) })
  }),

  route('get', '/sevas/:slug', async (req) => {
    const { docs } = await req.payload.find({
      collection: 'sevas',
      where: { slug: { equals: String(req.routeParams?.slug) } },
      limit: 1,
      depth: 1,
    })
    return docs[0] ? json(seva(docs[0], origin(req))) : error(404, 'not_found', 'Seva not found')
  }),

  route('get', '/festivals', async (req) => {
    const base = origin(req)
    const when = req.searchParams.get('when') ?? 'upcoming'
    const where: Where =
      when === 'past' ? { date: { less_than: todayStart() } } : when === 'all' ? {} : { date: { greater_than_equal: todayStart() } }
    const { docs } = await req.payload.find({
      collection: 'festivals',
      where,
      sort: when === 'past' ? '-date' : 'date',
      limit: intParam(req, 'limit', 50, 100),
      depth: 1,
    })
    return json({ docs: docs.map((f) => festival(f, base)) })
  }),

  route('get', '/festivals/:slug', async (req) => {
    const { docs } = await req.payload.find({
      collection: 'festivals',
      where: { slug: { equals: String(req.routeParams?.slug) } },
      limit: 1,
      depth: 1,
    })
    return docs[0] ? json(festival(docs[0], origin(req), true)) : error(404, 'not_found', 'Festival not found')
  }),

  route('get', '/services', async (req) => {
    const base = origin(req)
    const { docs } = await req.payload.find({ collection: 'services', sort: 'order', limit: 100, depth: 1 })
    return json({ docs: docs.map((s) => service(s, base)) })
  }),

  route('get', '/courses', async (req) => {
    const base = origin(req)
    const { docs } = await req.payload.find({ collection: 'courses', sort: 'order', limit: 100, depth: 1 })
    return json({ docs: docs.map((c) => course(c, base)) })
  }),

  route('get', '/posts', async (req) => {
    const base = origin(req)
    const where: Where = { _status: { equals: 'published' } }
    const category = req.searchParams.get('category')
    if (category) where.category = { equals: category }
    const res = await req.payload.find({
      collection: 'posts',
      where,
      sort: '-publishedAt',
      page: intParam(req, 'page', 1, 1000),
      limit: intParam(req, 'limit', 10, 50),
      depth: 1,
    })
    return json({ docs: res.docs.map((p) => post(p, base)), page: res.page, totalPages: res.totalPages, totalDocs: res.totalDocs })
  }),

  route('get', '/posts/:slug', async (req) => {
    const { docs } = await req.payload.find({
      collection: 'posts',
      where: { slug: { equals: String(req.routeParams?.slug) }, _status: { equals: 'published' } },
      limit: 1,
      depth: 1,
    })
    return docs[0] ? json(post(docs[0], origin(req), true)) : error(404, 'not_found', 'Post not found')
  }),

  route('get', '/daily-darshan', async (req) => {
    const base = origin(req)
    const res = await req.payload.find({
      collection: 'darshan-days',
      sort: '-date',
      page: intParam(req, 'page', 1, 1000),
      limit: intParam(req, 'limit', 7, 31),
      depth: 1,
    })
    return json({
      docs: res.docs.map((d) => ({ date: d.date, photos: (d.photos ?? []).map((m) => photo(m, base)).filter(Boolean) })),
      page: res.page,
      totalPages: res.totalPages,
    })
  }),

  route('get', '/art-gallery', async (req) => {
    const base = origin(req)
    const photos = await req.payload.findGlobal({ slug: 'site-photos', depth: 1 })
    const works = await getArtworks(req.payload, undefined, photos)
    return json({ docs: works.map((a: Doc) => ({ ...a, url: a.url.startsWith('http') ? a.url : `${base}${a.url}` })) })
  }),

  // ---------- forms

  route('post', '/donations', async (req) => {
    const b = await body(req)
    if (!b) return error(400, 'invalid_json', 'Send a JSON body')
    const checked = validateDonation(b)
    if (!checked.ok) return error(422, 'validation_failed', checked.message, checked.field)
    const result = await startDonation(req.payload, checked.input, 'app')
    if (!result.ok) return error(result.status, 'seva_unavailable', result.message, 'seva')
    const { reference, amount, frequency, name, checkout, sessionId, offlineReason } = result.donation
    const settings = await req.payload.findGlobal({ slug: 'site-settings', depth: 1 })
    return Response.json(
      {
        reference,
        amount,
        frequency,
        name,
        onlinePayment: Boolean(checkout),
        paymentUrl: checkout ? `${origin(req)}/donate/pay?ref=${reference}` : null,
        checkout,
        sessionId,
        returnUrlPrefix: `${origin(req)}/donate/thank-you`,
        offlineReason: offlineReason ?? null,
        offlinePayment: checkout ? null : settingsOut(settings, origin(req)).donations,
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  }),

  route('get', '/donations/:reference', async (req) => {
    const ref = String(req.routeParams?.reference ?? '')
    if (!/^SEVA-[A-F0-9]{10}$/.test(ref)) return error(404, 'not_found', 'Donation not found')
    const status = await getDonationStatus(req.payload, ref)
    return status
      ? Response.json(status, { headers: { 'Cache-Control': 'no-store' } })
      : error(404, 'not_found', 'Donation not found')
  }),

  route('post', '/contact', async (req) => {
    const b = await body(req)
    if (!b) return error(400, 'invalid_json', 'Send a JSON body')
    const s = (k: string) => String(b[k] ?? '').trim()
    const data = {
      firstName: s('firstName'),
      lastName: s('lastName'),
      email: s('email').toLowerCase(),
      phone: s('phone'),
      category: ['General', 'Donation / 80G receipt', 'Seva', 'Volunteer', 'Suggestion', 'Other'].includes(s('category'))
        ? s('category')
        : 'General',
      message: s('message'),
      consent: b.consent === true,
    }
    if (!data.firstName) return error(422, 'validation_failed', 'Please enter your first name.', 'firstName')
    if (!data.lastName) return error(422, 'validation_failed', 'Please enter your last name.', 'lastName')
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return error(422, 'validation_failed', 'Please enter a valid email.', 'email')
    if (!/^[0-9+\-\s]{10,15}$/.test(data.phone)) return error(422, 'validation_failed', 'Please enter a valid phone number.', 'phone')
    if (!data.message) return error(422, 'validation_failed', 'Please enter a message.', 'message')
    await req.payload.create({ collection: 'contact-messages', data: data as never })
    return Response.json({ ok: true, message: 'Hare Krishna! Thank you for writing. We will reply within two days.' }, { status: 201 })
  }),

  route('post', '/volunteers', async (req) => {
    const b = await body(req)
    if (!b) return error(400, 'invalid_json', 'Send a JSON body')
    const s = (k: string) => String(b[k] ?? '').trim()
    const data = {
      name: s('name'),
      mobile: s('mobile'),
      email: s('email').toLowerCase() || undefined,
      area: s('area'),
      interest: Array.isArray(b.interest) ? b.interest.map(String).join(', ') : s('interest'),
      availability: s('availability'),
      skills: s('skills'),
    }
    if (!data.name) return error(422, 'validation_failed', 'Please enter your name.', 'name')
    if (!/^[0-9+\-\s]{10,15}$/.test(data.mobile)) return error(422, 'validation_failed', 'Please enter a valid mobile number.', 'mobile')
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) return error(422, 'validation_failed', 'Please check your email.', 'email')
    await req.payload.create({ collection: 'volunteers', data: data as never })
    return Response.json({ ok: true, message: 'Hare Krishna! Thank you for offering your time. Our volunteer team will call you soon.' }, { status: 201 })
  }),

  // Course registration or "speak to a priest" → Admin → Enquiries
  route('post', '/enquiries', async (req) => {
    const b = await body(req)
    if (!b) return error(400, 'invalid_json', 'Send a JSON body')
    const checked = validateEnquiry(b, 'app') as
      | { ok: true; data: { type: 'course' | 'priest' } }
      | { ok: false; message: string; field?: string }
    if (!checked.ok) return error(422, 'validation_failed', checked.message, checked.field)
    await req.payload.create({ collection: 'enquiries', data: checked.data as never })
    return Response.json({ ok: true, message: ENQUIRY_THANKS[checked.data.type] }, { status: 201 })
  }),

  route('post', '/subscribe', async (req) => {
    const b = await body(req)
    if (!b) return error(400, 'invalid_json', 'Send a JSON body')
    const name = String(b.name ?? '').trim()
    const email = String(b.email ?? '').trim().toLowerCase()
    const phone = String(b.phone ?? '').trim()
    if (!name) return error(422, 'validation_failed', 'Please enter your name.', 'name')
    if (!/^\S+@\S+\.\S+$/.test(email)) return error(422, 'validation_failed', 'Please enter a valid email.', 'email')
    const existing = await req.payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1 })
    if (existing.docs.length === 0) {
      await req.payload.create({ collection: 'subscribers', data: { name, email, phone, consent: b.consent === true } })
    }
    return Response.json({ ok: true, message: 'Hare Krishna! You will hear from us before every festival.' }, { status: 201 })
  }),
]
