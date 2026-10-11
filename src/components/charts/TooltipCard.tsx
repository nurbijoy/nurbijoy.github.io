import type { ReactNode } from 'react'

interface Row {
  /** Series colour, drawn as a short line key (never a filled box). */
  color?: string
  name: ReactNode
  value: ReactNode
}

/** Shared tooltip body. Values lead (strong), labels follow — the legend's hierarchy inverted. */
export function TooltipCard({ title, rows }: { title?: ReactNode; rows: Row[] }) {
  return (
    <div className="tt">
      {title && <p className="mb-1.5 text-xs text-ink-3">{title}</p>}
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          {r.color && <span aria-hidden className="h-0.5 w-3.5 shrink-0 rounded-full" style={{ background: r.color }} />}
          <strong className="tabular-nums">{r.value}</strong>
          <span>{r.name}</span>
        </div>
      ))}
    </div>
  )
}
