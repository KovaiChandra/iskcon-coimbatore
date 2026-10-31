import Link from 'next/link'
import { ImageOrPlaceholder } from './ImageOrPlaceholder'
import { Mandala, Sparkle } from './art/Mandala'
import styles from './PageHero.module.css'

/**
 * Header band at the top of every inner page: breadcrumb, eyebrow, title and a short intro,
 * on deep purple. With `image`, the photo sits on the right and fades into the purple.
 */
export function PageHero({ eyebrow, title, intro, image, crumbs = [], children }) {
  return (
    <section className={`${styles.hero} ${image ? styles.withImage : ''}`}>
      <Mandala className={`spin-slow ${styles.mandala}`} rings={5} />
      {image && (
        <div className={styles.photo} aria-hidden>
          <ImageOrPlaceholder
            media={image}
            size="hero"
            alt=""
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </div>
      )}
      <div className={`container-x ${styles.inner}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link href="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.href ?? c.label}>
              <span aria-hidden className={styles.sep}>
                /
              </span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
            </span>
          ))}
        </nav>
        {eyebrow && (
          <p className={styles.eyebrow}>
            <Sparkle size={10} />
            {eyebrow}
          </p>
        )}
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </section>
  )
}
