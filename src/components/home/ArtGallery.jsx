'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkle } from '@/components/art/Mandala'
import styles from './ArtGallery.module.css'

const pad = (n) => String(n).padStart(2, '0')

/**
 * Home page art gallery: framed artworks on a quiet ivory wall (masonry, natural proportions),
 * with a full-screen viewer (arrows, swipe, Esc).
 * works: [{ id, url, width, height, alt, title, kind }]
 * moreHref: shows a "View the full gallery" button under the wall (home page).
 * heading: false hides the section heading (the /art-gallery page has its own page header).
 */
export function ArtGallery({ works, moreHref, heading = true }) {
  const [open, setOpen] = useState(null)
  const touchX = useRef(null)
  const count = works.length

  const go = useCallback(
    (step) => setOpen((i) => (i === null ? i : (i + step + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, go])

  const work = open === null ? null : works[open]

  return (
    <section
      className={styles.section}
      aria-labelledby={heading ? 'art-gallery-title' : undefined}
      aria-label={heading ? undefined : 'Artworks'}
    >
      <div className="container-x">
        {heading && (
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              <Sparkle size={10} />
              Art gallery
            </p>
            <h2 id="art-gallery-title" className={styles.title}>
              Sacred art of Sri Jagannath Mandir
            </h2>
            <div className={styles.rule} aria-hidden>
              <span />
              <Sparkle size={9} />
              <span />
            </div>
            <p className={styles.intro}>
              Paintings and darshan from our temple, offered for your contemplation.
            </p>
          </header>
        )}

        <ul className={styles.wall}>
          {works.map((w, i) => (
            <li key={w.id} className={styles.item}>
              <button
                type="button"
                className={styles.piece}
                onClick={() => setOpen(i)}
                aria-label={`View ${w.title}`}
              >
                <span className={styles.frame}>
                  <span className={styles.mat}>
                    <Image
                      src={w.url}
                      alt={w.alt}
                      width={w.width}
                      height={w.height}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
                      className={styles.img}
                    />
                  </span>
                </span>
                <span className={styles.caption}>
                  <span className={styles.no}>No. {pad(i + 1)}</span>
                  <span className={styles.name}>{w.title}</span>
                  {w.kind && <span className={styles.kind}>{w.kind}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {moreHref && (
          <div className={styles.more}>
            <Link href={moreHref} className={styles.moreButton}>
              View the full gallery <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>

      {work && (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={work.title}
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <figure key={work.id} className={styles.stage}>
            <div className={styles.stageImg}>
              <Image
                src={work.url}
                alt={work.alt}
                fill
                sizes="100vw"
                quality={90}
                className={styles.stagePhoto}
              />
            </div>
            <figcaption className={styles.stageCaption}>
              <span className={styles.stageNo}>
                {pad(open + 1)} / {pad(count)}
              </span>
              <span className={styles.stageName}>{work.title}</span>
              {work.kind && <span className={styles.stageKind}>{work.kind}</span>}
            </figcaption>
          </figure>
          {count > 1 && (
            <>
              <button
                type="button"
                className={`${styles.nav} ${styles.prev}`}
                onClick={() => go(-1)}
                aria-label="Previous artwork"
              >
                ←
              </button>
              <button
                type="button"
                className={`${styles.nav} ${styles.next}`}
                onClick={() => go(1)}
                aria-label="Next artwork"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
