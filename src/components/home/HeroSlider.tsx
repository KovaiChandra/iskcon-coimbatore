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

// Fixed positions so server and client render identical sparks.
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.73) % 9,
  duration: 7 + (i % 5) * 1.6,
  drift: ((i % 7) - 3) * 12,
}))

function Embers() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="ember absolute bottom-0 rounded-full bg-saffron-300 shadow-[0_0_8px_2px] shadow-saffron-500/60"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              '--drift': `${e.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function SlideVisual({ slide, active, priority, variant }: { slide: HeroSlide; active: boolean; priority?: boolean; variant: 'backdrop' | 'arch' }) {
  if (slide.image) {
    return (
      <Image
        key={active ? `on-${slide.id}` : slide.id}
        src={slide.image.url}
        alt={variant === 'arch' ? slide.image.alt : ''}
        fill
        priority={priority}
        quality={90}
        sizes={variant === 'arch' ? '(min-width: 1024px) 480px, 1px' : '100vw'}
        className={`object-cover ${active ? 'kenburns' : ''} ${variant === 'backdrop' ? 'lg:scale-110 lg:blur-2xl' : ''}`}
      />
    )
  }
  return <FestivalArt theme={slide.art} compact={variant === 'arch'} className="absolute inset-0 size-full" />
}

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
  const next = slides[(index + 1) % count]

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
      {/* Backdrop: the slide's photo (blurred behind the arch on desktop) or its illustrated scene */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden
          className={`absolute inset-0 -z-30 transition-[opacity,transform] duration-[1400ms] ease-out ${
            i === index ? 'scale-100 opacity-100 lg:opacity-45' : 'scale-105 opacity-0'
          }`}
        >
          <SlideVisual slide={s} active={i === index} priority={i === 0} variant="backdrop" />
        </div>
      ))}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-purple-950/70 via-purple-950/35 to-transparent lg:from-purple-950 lg:via-purple-950/70 lg:to-purple-950/30" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-purple-950 via-purple-950/20 to-purple-950/30" />
      <Mandala className="spin-slow pointer-events-none absolute -left-48 -top-48 -z-10 size-[560px] text-saffron-500/10" />
      <Embers />

      <div className="container-x grid min-h-[600px] items-center gap-12 pb-28 pt-14 lg:min-h-[min(82vh,860px)] lg:grid-cols-[1.15fr_0.85fr] lg:pb-28">
        {/* Text */}
        <div key={slide.id} className="max-w-2xl [text-shadow:0_2px_16px_rgba(28,10,51,0.85)] lg:[text-shadow:none]" aria-live={paused ? 'polite' : 'off'}>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-saffron-500/40 bg-purple-950/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-300 backdrop-blur-sm">
            <Sparkle className="size-3" />
            {slide.eyebrow}
          </p>
          <h1 className={`mt-6 text-[2.6rem] leading-[1.04] text-white sm:text-6xl ${slide.title.length > 28 ? 'xl:text-[4rem]' : 'xl:text-7xl'}`}>
            {slide.title.split(' ').map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span className="reveal-up inline-block" style={{ animationDelay: `${150 + i * 70}ms` }}>
                  {word}&nbsp;
                </span>
              </span>
            ))}
          </h1>
          <div className="rise mt-5 h-px w-24 bg-gradient-to-r from-saffron-500 to-transparent" style={{ animationDelay: '350ms' }} />
          {slide.text && (
            <p className="rise mt-5 max-w-xl text-base leading-relaxed text-purple-100 md:text-lg" style={{ animationDelay: '450ms' }}>
              {slide.text}
            </p>
          )}
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '550ms' }}>
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

        {/* Temple-arch window (desktop) */}
        <div className="relative mx-auto hidden w-full max-w-[420px] lg:block" aria-hidden>
          <div className="absolute left-1/2 top-1/2 size-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,183,0,0.35)_0%,rgba(245,183,0,0.08)_40%,transparent_70%)]" />
          <Mandala className="spin-slow absolute left-1/2 top-1/2 size-[135%] -translate-x-1/2 -translate-y-1/2 text-saffron-300/30" rings={5} />
          <div className="arch absolute -inset-3 border border-saffron-300/60" />
          <div className="arch absolute -inset-6 border border-saffron-300/20" />
          <div className="arch relative aspect-[4/5] overflow-hidden bg-purple-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-2 ring-saffron-500">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-[opacity,transform,filter] duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                  i === index ? 'scale-100 opacity-100 blur-0' : 'scale-110 opacity-0 blur-sm'
                }`}
              >
                <SlideVisual slide={s} active={i === index} variant="arch" />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-purple-950/40 to-transparent" />
          </div>

          {/* Next-up card */}
          {count > 1 && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => go(index + 1)}
              className="absolute -bottom-6 -left-12 flex w-60 items-center gap-3 rounded-2xl border border-white/15 bg-purple-950/70 p-2.5 pr-4 text-left shadow-xl backdrop-blur-md transition hover:border-saffron-500/60"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                <SlideVisual slide={next} active={false} variant="arch" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-300">Next up</span>
                <span className="block truncate font-serif text-base">{next.navLabel}</span>
                <span className="block truncate text-xs text-purple-100/70">{next.navMeta}</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Slide navigation: thin progress segments, counter, arrows */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-x flex items-center gap-5 pb-8">
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.navLabel}`}
                  aria-current={i === index}
                  className="group py-3"
                >
                  <span
                    className={`relative block h-0.5 overflow-hidden rounded-full bg-white/25 transition-all duration-500 group-hover:bg-white/50 ${
                      i === index ? 'w-16' : 'w-8'
                    }`}
                  >
                    {i === index && (
                      <span
                        key={`${s.id}-${paused}`}
                        className="absolute inset-0 origin-left bg-saffron-500"
                        style={{
                          animation: paused ? 'none' : `progress ${DURATION}ms linear forwards`,
                          transform: paused ? 'scaleX(1)' : undefined,
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm tabular-nums text-purple-100/80" aria-hidden>
              <span className="font-serif text-base text-saffron-300">{String(index + 1).padStart(2, '0')}</span>
              <span className="mx-1.5">/</span>
              {String(count).padStart(2, '0')}
            </p>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
                className="grid size-10 place-items-center rounded-full border border-white/25 transition hover:border-saffron-500 hover:text-saffron-300"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next slide"
                className="grid size-10 place-items-center rounded-full border border-white/25 transition hover:border-saffron-500 hover:text-saffron-300"
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
