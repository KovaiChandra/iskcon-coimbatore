/**
 * Illustrated scenes shown when a slide or festival has no photo yet.
 * Pure SVG + CSS animation, so they stay crisp and cost nothing to load.
 */
export type ArtTheme = 'temple' | 'lamps' | 'hill' | 'moon' | 'book' | 'chariot' | 'lotus'

const GOLD = '#f5b700'
const GOLD_LIGHT = '#ffd75e'

function Stars({ seed = 1, count = 40 }: { seed?: number; count?: number }) {
  // Integer hash (exact on server and client), rounded so SSR and hydration match.
  const rand = (i: number, k: number) => {
    let h = Math.imul(seed, 73856093) ^ Math.imul(i, 19349663) ^ Math.imul(k, 83492791)
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h ^= h >>> 16
    return Math.round(((h >>> 0) / 4294967296) * 100) / 100
  }
  return (
    <g fill="#fff">
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={rand(i, 1) * 800} cy={rand(i, 2) * 380} r={rand(i, 3) * 1.4 + 0.3} className="art-twinkle" style={{ animationDelay: `${rand(i, 4) * 4}s` }} opacity={0.4 + rand(i, 5) * 0.5} />
      ))}
    </g>
  )
}

function Diya({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="-26" rx="26" ry="30" fill={GOLD} opacity="0.18" className="art-glow" style={{ animationDelay: `${delay}s` }} />
      <path d="M0 -44 C 9 -30, 8 -20, 0 -14 C -8 -20, -9 -30, 0 -44 Z" fill={GOLD_LIGHT} className="art-flame" style={{ animationDelay: `${delay}s` }} />
      <path d="M0 -34 C 4 -26, 4 -21, 0 -17 C -4 -21, -4 -26, 0 -34 Z" fill="#fff" opacity="0.85" className="art-flame" style={{ animationDelay: `${delay}s` }} />
      <path d="M-24 -12 Q 0 -6 24 -12 Q 20 8 0 10 Q -20 8 -24 -12 Z" fill="#c2410c" />
      <path d="M-24 -12 Q 0 -6 24 -12" stroke={GOLD} strokeWidth="2" fill="none" />
      <path d="M-14 0 Q 0 4 14 0" stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.7" />
    </g>
  )
}

function Lotus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 -60 C 18 -38, 18 -14, 0 0 C -18 -14, -18 -38, 0 -60 Z" fill="#f9a8d4" />
      <path d="M0 0 C -10 -26, -34 -40, -56 -36 C -50 -14, -28 0, 0 0 Z" fill="#f472b6" />
      <path d="M0 0 C 10 -26, 34 -40, 56 -36 C 50 -14, 28 0, 0 0 Z" fill="#f472b6" />
      <path d="M0 0 C -24 -8, -54 -6, -70 6 C -44 16, -18 12, 0 0 Z" fill="#db2777" />
      <path d="M0 0 C 24 -8, 54 -6, 70 6 C 44 16, 18 12, 0 0 Z" fill="#db2777" />
    </g>
  )
}

