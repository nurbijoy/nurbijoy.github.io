import { useId, useState, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LazyMount } from '@/components/ui/LazyMount'
import { SampleTag } from '@/components/ui/SampleTag'

export interface TableData {
  head: string[]
  rows: (string | number)[][]
}

interface Props {
  title: string
  subtitle?: ReactNode
  chart: ReactNode
  /** Every chart ships a table twin: the accessible, copy-pasteable equivalent. */
  table: TableData
  footer?: ReactNode
  className?: string
  /** Height of the chart body. Reserved up front so mounting it on scroll never shifts the page. */
  chartHeight: number
  /** Marks the card's data as placeholder content. */
  sample?: boolean
}

/**
 * Card chrome shared by all charts: title, chart ⇄ table switch, optional footnote.
 * The chart itself mounts lazily (on first view) and is wrapped in its own error boundary,
 * so one broken chart can never take the page down.
 */
export function ChartCard({ title, subtitle, chart, table, footer, className = '', chartHeight, sample }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const panelId = useId()

  return (
    <figure className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <figcaption className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-semibold tracking-tight [font-stretch:90%]">
            {title}
            {sample && <SampleTag />}
          </h3>
          {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
        </div>
        <div className="seg shrink-0" role="group" aria-label={`${title}: view`}>
          <button type="button" aria-pressed={view === 'chart'} aria-controls={panelId} onClick={() => setView('chart')}>
            Chart
          </button>
          <button type="button" aria-pressed={view === 'table'} aria-controls={panelId} onClick={() => setView('table')}>
            Table
          </button>
        </div>
      </figcaption>

      <div id={panelId} className="mt-5 flex-1">
        <div hidden={view !== 'chart'}>
          <ErrorBoundary label={title} variant="inline">
            <LazyMount minHeight={chartHeight}>{chart}</LazyMount>
          </ErrorBoundary>
        </div>
        {view === 'table' && (
          <div
            className="overflow-auto rounded-lg border border-line"
            style={{ maxHeight: Math.max(chartHeight, 320) }}
            tabIndex={0}
            role="region"
            aria-label={`${title}: data table`}
          >
            <table className="tbl">
              <thead>
                <tr>
                  {table.head.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {footer && <div className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">{footer}</div>}
    </figure>
  )
}
