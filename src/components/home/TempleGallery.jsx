'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import styles from './TempleGallery.module.css'

/** Photo grid; tap a photo to see it large (arrow keys / Esc work). */
export function TempleGallery({ photos = [] }) {
  const [open, setOpen] = useState(null)
  const count = photos.length
  const go = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count])

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

  const current = open === null ? null : photos[open]

  return (
    <>
      <ul className={styles.grid}>
        {photos.map((p, i) => (
          <li key={p.url} className={styles.item}>
            <button type="button" className={styles.thumb} onClick={() => setOpen(i)} aria-label={`Open photo: ${p.alt}`}>
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={styles.img}
                style={{ objectPosition: `${p.focalX ?? 50}% ${p.focalY ?? 50}%` }}
              />
              <span className={styles.caption}>{p.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={current.alt} onClick={() => setOpen(null)}>
          <div className={styles.frame} onClick={(e) => e.stopPropagation()}>
            <Image src={current.full || current.url} alt={current.alt} fill sizes="100vw" className={styles.full} />
          </div>
          <p className={styles.lbCaption}>
            {current.alt} · {open + 1} / {count}
          </p>
          <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous photo">
            ←
          </button>
          <button type="button" className={`${styles.nav} ${styles.next}`} onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next photo">
            →
          </button>
          <button type="button" className={styles.close} onClick={() => setOpen(null)} aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </>
  )
}
