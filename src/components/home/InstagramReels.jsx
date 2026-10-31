'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { InstagramIcon } from '@/components/Icons'
import styles from './InstagramReels.module.css'

/** One reel tile: the video plays silently while it is on screen; a photo otherwise. */
function Reel({ reel, href }) {
  const ref = useRef(null)

  useEffect(() => {
    const v = ref.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.4 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <li className={styles.item}>
      <a
        href={reel.link || href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.reel}
        aria-label={`${reel.caption} on Instagram`}
      >
        {reel.video ? (
          <video
            ref={ref}
            className={styles.media}
            muted
            loop
            playsInline
            preload="metadata"
            poster={reel.poster}
            aria-hidden
          >
            <source src={reel.video.url} type={reel.video.type} />
          </video>
        ) : (
          <Image
            src={reel.poster}
            alt={reel.alt}
            fill
            sizes="(min-width: 1024px) 22vw, 60vw"
            className={styles.media}
          />
        )}
        <span className={styles.shade} aria-hidden />
        <span className={styles.badge} aria-hidden>
          {reel.video ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <InstagramIcon size={14} />
          )}
        </span>
        <span className={styles.caption}>{reel.caption}</span>
      </a>
    </li>
  )
}

/** Home page: the Instagram section with recent reels and a Follow button. */
export function InstagramReels({ reels, href, handle }) {
  return (
    <section className={styles.section} aria-labelledby="instagram-title">
      <div className="container-x">
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>
              <InstagramIcon size={14} />
              {handle || 'On Instagram'}
            </p>
            <h2 id="instagram-title" className={styles.title}>
              Darshan, every day, on <span className={styles.accent}>Instagram</span>
            </h2>
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.follow}>
            <InstagramIcon size={18} /> Follow us
          </a>
        </div>

        <ul className={styles.row}>
          {reels.map((r) => (
            <Reel key={r.id} reel={r} href={href} />
          ))}
        </ul>
      </div>
    </section>
  )
}
