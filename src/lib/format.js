export const inr = (n) => `₹${n.toLocaleString('en-IN')}`

export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts })

/** Resolve an upload field (id or populated doc) to a URL, or null. */
export function mediaUrl(m, size) {
  if (!m || typeof m === 'number') return null
  return (size && m.sizes?.[size]?.url) || m.url || null
}

export const waLink = (number, text) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
