import { useId } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'motion/react'
import { C, tickStyle } from '@/lib/chartTheme'
import { plural } from '@/lib/format'
import type { Heat } from '@/lib/github'
import { TooltipCard } from './TooltipCard'

const axisLine = { stroke: C.axis }

/** Single series → single colour, a 10% wash under a 2px line, crosshair snaps to the week. */
export function WeeklyArea({ heat }: { heat: Heat }) {
  const reduce = useReducedMotion()
  const gid = useId().replace(/:/g, '')
  return (
    <div role="img" aria-label="Area chart of public GitHub events per week" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={heat.weekly} margin={{ top: 10, right: 26, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.accent} stopOpacity={0.2} />
              <stop offset="1" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={axisLine} tick={tickStyle} interval="preserveStartEnd" minTickGap={28} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={tickStyle} width={44} />
          <Tooltip
            cursor={{ stroke: C.axis, strokeWidth: 1 }}
            content={(p) => {
              const d = p.payload?.[0]?.payload as Heat['weekly'][number] | undefined
              if (!p.active || !d) return null
              return <TooltipCard title={`Week of ${d.label}`} rows={[{ color: C.accent, value: d.count, name: d.count === 1 ? 'event' : 'events' }]} />
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={C.accent}
            strokeWidth={2}
            strokeLinecap="round"
            fill={`url(#${gid})`}
            dot={false}
            activeDot={{ r: 5, fill: C.accent, stroke: C.surface, strokeWidth: 2 }}
            isAnimationActive={!reduce}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Emphasis form: the busiest weekday wears the accent, the rest recede to neutral. */
export function WeekdayColumns({ heat }: { heat: Heat }) {
  const reduce = useReducedMotion()
  const top = heat.weekday[heat.busiestWeekday]
  return (
    <div
      role="img"
      aria-label={`Column chart of events by weekday. Busiest day: ${top?.label ?? 'none'}.`}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={heat.weekday} margin={{ top: 10, right: 8, bottom: 0, left: -14 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={axisLine} tick={tickStyle} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={tickStyle} width={44} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)', opacity: 0.7 }}
            content={(p) => {
              const d = p.payload?.[0]?.payload as Heat['weekday'][number] | undefined
              if (!p.active || !d) return null
              return <TooltipCard title={d.label} rows={[{ color: C.accent, value: d.count, name: plural(d.count, 'event').replace(/^\d+ /, '') }]} />
            }}
          />
          <Bar dataKey="count" barSize={22} radius={[4, 4, 0, 0]} isAnimationActive={!reduce}>
            {heat.weekday.map((d, i) => (
              <Cell key={d.label} fill={i === heat.busiestWeekday && d.count > 0 ? C.accent : C.ink3} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
