import { siteUrl } from '@/lib/donations'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

const PAGES = [
  '',
  '/about',
  '/kovai-chandra',
  '/services',
  '/courses',
  '/daily-darshan',
  '/art-gallery',
  '/festivals',
  '/blog',
  '/donate',
  '/volunteer',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
]

/** /sitemap.xml for search engines: the fixed pages plus every seva, festival and blog post. */
export default async function sitemap() {
  const base = siteUrl()
  const payload = await getPayloadClient()
  const slugs = async (collection, where) =>
    (await payload.find({ collection, where, limit: 500, depth: 0 })).docs.map((d) => d.slug)
  const [sevas, festivals, posts] = await Promise.all([
    slugs('sevas'),
    slugs('festivals'),
    slugs('posts', { _status: { equals: 'published' } }),
  ])
  return [
    ...PAGES.map((p) => `${base}${p}`),
    ...sevas.map((s) => `${base}/donate/${s}`),
    ...festivals.map((s) => `${base}/festivals/${s}`),
    ...posts.map((s) => `${base}/blog/${s}`),
  ].map((url) => ({ url }))
}
