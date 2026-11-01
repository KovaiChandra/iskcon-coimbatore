'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import styles from './Motion.module.css'

/*
 * Site-wide motion, added once in the layout:
 *  - scroll reveal: headings, cards and photos fade gently up into view, list items one after another
 *  - a thin gold loading bar while the next page loads
 *  - html[data-scrolled] once the page is scrolled (the header turns to frosted glass)
 * Nothing is hidden until this script runs, and it does nothing for visitors who prefer reduced motion.
 * To keep an element still, put data-no-reveal on it or on a parent.
 */

// What rises into view. List items are staggered; everything else rises on its own.
const SELECTORS = [
  'main section h2',
  'main section h2 + p',
  'main section header',
  'main section ul > li',
  'main section ol > li',
  'main section [class*="collage"]',
  'main section [class*="Frame"]',
  'main section [class*="photo"]',
  'main section form',
  'main section [class*="aside"]',
  'main section [class*="empty"]',
].join(',')

const STAGGER_MS = 80
const MAX_STAGGER = 6

function useScrollReveal(pathname) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.documentElement.classList.add('motion-on')

    // Only what starts below the fold animates; what is on screen already arrives with the page.
    const els = [...document.querySelectorAll(SELECTORS)].filter(
      (el) =>
        !el.closest('[data-no-reveal], body > header, footer, nav, [aria-hidden="true"]') &&
        !el.parentElement?.closest('[data-reveal]') &&
        el.getBoundingClientRect().top > window.innerHeight,
    )
    for (const el of els) {
      const siblings = el.tagName === 'LI' ? [...el.parentElement.children] : []
      const i = Math.min(siblings.indexOf(el), MAX_STAGGER)
      el.setAttribute('data-reveal', '')
      if (i > 0) el.style.setProperty('--reveal-delay', `${i * STAGGER_MS}ms`)
    }

    const pending = new Set(els)
    const reveal = (el) => {
      if (!pending.delete(el)) return
      io.unobserve(el)
      el.classList.add('is-in')
      // Hand the element back to its own styles (hover lifts etc.) once it has arrived
      const delay = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10)
      setTimeout(() => {
        el.removeAttribute('data-reveal')
        el.classList.remove('is-in')
        el.style.removeProperty('--reveal-delay')
      }, 1800 + delay)
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal(e.target)),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))

    // Safety net: never leave something hidden that has been scrolled past or into view
    // (e.g. a jump to #timings, or a browser where the observer is slow to report).
    const onScroll = () => {
      for (const el of pending) if (el.getBoundingClientRect().top < window.innerHeight * 0.95) reveal(el)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const fallback = setTimeout(onScroll, 1500)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      clearTimeout(fallback)
      // Show anything still waiting, so a re-run never leaves an element hidden
      for (const el of pending) {
        el.removeAttribute('data-reveal')
        el.style.removeProperty('--reveal-delay')
      }
    }
  }, [pathname])
}

function useScrolledFlag() {
  useEffect(() => {
    const root = document.documentElement
    const update = () => root.toggleAttribute('data-scrolled', window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
}

/** Sets the loading bar's state (styles in Motion.module.css). */
const setBar = (el, state) => {
  if (el) el.dataset.state = state
}

/** Starts on a click to another page of this site, finishes when the new page is shown. */
function useNavProgress(pathname) {
  const bar = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      // Runs before Next's <Link> handler (capture phase), which cancels the default click
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest?.('a[href]')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      clearTimeout(timer.current)
      setBar(bar.current, 'loading')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    if (bar.current?.dataset.state === 'loading') setBar(bar.current, 'done')
    timer.current = setTimeout(() => setBar(bar.current, 'idle'), 450)
    return () => clearTimeout(timer.current)
  }, [pathname])

  return bar
}

export function Motion() {
  const pathname = usePathname()
  useScrollReveal(pathname)
  useScrolledFlag()
  const bar = useNavProgress(pathname)
  return <div ref={bar} className={styles.progress} data-state="idle" aria-hidden />
}
