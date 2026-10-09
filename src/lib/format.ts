import type { Media } from '@/payload-types'

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export const formatDate = (d: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts })

/** Resolve an upload field (id or populated doc) to a URL, or null. */
export function mediaUrl(m: number | Media | null | undefined, size?: 'thumb' | 'card' | 'hero') {
  if (!m || typeof m === 'number') return null
  return (size && m.sizes?.[size]?.url) || m.url || null
}

export const waLink = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
