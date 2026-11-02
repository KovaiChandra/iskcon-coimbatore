export const inr = (n) => `₹${n.toLocaleString('en-IN')}`

export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts })

/** Resolve an upload field (id or populated doc) to a URL, or null. */
export function mediaUrl(m, size) {
  if (!m || typeof m === 'number') return null
  return (size && m.sizes?.[size]?.url) || m.url || null
}

/** WhatsApp chat link. Without a number (Site settings not filled in yet) it opens WhatsApp's own picker. */
export const waLink = (number, text) =>
  `https://wa.me/${(number ?? '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const YOUTUBE_CHANNEL = 'https://www.youtube.com/@ISKCON_Coimbatore'

/** A social link from admin, or null if it is empty or just a site's home page (a placeholder). */
export const realLink = (url) =>
  url && !/^https?:\/\/(www\.)?(facebook|instagram|youtube)\.com\/?$/i.test(url.trim()) ? url : null
