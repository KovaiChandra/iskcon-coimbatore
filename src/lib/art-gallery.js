import { mediaUrl } from './format'

/**
 * Artworks in the Art gallery (home page shows the first 6, /art-gallery shows all).
 * Each is a photo in the Media library, found by its alt text. Add, remove or reorder here.
 */
export const ARTWORKS = [
  // The first eight fill the home page mosaic, in this order:
  // large square, tall, square, square, wide, wide, then on wide screens only:
  // tall (left edge), tall (right edge). The rest appear on the /art-gallery page.
  {
    alt: 'Sri Jagannath with Sri Sri Gaura-Nitai, ISKCON Coimbatore',
    title: 'Sri Jagannath with Sri Sri Gaura-Nitai',
    kind: 'Darshan',
    position: '50% 35%',
  },
  {
    alt: 'Lord Jagannath in full shringar',
    title: 'Lord Jagannath in full shringar',
    kind: 'Darshan',
  },
  { alt: 'Krishna lifting Govardhan Hill', title: 'Govardhan-dhari', kind: 'Painting' },
  {
    alt: 'Lord Krishna speaking the Bhagavad-gita to Arjuna',
    title: 'Gita Upadesh',
    kind: 'Painting',
  },
  {
    alt: 'Sri Sri Jagannath, Baladeva and Subhadra in the glow of Kartik lamps',
    title: 'In the glow of Kartik lamps',
    kind: 'Darshan',
  },
  { alt: 'Lamps on the river under the Kartik full moon', title: 'Rasa Purnima', kind: 'Festival' },
  {
    alt: 'Sri Sri Jagannath, Baladeva and Subhadra with fruit garlands',
    title: 'Adorned with fruit garlands',
    kind: 'Darshan',
  },
  {
    alt: 'His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada',
    title: 'Srila Prabhupada',
    kind: 'Founder-Ācārya of ISKCON',
  },
  {
    alt: 'The main altar with Srila Prabhupada and the parampara',
    title: 'The main altar',
    kind: 'Temple',
  },
  { alt: 'Temple shikhara and flag at dusk', title: 'Shikhara at dusk', kind: 'Temple' },
]

/**
 * The artworks to show: those uploaded in admin under Photos & Videos → Art gallery, or, when
 * none are, the list above loaded from the Media library (missing photos are skipped).
 */
export async function getArtworks(payload, limit = ARTWORKS.length, photos) {
  const uploaded = (photos?.artGallery ?? []).filter((a) => mediaUrl(a.image))
  if (uploaded.length > 0) {
    return uploaded
      .slice(0, limit)
      .filter((a) => a.image.width && a.image.height)
      .map((a) => ({
        id: a.image.id,
        url: mediaUrl(a.image),
        width: a.image.width,
        height: a.image.height,
        alt: a.image.alt || a.title,
        title: a.title,
        kind: a.kind,
      }))
  }

  const list = ARTWORKS.slice(0, limit)
  const { docs } = await payload.find({
    collection: 'media',
    where: { alt: { in: list.map((a) => a.alt) } },
    limit: list.length,
    depth: 0,
  })
  const byAlt = new Map(docs.map((m) => [m.alt, m]))
  return list
    .map((a) => {
      const m = byAlt.get(a.alt)
      const url = mediaUrl(m)
      return url && m.width && m.height
        ? {
            id: m.id,
            url,
            width: m.width,
            height: m.height,
            alt: a.alt,
            title: a.title,
            kind: a.kind,
            position: a.position,
          }
        : null
    })
    .filter(Boolean)
}
