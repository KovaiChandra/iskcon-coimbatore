import crypto from 'crypto'

/**
 * Spam protection shared by the website forms and the app API.
 * Attempts allowed per visitor (by scrambled IP address) in each time window. Change them here.
 */
export const LIMITS = {
  donation: { max: 8, minutes: 10 },
  donationMobile: { max: 10, minutes: 60 }, // per mobile number, whichever visitor sends it
  contact: { max: 8, minutes: 10 },
  enquiry: { max: 8, minutes: 10 },
  volunteer: { max: 5, minutes: 10 },
  subscribe: { max: 8, minutes: 10 },
}

export const TOO_MANY_MESSAGE = 'Too many attempts. Please wait a few minutes and try again.'
export const TOO_FAST_MESSAGE = 'Please take a moment to check your details, then send again.'
export const SPAM_TEXT_MESSAGE = 'Please remove any web links from your message and try again.'

/** Faster than this (milliseconds from page load to send) is not a person typing. */
const MIN_FILL_MS = 1500
const MAX_LENGTH = 5000

/** The visitor's IP address on Vercel (or the nearest proxy). Only ever stored scrambled. */
export function clientIp(headers) {
  return (
    headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/** One-way scramble, so counters and analytics never hold a real IP address or phone number. */
export const scramble = (value) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}|${value}`)
    .digest('hex')
    .slice(0, 24)

/**
 * Counts one attempt and says whether it is allowed. Counters live in the database, so the limit
 * holds across all of Vercel's servers. If the counter itself fails the attempt is allowed:
 * a glitch here must never stop a real donor.
 */
export async function allowAttempt(payload, action, id) {
  const { max, minutes } = LIMITS[action]
  const key = `${action}:${scramble(id)}`
  const now = Date.now()
  try {
    // Now and then, clear out counters nobody has used for a day
    if (Math.random() < 0.02) {
      await payload.delete({
        collection: 'rate-limits',
        where: { windowStart: { less_than: new Date(now - 86_400_000).toISOString() } },
      })
    }
    const { docs } = await payload.find({
      collection: 'rate-limits',
      where: { key: { equals: key } },
      limit: 1,
      depth: 0,
    })
    const row = docs[0]
    if (!row) {
      await payload.create({
        collection: 'rate-limits',
        data: { key, count: 1, windowStart: new Date(now).toISOString() },
      })
      return true
    }
    if (now - new Date(row.windowStart).getTime() > minutes * 60_000) {
      await payload.update({
        collection: 'rate-limits',
        id: row.id,
        data: { count: 1, windowStart: new Date(now).toISOString() },
      })
      return true
    }
    if (row.count >= max) return false
    await payload.update({ collection: 'rate-limits', id: row.id, data: { count: row.count + 1 } })
    return true
  } catch (err) {
    payload.logger.warn(`Rate limit check failed, allowing the attempt: ${String(err)}`)
    return true
  }
}

/**
 * Looks like advertising: links in a name, several links, link markup, or absurdly long text.
 * @param {{ names?: unknown[], texts?: unknown[] }} fields
 */
export function looksLikeSpam({ names = [], texts = [] }) {
  const link = /(https?:\/\/|www\.|\.(com|net|org|ru|xyz|top|info)\b)/i
  if (names.some((n) => link.test(String(n ?? '')))) return true
  return texts.some((t) => {
    const s = String(t ?? '')
    return (
      s.length > MAX_LENGTH ||
      /<a\s|\[url[=\]]/i.test(s) ||
      (s.match(/https?:\/\/|www\./gi) ?? []).length >= 2
    )
  })
}

/** Checks for a website form. Returns null if it may proceed, else what to tell the sender. */
export async function checkForm(payload, headers, formData, action, { names, texts }) {
  // Bots fill every field, including the hidden "website" one: pretend it worked
  if (String(formData.get('website') ?? '').trim() !== '') return { ok: true }
  // Added by SpamGuard in the browser
  const elapsed = Number(formData.get('_elapsed'))
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < MIN_FILL_MS) {
    return { ok: false, message: TOO_FAST_MESSAGE }
  }
  if (looksLikeSpam({ names, texts })) return { ok: false, message: SPAM_TEXT_MESSAGE }
  if (!(await allowAttempt(payload, action, clientIp(headers)))) {
    return { ok: false, message: TOO_MANY_MESSAGE }
  }
  return null
}
