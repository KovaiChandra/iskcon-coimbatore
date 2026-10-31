import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { formatDate } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { bannerFor, getSitePhotos } from '@/lib/site-photos'
import styles from '../pages.module.css'

export const revalidate = 60
export const metadata = {
  title: 'Blog',
  description: 'Festival stories, philosophy and temple news from ISKCON Coimbatore.',
}

const CATEGORIES = ['Festivals', 'Philosophy', 'Temple News', 'Tamil']

export default async function BlogPage({ searchParams }) {
  const { category } = await searchParams
  const active = CATEGORIES.includes(category) ? category : null
  const payload = await getPayloadClient()
  const photos = await getSitePhotos(payload)
  const posts = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'published' },
      ...(active ? { category: { equals: active } } : {}),
    },
    sort: '-publishedAt',
    limit: 24,
  })

  return (
    <>
      <PageHero
        image={bannerFor(photos, 'blog')}
        eyebrow="Blog"
        title="Wisdom for everyday life"
        intro="Festival stories, Bhagavad-gita insights and news from Sri Jagannath Mandir."
        crumbs={[{ label: 'Blog' }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          <nav aria-label="Categories" className={styles.chips}>
            <Link href="/blog" className={`${styles.chip} ${!active ? styles.chipOn : ''}`}>
              All
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/blog?category=${encodeURIComponent(c)}`}
                className={`${styles.chip} ${active === c ? styles.chipOn : ''}`}
              >
                {c}
              </Link>
            ))}
          </nav>

          {posts.docs.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>New articles are on their way</p>
              <p className={styles.emptyText}>
                {active ? `Nothing in ${active} yet. ` : ''}Please check back soon.
              </p>
            </div>
          ) : (
            <div className={styles.grid3}>
              {posts.docs.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className={styles.card}>
                  <div className={styles.cardImage}>
                    <ImageOrPlaceholder
                      media={p.image}
                      art="book"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.meta} style={{ marginTop: 0 }}>
                      {p.category && (
                        <span className={`${styles.tag} ${styles.tagGold}`}>{p.category}</span>
                      )}
                      <span className={styles.tag}>{formatDate(p.publishedAt)}</span>
                    </div>
                    <h2 className={styles.cardTitle} style={{ marginTop: '0.75rem' }}>
                      {p.title}
                    </h2>
                    <p className={styles.cardText}>{p.excerpt}</p>
                    <span className={`${styles.cardFoot} ${styles.more}`}>Read more →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
