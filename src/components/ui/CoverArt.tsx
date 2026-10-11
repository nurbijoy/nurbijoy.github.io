import { useId } from 'react'

/** Small deterministic PRNG so the same seed always paints the same cover. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const W = 400
const H = 220
const COLORS = ['var(--accent)', 'var(--c2)', 'var(--c3)'] as const

/** Generative, asset-free artwork for a project card. Four patterns, picked by seed. */
export function CoverArt({ seed }: { seed: string }) {
  const uid = useId().replace(/:/g, '')
  const h = hash(seed)
  const rnd = mulberry32(h)
  const pattern = h % 4
  const main = COLORS[h % 3]!
  const alt = COLORS[(h + 1) % 3]!

  let art: React.ReactNode
  if (pattern === 0) {
    // Concentric rings off-centre
    const cx = 90 + rnd() * 220
    const cy = 50 + rnd() * 120
    art = Array.from({ length: 11 }, (_, i) => (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={14 + i * 17}
        fill="none"
        stroke={i % 3 === 0 ? alt : main}
        strokeWidth={i % 3 === 0 ? 2 : 1}
        opacity={0.75 - i * 0.055}
      />
    ))
  } else if (pattern === 1) {
    // Dot field that swells toward a focal point
    const fx = rnd() * W
    const fy = rnd() * H
    const dots: React.ReactNode[] = []
    for (let x = 14; x < W; x += 20) {
      for (let y = 14; y < H; y += 20) {
        const d = Math.hypot(x - fx, y - fy)
        const r = Math.max(0.8, 6.5 - d / 38)
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={d < 90 ? main : alt} opacity={0.25 + Math.max(0, 1 - d / 220) * 0.7} />)
      }
    }
    art = dots
  } else if (pattern === 2) {
    // Layered sine waves
    const waves = Array.from({ length: 7 }, (_, i) => {
      const amp = 10 + rnd() * 26
      const freq = 0.012 + rnd() * 0.02
      const phase = rnd() * Math.PI * 2
      const base = 30 + i * 26
      let d = `M0 ${base}`
      for (let x = 0; x <= W; x += 8) d += ` L${x} ${(base + Math.sin(x * freq + phase) * amp).toFixed(1)}`
      return <path key={i} d={d} fill="none" stroke={i % 2 ? alt : main} strokeWidth={1.5} opacity={0.35 + i * 0.09} />
    })
    art = waves
  } else {
    // Pixel mosaic
    const cells: React.ReactNode[] = []
    const s = 22
    for (let x = 0; x < W; x += s) {
      for (let y = 0; y < H; y += s) {
        const v = rnd()
        if (v > 0.55) cells.push(<rect key={`${x}-${y}`} x={x + 2} y={y + 2} width={s - 4} height={s - 4} rx={5} fill={v > 0.88 ? alt : main} opacity={0.12 + v * 0.55} />)
      }
    }
    art = cells
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--surface-2)" />
          <stop offset="1" stopColor="var(--bg-raised)" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx={0.2 + rnd() * 0.6} cy={0.2 + rnd() * 0.5} r="0.8">
          <stop offset="0" stopColor={main} stopOpacity="0.28" />
          <stop offset="1" stopColor={main} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-bg)`} />
      <rect width={W} height={H} fill={`url(#${uid}-glow)`} />
      {art}
    </svg>
  )
}
