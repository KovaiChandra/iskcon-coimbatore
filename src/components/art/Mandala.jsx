/** Decorative mandala built from rotated petal rings. Colour comes from `currentColor`. */
export function Mandala({ className = '', rings = 4 }) {
  const ringDefs = [
    { r: 18, count: 8, len: 14, w: 6 },
    { r: 34, count: 12, len: 16, w: 7 },
    { r: 52, count: 16, len: 18, w: 7 },
    { r: 72, count: 24, len: 16, w: 6 },
    { r: 90, count: 32, len: 10, w: 4 },
  ].slice(0, rings + 1)

  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <circle r="6" strokeWidth="1" />
      {ringDefs.map(({ r, count, len, w }, i) => (
        <g key={r} strokeWidth={i % 2 ? 0.6 : 0.9}>
          <circle r={r} strokeOpacity="0.5" strokeDasharray={i % 2 ? '1 3' : undefined} />
          {Array.from({ length: count }, (_, j) => (
            <path
              key={j}
              transform={`rotate(${(360 / count) * j + (i % 2 ? 180 / count : 0)})`}
              d={`M0 ${-r} C ${w} ${-r - len * 0.4}, ${w * 0.6} ${-r - len * 0.85}, 0 ${-r - len} C ${-w * 0.6} ${-r - len * 0.85}, ${-w} ${-r - len * 0.4}, 0 ${-r} Z`}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Small four-point star used as a separator. */
export const Sparkle = ({ size = 12, className, style }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, ...style }}
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0Z" />
  </svg>
)
