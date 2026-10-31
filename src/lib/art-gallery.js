import { mediaUrl } from './format'

/**
 * Artworks in the Art gallery (home page shows the first 6, /art-gallery shows all).
 * Each is a photo in the Media library, found by its alt text. Add, remove or reorder here.
 */
export const ARTWORKS = [
  {
    alt: 'Lord Krishna speaking the Bhagavad-gita to Arjuna',
    title: 'Gita Upadesh',
    kind: 'Painting',
  },
  {
    alt: 'Sri Jagannath with Sri Sri Gaura-Nitai, ISKCON Coimbatore',
    title: 'Sri Jagannath with Sri Sri Gaura-Nitai',
    kind: 'Darshan',
  },
  { alt: 'Krishna lifting Govardhan Hill', title: 'Govardhan-dhari', kind: 'Painting' },
  {
    alt: 'Sri Sri Jagannath, Baladeva and Subhadra in the glow of Kartik lamps',
    title: 'In the glow of Kartik lamps',
    kind: 'Darshan',
  },
  {
    alt: 'Lord Jagannath in full shringar',
    title: 'Lord Jagannath in full shringar',
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
  { alt: 'Temple shikhara and flag at dusk', title: 'Shikhara at dusk', kind: 'Temple' },
  {
    alt: 'The main altar with Srila Prabhupada and the parampara',
    title: 'The main altar',
    kind: 'Temple',
  },
]

/** Load the artworks' photos from the Media library, in the order above (missing photos are skipped). */
export async function getArtworks(payload, limit = ARTWORKS.length) {
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
          }
        : null
    })
    .filter(Boolean)
}
