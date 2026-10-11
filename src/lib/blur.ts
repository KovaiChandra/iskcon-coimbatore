import path from 'path'
import sharp from 'sharp'
import type { Media } from '@/payload-types'

const cache = new Map<string, string | undefined>()

/**
 * A ~20px blurred copy of an uploaded image as a data URL, shown instantly
 * while the full photo loads. Cached per file for the life of the server.
 */
export async function blurDataURL(media: Media): Promise<string | undefined> {
  const file = media.sizes?.thumb?.filename || media.filename
  if (!file) return undefined
  if (cache.has(file)) return cache.get(file)
  let result: string | undefined
  try {
    const buf = await sharp(path.join(process.cwd(), 'media', file))
      .resize(20)
      .jpeg({ quality: 50 })
      .toBuffer()
    result = `data:image/jpeg;base64,${buf.toString('base64')}`
  } catch {
    result = undefined
  }
  cache.set(file, result)
  return result
}
