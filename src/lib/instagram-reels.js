import { mediaUrl } from './format'

/**
 * Recent Instagram videos shown in the home page Instagram section (up to 4).
 * Each uses files from the Media library, found by their alt text:
 *   video  – the reel as an MP4 (optional; without it the poster photo is shown)
 *   poster – a photo shown before the video plays
 *   link   – the reel on Instagram (optional; defaults to the profile in Site settings)
 * Replace these with your latest reels as you post them.
 */
export const REELS = [
  {
    video: 'A family visiting Sri Jagannath Mandir (video)',
    poster: 'A family arriving at Sri Jagannath Mandir',
    caption: 'A visit to Sri Jagannath Mandir',
  },
  {
    poster: 'Sri Sri Jagannath, Baladeva and Subhadra with fruit garlands',
    caption: 'Darshan of the day',
  },
  {
    poster: 'Devotees singing kirtan at Sri Jagannath Mandir',
    caption: 'Evening kirtan',
  },
  {
    poster: 'Lord Jagannath in full shringar',
    caption: 'Lord Jagannath in full shringar',
  },
]

/**
 * The reels to show: those added in admin under Photos & Videos → Instagram reels, or, when
 * none are, the list above loaded from the Media library (reels without a poster are skipped).
 */
export async function getReels(payload, photos) {
  const uploaded = (photos?.reels ?? []).filter((r) => mediaUrl(r.poster))
  if (uploaded.length > 0) {
    return uploaded.map((r, i) => ({
      id: r.id ?? `reel-${i}`,
      poster: mediaUrl(r.poster, 'card') || mediaUrl(r.poster),
      video: r.video?.url ? { url: r.video.url, type: r.video.mimeType || 'video/mp4' } : null,
      caption: r.caption,
      alt: r.poster.alt || r.caption,
      link: r.link || null,
    }))
  }

  const alts = REELS.flatMap((r) => [r.video, r.poster]).filter(Boolean)
  const { docs } = await payload.find({
    collection: 'media',
    where: { alt: { in: alts } },
    limit: alts.length,
    depth: 0,
  })
  const byAlt = new Map(docs.map((m) => [m.alt, m]))
  return REELS.map((r, i) => {
    const poster = byAlt.get(r.poster)
    const video = r.video ? byAlt.get(r.video) : null
    if (!mediaUrl(poster)) return null
    return {
      id: `reel-${i}`,
      poster: mediaUrl(poster, 'card') || mediaUrl(poster),
      video: video?.url ? { url: video.url, type: video.mimeType || 'video/mp4' } : null,
      caption: r.caption,
      alt: poster.alt,
      link: r.link ?? null,
    }
  }).filter(Boolean)
}
