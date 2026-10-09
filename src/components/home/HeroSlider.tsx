'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FestivalArt, type ArtTheme } from '@/components/art/FestivalArt'
import { Mandala, Sparkle } from '@/components/art/Mandala'

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  text?: string | null
  image?: { url: string; alt: string } | null
  art: ArtTheme
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  navLabel: string
  navMeta: string
}

const DURATION = 7000

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = slides.length

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    const id = setTimeout(() => go(index + 1), DURATION)
    return () => clearTimeout(id)
  }, [index, paused, count, go])

  const slide = slides[index]

  return (
    <section
      className="relative isolate overflow-hidden bg-purple-950 text-white"
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
      {/* Backgrounds, cross-faded */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 -z-20 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== index}
        >
          {s.image ? (
            <Image
              key={i === index ? `on-${s.id}` : s.id}
              src={s.image.url}
              alt={s.image.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === index ? 'kenburns' : ''}`}
            />
          ) : (
            <FestivalArt theme={s.art} className="absolute inset-0 size-full md:left-[18%] md:w-[82%]" />
          )}
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-950 via-purple-950/80 to-transparent md:via-purple-950/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-950 via-transparent to-transparent" />
      <Mandala className="spin-slow pointer-events-none absolute -left-40 -top-40 -z-10 size-[520px] text-saffron-500/10" />

      <div className="container-x flex min-h-[560px] flex-col justify-center pb-40 pt-16 md:min-h-[640px] lg:min-h-[min(78vh,820px)]">
        <div key={slide.id} className="max-w-2xl" aria-live={paused ? 'polite' : 'off'}>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-saffron-500/40 bg-saffron-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300">
            <Sparkle className="size-3" />
            {slide.eyebrow}
          </p>
          <h1 className="rise mt-6 text-4xl leading-[1.05] text-white sm:text-5xl md:text-7xl" style={{ animationDelay: '120ms' }}>
            {slide.title}
          </h1>
          {slide.text && (
            <p className="rise mt-6 max-w-xl text-base text-purple-100 md:text-lg" style={{ animationDelay: '240ms' }}>
              {slide.text}
            </p>
          )}
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '360ms' }}>
            <Link href={slide.primary.href} className="btn-donate px-7 py-3 text-base shadow-[0_0_40px_-8px] shadow-saffron-500/70">
              {slide.primary.label}
            </Link>
            {slide.secondary && (
              <Link href={slide.secondary.href} className="btn-outline px-7 py-3 text-base text-white">
                {slide.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide navigation */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-purple-950/60 backdrop-blur-md">
          <div className="container-x flex items-stretch">
            <ol className="hidden flex-1 grid-cols-[repeat(auto-fit,minmax(0,1fr))] md:grid">
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show slide ${i + 1}: ${s.navLabel}`}
                    aria-current={i === index}
                    className={`group relative w-full px-4 py-5 text-left transition ${i === index ? '' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <span className="absolute inset-x-4 top-0 h-0.5 overflow-hidden bg-white/15">
                      {i === index && (
                        <span
                          key={`${s.id}-${paused}`}
                          className="block h-full origin-left bg-saffron-500"
                          style={{ animation: paused ? 'none' : `progress ${DURATION}ms linear forwards`, transform: paused ? 'scaleX(1)' : undefined }}
                        />
                      )}
                    </span>
                    <span className="font-serif text-sm text-saffron-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mt-1 block truncate text-sm font-medium">{s.navLabel}</span>
                    <span className="block truncate text-xs text-purple-100/70">{s.navMeta}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex flex-1 items-center gap-2 py-4 md:hidden">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.navLabel}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-saffron-500' : 'w-3 bg-white/30'}`}
                />
              ))}
              <span className="ml-2 truncate text-xs text-purple-100/80">{slide.navMeta}</span>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-10 place-items-center rounded-full border border-white/25 hover:border-saffron-500 hover:text-saffron-300">
                ←
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-10 place-items-center rounded-full border border-white/25 hover:border-saffron-500 hover:text-saffron-300">
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
