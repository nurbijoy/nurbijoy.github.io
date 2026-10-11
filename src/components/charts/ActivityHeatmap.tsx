import { useEffect, useRef, useState } from 'react'
import { HEAT } from '@/lib/chartTheme'
import { formatDay, type Heat, type HeatCell } from '@/lib/github'
import { plural } from '@/lib/format'

const LEFT = 34
const TOP = 24
const GAP = 3

/**
 * Calendar heatmap: one hue, light → dark (flipped in dark mode so "none" recedes).
 * Cell size is derived from the card width so labels stay a constant, readable size.
 */
export function ActivityHeatmap({ heat }: { heat: Heat }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(560)
  const [hover, setHover] = useState<HeatCell | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 560)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cell = Math.max(12, Math.min(34, Math.floor((width - LEFT - GAP * (heat.weeks - 1)) / heat.weeks)))
  const W = LEFT + heat.weeks * (cell + GAP) - GAP
  const H = TOP + 7 * (cell + GAP) - GAP
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / Math.max(heat.max, 1)) * 4)))
  const x = (col: number) => LEFT + col * (cell + GAP)
  const y = (row: number) => TOP + row * (cell + GAP)

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Public GitHub activity over the last ${heat.weeks} weeks: ${plural(heat.total, 'event')} on ${plural(heat.activeDays, 'day')}.`}
        className="block max-w-full"
      >
        {heat.months.map((m) => (
          <text key={`${m.col}-${m.label}`} x={x(m.col)} y={12} fontSize={11} fill="var(--ink-3)" fontFamily="var(--font-mono)">
            {m.label}
          </text>
        ))}
        {[1, 3, 5].map((row) => (
          <text key={row} x={0} y={y(row) + cell / 2 + 4} fontSize={11} fill="var(--ink-3)" fontFamily="var(--font-mono)">
            {['', 'Mon', '', 'Wed', '', 'Fri'][row]}
          </text>
        ))}

        {heat.cells.map((c) =>
          c.future ? null : (
            <rect
              key={c.key}
              x={x(c.col)}
              y={y(c.row)}
              width={cell}
              height={cell}
              rx={Math.min(5, cell / 4)}
              fill={HEAT[level(c.count)]}
              stroke={hover?.key === c.key ? 'var(--ink)' : 'none'}
              strokeWidth={1.5}
              onPointerEnter={() => setHover(c)}
              onPointerLeave={() => setHover(null)}
              onPointerDown={() => setHover(c)}
            />
          ),
        )}
      </svg>

      {hover && (
        <div
          className="tt absolute z-10 whitespace-nowrap"
          style={{ left: x(hover.col) + cell / 2, top: y(hover.row), transform: 'translate(-50%, calc(-100% - 8px))' }}
        >
          <strong>{plural(hover.count, 'event')}</strong>
          <span className="ml-2 text-ink-3">{formatDay(hover.date)}</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-ink-3">
        <span>{plural(heat.activeDays, 'active day')} · busiest day {plural(heat.max, 'event')}</span>
        <span className="flex items-center gap-1.5" aria-hidden>
          Less
          {HEAT.map((c, i) => (
            <span key={i} className="size-3 rounded-[4px]" style={{ background: c }} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
