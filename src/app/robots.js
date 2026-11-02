import { siteUrl } from '@/lib/donations'

/** /robots.txt: everything public may be indexed except the admin and payment return pages. */
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/donate/pay', '/donate/thank-you'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
