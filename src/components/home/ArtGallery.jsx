'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkle } from '@/components/art/Mandala'
import styles from './ArtGallery.module.css'

const pad = (n) => String(n).padStart(2, '0')

/** Tile shapes of the home page mosaic, in order (they fit together with no gaps).
    The last two are shown only on wide screens, where the mosaic spans the full width. */
const MOSAIC = ['big', 'tall', 'square', 'square', 'wide', 'wide', 'tall', 'tall']
const WIDE_ONLY = 6

/**
 * The Art gallery: artworks fitted edge to edge, no space between them, with a full-screen
 * viewer (arrows, swipe, Esc).
 *
 * works:    [{ id, url, width, height, alt, title, kind, position }]
 * layout:   'mosaic' (home page): six tiles of set shapes in one panel
 *           'rows'   (gallery page): every work at its natural proportions, in full-width rows
 * moreHref: shows the "View the full gallery" button under the artworks
 * heading:  false hides the section heading (the gallery page has its own page header)
 */
export function ArtGallery({ works, layout = 'rows', moreHref, heading = true }) {
  const mosaic = layout === 'mosaic' && works.length >= WIDE_ONLY
  const shown = mosaic ? works.slice(0, MOSAIC.length) : works
  const full = mosaic && shown.length === MOSAIC.length
  const [open, setOpen] = useState(null)
  const touchX = useRef(null)
  const count = shown.length

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

  const work = open === null ? null : shown[open]

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

        <ul className={mosaic ? `${styles.mosaic} ${full ? styles.mosaicFull : ''}` : styles.rows}>
          {shown.map((w, i) => (
            <li
              key={w.id}
              className={`${styles.tile} ${
                mosaic
                  ? `${styles[MOSAIC[i]]} ${styles[`t${i}`]} ${i >= WIDE_ONLY ? styles.extra : ''}`
                  : ''
              }`}
              style={
                mosaic
                  ? undefined
                  : { flexGrow: w.width / w.height, flexBasis: `${(w.width / w.height) * 15}rem` }
              }
            >
              <button
                type="button"
                className={styles.piece}
                onClick={() => setOpen(i)}
                aria-label={`View ${w.title}`}
                style={mosaic ? undefined : { aspectRatio: `${w.width} / ${w.height}` }}
              >
                <Image
                  src={w.url}
                  alt={w.alt}
                  fill
                  quality={90}
                  sizes={
                    mosaic && MOSAIC[i] === 'big'
                      ? '(min-width: 1024px) 50vw, 100vw'
                      : '(min-width: 1024px) 30vw, 60vw'
                  }
                  style={{ objectPosition: w.position ?? '50% 40%' }}
                  className={styles.img}
                />
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
