'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FestivalArt } from '@/components/art/FestivalArt'
import { Mandala, Sparkle } from '@/components/art/Mandala'
import styles from './HeroSlider.module.css'

const DURATION = 7000

/** Pale slide colours: these get dark text instead of white */
const LIGHT_TONES = ['ivory']

/** Full-photo slide whose photo is too narrow to fill the banner without cropping (desktop). */
const isSplit = (s) =>
  s.layout === 'cinematic' && !s.video && !!s.image && (s.image.ratio ?? 2) < 1.7

// Fixed positions so server and client render identical sparks.
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + ((i + 11) % 3),
  delay: ((i + 11) * 0.73) % 9,
  duration: 7 + ((i + 11) % 5) * 1.6,
  drift: (((i + 11) % 7) - 3) * 12,
}))

function Embers({ className = '' }) {
  return (
    <div className={`${styles.embers} ${className}`} aria-hidden>
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className={`ember ${styles.ember}`}
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
            '--drift': `${e.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

/** Background video for a slide: plays from the start while its slide is showing, silent and looping. */
function SlideVideo({ slide, active, onDuration }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [active])
  // MP4/MOV first; HEVC files are labelled so browsers that cannot decode them skip to the WebM copy
  const mainType =
    slide.video.type === 'video/quicktime' ? 'video/mp4; codecs="hvc1"' : slide.video.type
  return (
    <video
      ref={ref}
      className={styles.video}
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'metadata'}
      poster={slide.image?.url}
      onLoadedMetadata={(e) => onDuration?.(slide.id, e.currentTarget.duration)}
      aria-hidden
    >
      <source src={slide.video.url} type={mainType} />
      {slide.videoWebm && <source src={slide.videoWebm.url} type="video/webm" />}
    </video>
  )
}

function SlideVisual({ slide, active, priority, variant }) {
  if (!slide.image) {
    return <FestivalArt theme={slide.art} compact={variant === 'arch'} className={styles.art} />
  }
  // Behind the arch the backdrop is a soft blurred copy; in the cinematic layout it is the sharp photo itself.
  const softBackdrop = variant === 'backdrop' && slide.layout !== 'cinematic'
  const image = slide.image
  const shared = {
    src: image.url,
    quality: 90,
    placeholder: image.blur ? 'blur' : 'empty',
    blurDataURL: image.blur,
    ...(priority ? { priority: true } : { loading: 'eager' }),
  }

  // Cinematic + a photo much narrower than the banner (e.g. 4:3): filling the width would crop the
  // deities' crowns. On desktop, show the whole photo on the right, fading into solid royal purple
  // on the left where the text sits.
  if (variant === 'backdrop' && isSplit(slide)) {
    return (
      <>
        {/* Phones: the photo fills the banner as usual */}
        <Image
          {...shared}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 1px, 100vw"
          style={{ objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%` }}
          className={styles.splitPhone}
        />
        <div className={styles.split}>
          {/* Royal purple panel behind the text (.split). The photo sits on the right (.splitPhoto),
              its left edge tinted purple (.splitTint) and faded out so the two melt together. */}
          <div
            className={styles.splitPhoto}
            style={{ '--focal': `${image.focalX ?? 50}% ${image.focalY ?? 50}%` }}
          >
            <Image
              key={active ? `on-${slide.id}` : slide.id}
              {...shared}
              alt=""
              fill
              sizes="(min-width: 1024px) 65vw, 1px"
              className={styles.splitImg}
            />
            <div className={styles.splitTint} />
          </div>
        </div>
      </>
    )
  }

  return (
    <Image
      key={active ? `on-${slide.id}` : slide.id}
      src={slide.image.url}
      alt={variant === 'arch' || slide.layout === 'cinematic' ? slide.image.alt : ''}
      fill
      {...(priority ? { priority: true } : { loading: 'eager' })}
      quality={90}
      sizes={variant === 'arch' ? '(min-width: 1024px) 480px, 1px' : '100vw'}
      placeholder={slide.image.blur ? 'blur' : 'empty'}
      blurDataURL={slide.image.blur}
      style={{ objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%` }}
      className={`${styles.photo} ${active && slide.layout !== 'cinematic' ? 'kenburns' : ''} ${softBackdrop ? styles.photoSoft : ''}`}
    />
  )
}

function Cta({ slide }) {
  return (
    <>
      <Link href={slide.primary.href} className={`btn-donate btn-lg ${styles.cta}`}>
        {slide.primary.label}
      </Link>
      {slide.secondary && (
        <Link href={slide.secondary.href} className={`btn-outline btn-lg ${styles.ctaOutline}`}>
          {slide.secondary.label}
        </Link>
      )}
    </>
  )
}

function Title({ slide, className }) {
  return (
    <h1 className={className}>
      {slide.title.split(' ').map((word, i) => (
        <span key={i} className={styles.word}>
          <span
            className={`reveal-up ${styles.wordInner}`}
            style={{ animationDelay: `${150 + i * 70}ms` }}
          >
            {word}&nbsp;
          </span>
        </span>
      ))}
    </h1>
  )
}

/** Arch layout: text on the left, photo in a tall temple arch on the right (desktop). */
function ArchSlide({ slide, slides, index, paused }) {
  return (
    <div className={`container-x ${styles.archGrid}`}>
      <div key={slide.id} className={styles.archText} aria-live={paused ? 'polite' : 'off'}>
        <p className={`rise ${styles.pill}`}>
          <Sparkle size={12} />
          {slide.eyebrow}
        </p>
        <Title
          slide={slide}
          className={`${styles.archTitle} ${slide.title.length > 28 ? styles.archTitleLong : ''}`}
        />
        <div className={`rise ${styles.rule}`} style={{ animationDelay: '350ms' }} />
        {slide.text && (
          <p className={`rise ${styles.archLead}`} style={{ animationDelay: '450ms' }}>
            {slide.text}
          </p>
        )}
        {slide.verse && (
          <p className={`rise ${styles.archVerse}`} style={{ animationDelay: '500ms' }}>
            “{slide.verse}”
          </p>
        )}
        <div className={`rise ${styles.archButtons}`} style={{ animationDelay: '550ms' }}>
          <Cta slide={slide} />
        </div>
      </div>

      <div className={styles.archWindow} aria-hidden>
        <div className={styles.archGlow} />
        <Mandala className={`spin-slow ${styles.archMandala}`} rings={5} />
        <div className={`arch ${styles.archLine1}`} />
        <div className={`arch ${styles.archLine2}`} />
        <div className={`arch ${styles.archFrame}`}>
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`${styles.archSlide} ${i === index ? '' : styles.archSlideOff}`}
            >
              <SlideVisual slide={s} active={i === index} variant="arch" />
            </div>
          ))}
          <div className={styles.archFrameShade} />
        </div>
      </div>
    </div>
  )
}

/** Cinematic layout: the photo fills the banner; quiet text in the lower-left. */
function CinematicSlide({ slide, paused }) {
  return (
    <div className={`container-x ${styles.cine}`}>
      <div key={slide.id} className={styles.cineText} aria-live={paused ? 'polite' : 'off'}>
        <p className={`rise ${styles.eyebrow}`}>
          <span className={styles.eyebrowLine} />
          {slide.eyebrow}
        </p>
        <Title
          slide={slide}
          className={`${styles.cineTitle} ${slide.title.length > 28 ? styles.cineTitleLong : ''}`}
        />
        {slide.verse && (
          <p className={`rise ${styles.cineVerse}`} style={{ animationDelay: '350ms' }}>
            {slide.verse}
          </p>
        )}
        <div className={`rise ${styles.cineActions}`} style={{ animationDelay: '500ms' }}>
          <Cta slide={slide} />
          {slide.text && <p className={styles.cineLead}>{slide.text}</p>}
        </div>
      </div>
    </div>
  )
}

export function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const count = slides.length

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count])

  // Video slides last as long as their video (once its length is known)
  const [videoLengths, setVideoLengths] = useState({})
  const onDuration = useCallback(
    (id, seconds) =>
      Number.isFinite(seconds) && setVideoLengths((d) => (d[id] ? d : { ...d, [id]: seconds })),
    [],
  )
  const slide = slides[index]
  const duration = slide.video && videoLengths[slide.id] ? videoLengths[slide.id] * 1000 : DURATION

  useEffect(() => {
    if (paused || count < 2) return
    const id = setTimeout(() => go(index + 1), duration)
    return () => clearTimeout(id)
  }, [index, paused, count, go, duration])

  const cinematic = slide.layout === 'cinematic'
  const split = isSplit(slide)
  const fade = (on) => `${styles.fade} ${on ? styles.on : styles.off}`

  return (
    <section
      className={`${styles.hero} ${styles[`tone-${slide.tone}`] ?? ''} ${LIGHT_TONES.includes(slide.tone) ? styles.light : ''}`}
      aria-roledescription="carousel"
      aria-label="Temple highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      {/* Backdrops for every slide, cross-faded. All load up front so changing slide never waits. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={`${styles.backdrop} ${styles[`tone-${s.tone}`] ?? ''} ${
            i === index
              ? s.layout === 'cinematic'
                ? ''
                : styles.backdropDim
              : s.layout === 'cinematic'
                ? styles.backdropOff
                : styles.backdropOffZoom
          }`}
        >
          {s.video ? (
            <SlideVideo slide={s} active={i === index} onDuration={onDuration} />
          ) : (
            <SlideVisual slide={s} active={i === index} priority={i === 0} variant="backdrop" />
          )}
        </div>
      ))}

      {/* Arch layout: fade to purple on the text side */}
      <div aria-hidden className={`${styles.shade} ${fade(!cinematic)}`}>
        <div className={`${styles.fill} ${styles.archShadeSide}`} />
        <div className={`${styles.fill} ${styles.archShadeBottom}`} />
      </div>
      {/* Cinematic layout: darken only the lower-left, where the text sits */}
      <div aria-hidden className={`${styles.shade} ${fade(cinematic && !split)}`}>
        <div className={`${styles.fill} ${styles.cineShadeBottom}`} />
        <div className={styles.cineShadeSide} />
      </div>
      {/* Split photo: a royal-purple wash over the blurred side ties the photo to the site colours */}
      <div aria-hidden className={`${styles.shade} ${fade(split)}`}>
        <div className={`${styles.fill} ${styles.splitShadeBottom}`} />
        <div className={styles.splitShadeSide} />
      </div>

      <Mandala className={`spin-slow ${styles.mandala} ${fade(!cinematic)}`} />
      <Embers className={fade(!cinematic)} />

      {cinematic ? (
        <CinematicSlide slide={slide} paused={paused} />
      ) : (
        <ArchSlide slide={slide} slides={slides} index={index} paused={paused} />
      )}

      {/* Slide navigation: thin progress segments, counter, arrows */}
      {count > 1 && (
        <div className={styles.nav}>
          <div className={`container-x ${styles.navInner}`}>
            <div className={styles.dots}>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.navLabel}`}
                  aria-current={i === index}
                  className={styles.dotButton}
                >
                  <span className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}>
                    {i === index && (
                      <span
                        key={`${s.id}-${paused}`}
                        className={styles.progress}
                        style={{
                          animation: paused ? 'none' : `progress ${duration}ms linear forwards`,
                          transform: paused ? 'scaleX(1)' : undefined,
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <p className={styles.counter} aria-hidden>
              <span className={styles.counterNow}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.counterSlash}>/</span>
              {String(count).padStart(2, '0')}
            </p>
            <div className={styles.arrows}>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
                className={styles.arrow}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next slide"
                className={styles.arrow}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
