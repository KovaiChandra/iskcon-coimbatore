import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageOrPlaceholder } from '@/components/ImageOrPlaceholder'
import { PageHero } from '@/components/PageHero'
import { RichText } from '@/components/RichText'
import { formatDate } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import styles from '../../pages.module.css'

export const revalidate = 60

async function getPost(slug) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  return res.docs[0]
}

export async function generateMetadata({ params }) {
  const post = await getPost((await params).slug)
  return post ? { title: post.title, description: post.excerpt } : {}
}

export default async function PostPage({ params }) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <>
      <PageHero
        eyebrow={[post.category, formatDate(post.publishedAt), post.author]
          .filter(Boolean)
          .join(' · ')}
        title={post.title}
        intro={post.excerpt}
        crumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
      />

      <section className={styles.section}>
        <div className="container-x">
          <article className={styles.article}>
            {post.image && (
              <div className={styles.articleImage}>
                <ImageOrPlaceholder
                  media={post.image}
                  size="hero"
                  sizes="(min-width: 768px) 46rem, 100vw"
                />
              </div>
            )}
            <RichText data={post.content} />
            <p style={{ marginTop: '3rem' }}>
              <Link href="/blog" className={styles.more}>
                ← All articles
              </Link>
            </p>
          </article>
        </div>
      </section>
    </>
  )
}