const scenes: Record<ArtTheme, () => React.ReactNode> = {
  temple: () => (
    <>
      <circle cx="560" cy="250" r="170" fill="url(#sun)" className="art-glow" />
      {/* Jagannath-style shikhara temple silhouette */}
      <g fill="#14062a">
        <path d="M470 400 L470 300 Q470 250 500 230 Q520 140 560 90 Q600 140 620 230 Q650 250 650 300 L650 400 Z" />
        <path d="M400 400 L400 330 Q400 300 420 290 Q440 260 450 250 Q460 260 480 290 L480 400 Z" />
        <path d="M640 400 L640 330 Q640 300 660 290 Q680 260 690 250 Q700 260 720 290 L720 400 Z" />
        <rect x="380" y="380" width="360" height="40" />
      </g>
      <g stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M500 230 Q560 220 620 230" />
        <path d="M490 270 Q560 258 630 270" />
        <path d="M480 310 Q560 298 640 310" />
      </g>
      <line x1="560" y1="90" x2="560" y2="50" stroke={GOLD} strokeWidth="2" />
      <path d="M560 50 L600 58 L560 68 Z" fill={GOLD} className="art-flag" />
      <circle cx="560" cy="92" r="5" fill={GOLD} />
      <path d="M540 400 L540 350 Q560 330 580 350 L580 400 Z" fill={GOLD} opacity="0.25" />
    </>
  ),
  lamps: () => (
    <>
      <circle cx="560" cy="220" r="160" fill="url(#sun)" opacity="0.5" />
      {[
        [470, 250, 1.3, 0], [600, 240, 1.5, 0.6], [720, 270, 1.1, 1.2],
        [420, 330, 1.1, 0.3], [540, 345, 1.6, 0.9], [680, 350, 1.3, 1.5], [780, 340, 0.9, 0.4],
      ].map(([x, y, s, d], i) => <Diya key={i} x={x} y={y} scale={s} delay={d} />)}
    </>
  ),
  hill: () => (
    <>
      <circle cx="600" cy="150" r="60" fill={GOLD_LIGHT} opacity="0.9" />
      <circle cx="600" cy="150" r="120" fill="url(#sun)" className="art-glow" />
      <path d="M330 420 Q450 260 560 230 Q620 215 680 250 Q770 300 820 420 Z" fill="#2d6a4f" />
      <path d="M380 420 Q480 300 580 280 Q680 290 800 420 Z" fill="#1b4332" />
      {/* Annakut offerings at the foot of the hill */}
      {[440, 480, 520, 560, 600, 640, 680, 720].map((x, i) => (
        <g key={x} transform={`translate(${x} ${398 - (i % 2) * 6})`}>
          <path d="M-14 0 Q 0 -22 14 0 Z" fill={i % 3 ? GOLD : '#fb923c'} />
          <rect x="-16" y="0" width="32" height="6" rx="3" fill="#7c2d12" />
        </g>
      ))}
      {/* Raised finger + hill outline in gold */}
      <path d="M560 230 Q620 215 680 250" stroke={GOLD} strokeWidth="2" fill="none" />
    </>
  ),
  moon: () => (
    <>
      <circle cx="580" cy="170" r="190" fill="url(#moonGlow)" className="art-glow" />
      <circle cx="580" cy="170" r="92" fill="#fff7e0" />
      <circle cx="550" cy="150" r="14" fill="#f3e2b5" opacity="0.7" />
      <circle cx="610" cy="195" r="9" fill="#f3e2b5" opacity="0.6" />
      <rect x="320" y="330" width="500" height="100" fill="#1c0a33" opacity="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={540 - i * 6} y={345 + i * 14} width={80 + i * 12} height="3" rx="1.5" fill="#fff7e0" opacity={0.5 - i * 0.1} className="art-shimmer" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      <Lotus x={430} y={380} scale={0.6} />
      <Lotus x={740} y={395} scale={0.45} />
    </>
  ),
  book: () => (
    <>
      <g className="art-rays" style={{ transformOrigin: '570px 260px' }}>
        {Array.from({ length: 18 }, (_, i) => (
          <path key={i} d="M570 260 L560 40 L580 40 Z" fill={GOLD} opacity="0.18" transform={`rotate(${i * 20} 570 260)`} />
        ))}
      </g>
      <circle cx="570" cy="260" r="120" fill="url(#sun)" />
      <g transform="translate(570 300)">
        <path d="M0 0 Q -70 -30 -150 -10 L -150 60 Q -70 40 0 70 Z" fill="#fff7e0" />
        <path d="M0 0 Q 70 -30 150 -10 L 150 60 Q 70 40 0 70 Z" fill="#fdf0c8" />
        <path d="M0 0 L0 70" stroke="#c99a00" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} stroke="#b08900" strokeWidth="1.5" opacity="0.6">
            <path d={`M-130 ${8 + i * 12} Q -70 ${-8 + i * 12} -15 ${12 + i * 12}`} fill="none" />
            <path d={`M15 ${12 + i * 12} Q 70 ${-8 + i * 12} 130 ${8 + i * 12}`} fill="none" />
          </g>
        ))}
        <path d="M-160 62 Q -70 44 0 76 Q 70 44 160 62 L 160 72 Q 70 56 0 86 Q -70 56 -160 72 Z" fill="#7c2d12" />
      </g>
    </>
  ),
  chariot: () => (
    <>
      <circle cx="570" cy="200" r="150" fill="url(#sun)" className="art-glow" />
      <g transform="translate(570 0)">
        <path d="M-70 300 L-50 150 L0 80 L50 150 L70 300 Z" fill="#b91c1c" />
        <path d="M-50 150 L0 80 L50 150" stroke={GOLD} strokeWidth="3" fill="none" />
        {[-40, -14, 14, 40].map((x) => (
          <rect key={x} x={x - 6} y="160" width="12" height="130" fill={x % 28 ? GOLD : '#facc15'} opacity="0.9" />
        ))}
        <rect x="-110" y="295" width="220" height="24" rx="4" fill="#7c2d12" />
        {[-80, 0, 80].map((x) => (
          <g key={x} transform={`translate(${x} 345)`} className="art-wheel">
            <circle r="34" fill="none" stroke={GOLD} strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1="0" y1="0" x2="0" y2="-32" stroke={GOLD} strokeWidth="3" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        ))}
        <line x1="0" y1="80" x2="0" y2="40" stroke={GOLD} strokeWidth="2" />
        <path d="M0 40 L36 48 L0 58 Z" fill={GOLD} className="art-flag" />
      </g>
    </>
  ),
  lotus: () => (
    <>
      <circle cx="570" cy="250" r="190" fill="url(#sun)" className="art-glow" />
      <Lotus x={570} y={320} scale={1.6} />
      <rect x="380" y="330" width="380" height="4" rx="2" fill={GOLD} opacity="0.5" />
    </>
  ),
}

/** `compact` crops to the scene's subject, for cards and portrait frames. */
export function FestivalArt({ theme = 'lotus', className = '', compact }: { theme?: ArtTheme | null; className?: string; compact?: boolean }) {
  const Scene = scenes[theme ?? 'lotus'] ?? scenes.lotus
  return (
    <svg viewBox={compact ? '340 20 460 400' : '0 0 800 420'} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c0a33" />
          <stop offset="0.6" stopColor="#3b1765" />
          <stop offset="1" stopColor="#5e2a94" />
        </linearGradient>
        <radialGradient id="sun">
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity="0.8" />
          <stop offset="0.5" stopColor={GOLD} stopOpacity="0.25" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff7e0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff7e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="420" fill="url(#sky)" />
      <Stars seed={theme?.length ?? 3} />
      <Scene />
    </svg>
  )
}

