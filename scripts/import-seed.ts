/**
 * One-time import of the content exported from local development (seed/) into the
 * production database and Vercel Blob. Runs during the Vercel build and does nothing
 * when there is no seed folder, no Blob token, or the database already has media.
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'

const SEED = path.resolve(process.cwd(), 'seed')
const MEDIA_KEYS = new Set(['image', 'video', 'videoWebm', 'cardImage', 'smallImage', 'photos', 'gallery', 'upiQr', 'visitImage'])
const SEVA_KEYS = new Set(['seva', 'highlightSevas', 'donationSevas'])
const DROP = new Set(['id', 'createdAt', 'updatedAt', 'globalType', '_status'])

const payload = await getPayload({ config })

async function main() {
  if (!fs.existsSync(path.join(SEED, 'data.json'))) return payload.logger.info('Seed: no seed folder, skipping')
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.SEED_TEST) return payload.logger.info('Seed: no Blob token, skipping')
  const existing = await payload.count({ collection: 'media' })
  if (existing.totalDocs > 0) return payload.logger.info('Seed: database already has content, skipping')

  const data = JSON.parse(fs.readFileSync(path.join(SEED, 'data.json'), 'utf8'))
  const mediaIds = new Map<number, number>()
  const sevaIds = new Map<number, number>()

  const remap = (value: unknown, key = ''): unknown => {
    const map = MEDIA_KEYS.has(key) ? mediaIds : SEVA_KEYS.has(key) ? sevaIds : null
    if (map) {
      if (Array.isArray(value)) return value.map((v) => (typeof v === 'number' ? map.get(v) : v)).filter(Boolean)
      return typeof value === 'number' ? (map.get(value) ?? null) : value
    }
    if (Array.isArray(value)) return value.map((v) => remap(v))
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) if (!DROP.has(k)) out[k] = remap(v, k)
      return out
    }
    return value
  }

  // 1) Media: re-upload each original file (sizes are regenerated, files go to Blob)
  for (const m of data.collections.media) {
    const file = fs.readFileSync(path.join(SEED, 'media', m.filename))
    const doc = await payload.create({
      collection: 'media',
      data: { alt: m.alt, focalX: m.focalX, focalY: m.focalY },
      file: { data: file, mimetype: m.mimeType, name: m.filename, size: file.length },
    })
    mediaIds.set(m.id, doc.id as number)
  }
  payload.logger.info(`Seed: ${mediaIds.size} media uploaded`)

  // 2) Sevas first (others point at them), then the rest
  for (const s of data.collections.sevas) {
    const doc = await payload.create({ collection: 'sevas', data: remap(s) as never })
    sevaIds.set(s.id, doc.id as number)
  }
  for (const slug of ['festivals', 'services', 'courses', 'posts', 'darshan-days'] as const) {
    for (const d of data.collections[slug] ?? []) await payload.create({ collection: slug, data: remap(d) as never })
  }

  // 3) Globals
  for (const slug of ['site-settings', 'temple-timings', 'home-page'] as const) {
    await payload.updateGlobal({ slug, data: remap(data.globals[slug]) as never })
  }
  payload.logger.info('Seed: import complete')
}

try {
  await main()
} catch (err) {
  payload.logger.error({ err }, 'Seed: import failed')
  process.exit(1)
}
process.exit(0)
