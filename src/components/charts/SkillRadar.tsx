import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useReducedMotion } from 'motion/react'
import { C } from '@/lib/chartTheme'
import { TooltipCard } from './TooltipCard'

export interface RadarDatum {
  domain: string
  /** Number of advanced skills in the domain. */
  value: number
  expert: number
}

interface Props {
  data: RadarDatum[]
  selected: string
  onSelect: (domain: string) => void
}

interface TickProps {
  x: number
  y: number
  payload: { value: string }
  textAnchor: 'start' | 'middle' | 'end'
}

/** Depth overview. Click an axis label to scope the bar chart beside it. */
export function SkillRadar({ data, selected, onSelect }: Props) {
  const reduce = useReducedMotion()
  const max = Math.max(...data.map((d) => d.value), 1)

  const renderTick = ({ x, y, payload, textAnchor }: TickProps) => {
    const on = payload.value === selected
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={on ? C.ink : C.ink2}
        fontSize={13}
        fontWeight={on ? 700 : 500}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect(on ? 'All' : payload.value)}
      >
        {payload.value}
      </text>
    )
  }

  return (
    <div
      role="img"
      aria-label="Radar chart of the number of advanced technologies in each domain"
      className="h-[22rem]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%" margin={{ top: 14, right: 44, bottom: 14, left: 44 }}>
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="domain" tick={renderTick as never} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, max]}
            tickCount={max + 1}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: C.ink3, fontSize: 10 }}
          />
          <Tooltip
            content={(p) => {
              const d = p.payload?.[0]?.payload as RadarDatum | undefined
              if (!p.active || !d) return null
              return (
                <TooltipCard
                  title={d.domain}
                  rows={[
                    { color: C.accent, value: d.value, name: d.value === 1 ? 'advanced technology' : 'advanced technologies' },
                    ...(d.expert ? [{ name: 'at expert level', value: d.expert }] : []),
                  ]}
                />
              )
            }}
          />
          <Radar
            dataKey="value"
            stroke={C.accent}
            strokeWidth={2}
            fill={C.accent}
            fillOpacity={0.12}
            dot={{ r: 4, fill: C.accent, stroke: C.surface, strokeWidth: 2 }}
            activeDot={{ r: 5.5, fill: C.accent, stroke: C.surface, strokeWidth: 2 }}
            isAnimationActive={!reduce}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
