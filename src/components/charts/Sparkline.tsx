import { C } from '@/lib/chartTheme'

interface Props {
  values: number[]
  width?: number
  height?: number
  label: string
}

/** 2px de-emphasis line; the current period is the single accent dot. */
export function Sparkline({ values, width = 132, height = 36, label }: Props) {
  const pad = 5
  const max = Math.max(...values, 1)
  const step = (width - pad * 2) / Math.max(values.length - 1, 1)
  const pts = values.map((v, i) => [pad + i * step, height - pad - (v / max) * (height - pad * 2)] as const)
  const last = pts[pts.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
      <polyline
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={C.ink3}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last && <circle cx={last[0]} cy={last[1]} r={4} fill={C.accent} stroke={C.surface} strokeWidth={2} />}
    </svg>
  )
}
