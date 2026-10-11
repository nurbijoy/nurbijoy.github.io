import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'motion/react'
import { C, tickStyle } from '@/lib/chartTheme'
import { TooltipCard } from './TooltipCard'

export interface HBarItem {
  name: string
  value: number
  /** Text drawn at the bar tip. */
  label: string
  /** Extra tooltip line, e.g. the domain. */
  note?: string
}

interface Props {
  items: HBarItem[]
  max: number
  ticks: number[]
  yWidth?: number
  rowHeight?: number
  ariaLabel: string
  /** Name shown beside the value in the tooltip. */
  seriesName: string
}

/**
 * One series → one colour. Bars are capped at 14px with a 4px rounded data end and a
 * square baseline; the value is labelled at the tip and repeated in the tooltip.
 */
export function HBars({ items, max, ticks, yWidth = 140, rowHeight = 34, ariaLabel, seriesName }: Props) {
  const reduce = useReducedMotion()
  const height = items.length * rowHeight + 34

  return (
    <div role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 2, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={C.grid} />
          <XAxis
            type="number"
            domain={[0, max]}
            ticks={ticks}
            tickLine={false}
            axisLine={{ stroke: C.axis }}
            tick={tickStyle}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={yWidth}
            interval={0}
            tickLine={false}
            axisLine={{ stroke: C.axis }}
            tick={{ fill: C.ink2, fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)', opacity: 0.7 }}
            content={(p) => {
              const item = p.payload?.[0]?.payload as HBarItem | undefined
              if (!p.active || !item) return null
              return (
                <TooltipCard
                  title={item.name}
                  rows={[
                    { color: C.accent, value: item.label, name: seriesName },
                    ...(item.note ? [{ name: item.note, value: '' }] : []),
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="value" fill={C.accent} barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={!reduce}>
            <LabelList dataKey="label" position="right" fill={C.ink2} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
