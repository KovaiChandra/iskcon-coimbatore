import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { NAV } from '@/lib/nav'
import { getPayloadClient } from '@/lib/payload'
import styles from '../pages.module.css'

export const metadata = { title: 'Search' }

/** Collections that can be searched, the title field and where each result links */
const SOURCES = [
  { collection: 'festivals', type: 'Festival', field: 'name', href: (d) => `/festivals/${d.slug}` },
  { collection: 'sevas', type: 'Seva', field: 'title', href: (d) => `/donate/${d.slug}` },
  { collection: 'courses', type: 'Course', field: 'title', href: () => '/courses' },
  { collection: 'services', type: 'Service', field: 'title', href: () => '/services' },
  {
    collection: 'posts',
    type: 'Article',
    field: 'title',
    href: (d) => `/blog/${d.slug}`,
    where: { _status: { equals: 'published' } },
  },
]

export default async function SearchPage({ searchParams }) {
  const q = String((await searchParams).q ?? '').trim()
  let results = []

  if (q.length >= 2) {
    const payload = await getPayloadClient()
    const found = await Promise.all(
      SOURCES.map((s) =>
        payload
          .find({
            collection: s.collection,
            where: { [s.field]: { like: q }, ...(s.where ?? {}) },
            limit: 8,
            depth: 0,
          })
          .then((r) =>
            r.docs.map((d) => ({
              type: s.type,
              title: d[s.field],
              href: s.href(d),
              id: `${s.collection}-${d.id}`,
            })),
          ),
      ),
    )
    const pages = NAV.flatMap((n) => [n, ...(n.children ?? [])])
      .filter((n, i, all) => all.findIndex((m) => m.href === n.href) === i)
      .filter((n) => n.label.toLowerCase().includes(q.toLowerCase()))
      .map((n) => ({ type: 'Page', title: n.label, href: n.href, id: `page-${n.href}` }))
    results = [...pages, ...found.flat()]
  }

  return (
    <>
      <PageHero eyebrow="Search" title="Search the website" crumbs={[{ label: 'Search' }]}>
        <form
          action="/search"
          role="search"
          className={styles.searchForm}
          style={{ width: '100%' }}
        >
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Festivals, sevas, courses…"
            className={styles.searchInput}
          />
          <button type="submit" className="btn-donate">
            Search
          </button>
        </form>
      </PageHero>

      <section className={styles.section}>
        <div className="container-x" style={{ maxWidth: '48rem' }}>
          {!q ? (
            <p className={styles.lead} style={{ marginTop: 0 }}>
              Type a word above, for example &ldquo;Gita&rdquo;, &ldquo;Annadaan&rdquo; or a
              festival name.
            </p>
          ) : results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No results for &ldquo;{q}&rdquo;</p>
              <p className={styles.emptyText}>Try a shorter word, or browse the menu above.</p>
            </div>
          ) : (
            <>
              <p className={styles.lead} style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </p>
              <ul className={styles.results}>
                {results.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href} className={styles.result}>
                      <p className={styles.resultType}>{r.type}</p>
                      <p className={styles.resultTitle}>{r.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  )
}
