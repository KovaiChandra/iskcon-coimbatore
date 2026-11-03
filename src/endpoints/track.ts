import type { Endpoint } from 'payload'
import { clientIp, scramble } from '../lib/spam'

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|monitor/i
const KEEP_DAYS = 400

/** Today's date in India, YYYY-MM-DD. */
export const indiaDay = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date)

/** Where the visit came from: a campaign tag, the other site's name, or "Direct". */
function sourceOf(ref: unknown, utm: unknown, ownHost: string | null) {
  if (typeof utm === 'string' && utm.trim()) return utm.trim().toLowerCase().slice(0, 60)
  try {
    const host = new URL(String(ref)).hostname.replace(/^www\./, '')
    // The Host header can include a port (localhost:3000); URL.hostname does not
    return host === ownHost?.split(':')[0].replace(/^www\./, '') ? 'Direct' : host.slice(0, 60)
  } catch {
    return 'Direct'
  }
}

/** POST /api/track: the browser reports a page view (components/Motion.jsx). No cookies. */
export const trackEndpoint: Endpoint = {
  method: 'post',
  path: '/track',
  handler: async (req) => {
    const done = new Response(null, { status: 204 })
    const ua = req.headers.get('user-agent') ?? ''
    // Bots and logged-in temple staff don't count as visitors
    if (!ua || BOTS.test(ua) || req.user) return done
    try {
      const b = req.json ? await req.json() : null
      const path = typeof b?.path === 'string' ? b.path.split(/[?#]/)[0].slice(0, 200) : ''
      if (!/^\/[\w\-./%]*$/.test(path) || path.startsWith('/admin') || path.startsWith('/api')) return done
      const day = indiaDay()
      const city = req.headers.get('x-vercel-ip-city')
      await req.payload.create({
        collection: 'page-views',
        overrideAccess: true,
        data: {
          day,
          path,
          visitor: scramble(`${day}|${clientIp(req.headers)}|${ua}`),
          device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Phone' : 'Computer',
          source: sourceOf(b?.ref, b?.utm, req.headers.get('host')),
          city: city ? decodeURIComponent(city).slice(0, 60) : undefined,
          country: req.headers.get('x-vercel-ip-country') ?? undefined,
        },
      })
      // Now and then, remove rows older than the dashboard can show
      if (Math.random() < 0.002) {
        await req.payload.delete({
          collection: 'page-views',
          overrideAccess: true,
          where: { day: { less_than: indiaDay(new Date(Date.now() - KEEP_DAYS * 86_400_000)) } },
        })
      }
    } catch (err) {
      req.payload.logger.warn(`Could not record a page view: ${String(err)}`)
    }
    return done
  },
}
