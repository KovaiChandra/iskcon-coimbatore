/** `size` is the icon's width and height in pixels. Icons take their colour from the surrounding text. */

export const FacebookIcon = ({ size = 16, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" />
  </svg>
)
export const InstagramIcon = ({ size = 16, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
)
export const YoutubeIcon = ({ size = 16, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12a31 31 0 0 0 .4 3.8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15.1V8.9l5.2 3.1L10 15.1Z" />
  </svg>
)
export const WhatsAppIcon = ({ size = 16, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5 0-1.1.1-3.5-.9-2.9-1.2-4.8-4.2-5-4.4-.1-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6 0l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
  </svg>
)
export const SearchIcon = ({ size = 20, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
export const ChevronDown = ({ size = 14, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

/** Placeholder lotus mark until the temple supplies its official logo. */
export const LotusMark = ({ size = 44, className, style }) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <circle cx="24" cy="24" r="24" fill="#4b1d7a" />
    <path d="M24 11c4 5 4 12 0 19-4-7-4-14 0-19Z" fill="#f5b700" />
    <path d="M24 30c-1-6-5-10-11-11 0 7 4 11 11 11Z" fill="#ffd75e" />
    <path d="M24 30c1-6 5-10 11-11 0 7-4 11-11 11Z" fill="#ffd75e" />
    <path d="M12 33h24" stroke="#f5b700" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
