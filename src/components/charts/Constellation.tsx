import { useEffect, useReducer, useRef, useState } from 'react'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { useReducedMotion } from 'motion/react'
import { graphLinks, graphNodes, type GraphNode, type NodeKind } from '@/data/research'
import { C, KIND_COLOR, KIND_LABEL } from '@/lib/chartTheme'
import type { TableData } from './ChartCard'

interface SimNode extends SimulationNodeDatum, GraphNode {
  degree: number
  r: number
  /** Resting position in virtual space; physics pulls each node back to it. */
  tx: number
  ty: number
  /** Resting angle, used to decide which side of the node its label sits on. */
  angle: number
}
type SimLink = SimulationLinkDatum<SimNode>

/* Physics runs in a fixed 1000×1000 "virtual" space and is projected to the real SVG
   size on render, so nodes and labels keep a constant, readable pixel size. */
const V = 1000
const TAU = Math.PI * 2
const RING: Record<NodeKind, number> = { research: 140, concept: 285, skill: 430 }
const REACH = 445
const KINDS: NodeKind[] = ['research', 'concept', 'skill']

const adjacency = new Map<string, Set<string>>()
for (const [a, b] of graphLinks) {
  if (!adjacency.has(a)) adjacency.set(a, new Set())
  if (!adjacency.has(b)) adjacency.set(b, new Set())
  adjacency.get(a)!.add(b)
  adjacency.get(b)!.add(a)
}
const labelOf = new Map(graphNodes.map((n) => [n.id, n.label]))

export const constellationTable: TableData = {
  head: ['Node', 'Type', 'Connected to'],
  rows: graphNodes.map((n) => [
    n.label,
    KIND_LABEL[n.kind],
    [...(adjacency.get(n.id) ?? [])].map((id) => labelOf.get(id)).join(', '),
  ]),
}

/* Deterministic layout: research directions sit on a compass at the centre; each outer
   ring is ordered by the mean angle of its already-placed neighbours (the barycentre
   heuristic) and then spaced evenly. That keeps edges short and labels from colliding. */
const restAngle = (() => {
  const angle = new Map<string, number>()
  const ofKind = (k: NodeKind) => graphNodes.filter((n) => n.kind === k)

  const research = ofKind('research')
  research.forEach((n, i) => angle.set(n.id, -Math.PI / 2 + (i / research.length) * TAU))

  const place = (kind: NodeKind) => {
    const ring = ofKind(kind)
    const keyed = ring.map((n) => {
      const seen = [...(adjacency.get(n.id) ?? [])].map((id) => angle.get(id)).filter((a): a is number => a !== undefined)
      const sin = seen.reduce((s, a) => s + Math.sin(a), 0)
      const cos = seen.reduce((s, a) => s + Math.cos(a), 0)
      return { n, mean: seen.length ? Math.atan2(sin, cos) : 0 }
    })
    keyed.sort((p, q) => p.mean - q.mean)
    const start = keyed[0]?.mean ?? 0
    keyed.forEach(({ n }, i) => angle.set(n.id, start + (i / ring.length) * TAU))
  }
  place('concept')
  place('skill')
  return angle
})()

/** Greedy word-wrap so long labels stack into short lines instead of running wide. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

interface LabelSpec {
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  lines: string[]
}

/** Outer-ring labels go outward from the centre; inner rings sit beneath their node. */
function labelFor(n: SimNode, fontSize: number, narrow: boolean): LabelSpec {
  const lineH = fontSize + 2
  if (n.kind === 'research') return { x: 0, y: n.r + 17, anchor: 'middle', lines: wrap(narrow ? (n.short ?? n.label) : n.label, 14) }

  const lines = wrap(n.label, 12)
  if (n.kind === 'concept') return { x: 0, y: n.r + 15, anchor: 'middle', lines }

  const ca = Math.cos(n.angle)
  const sa = Math.sin(n.angle)
  // On narrow screens only the focused neighbourhood is labelled, so keep those labels
  // centred above/below the node instead of running sideways off the edge.
  if (narrow) return { x: 0, y: sa > 0 ? n.r + 16 : -(n.r + 9) - (lines.length - 1) * lineH, anchor: 'middle', lines }
  // side labels are centred vertically on the node, whatever the line count
  const midY = 4 - ((lines.length - 1) * lineH) / 2
  if (ca > 0.35) return { x: n.r + 9, y: midY, anchor: 'start', lines }
  if (ca < -0.35) return { x: -(n.r + 9), y: midY, anchor: 'end', lines }
  // top labels grow upward, bottom labels grow downward
  return {
    x: 0,
    y: sa > 0 ? n.r + 16 : -(n.r + 9) - (lines.length - 1) * lineH,
    anchor: 'middle',
    lines,
  }
}

export function Constellation() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])
  const dragging = useRef<string | null>(null)
  const [, redraw] = useReducer((n: number) => n + 1, 0)
  const [size, setSize] = useState({ w: 640, h: 540 })
  const [focus, setFocus] = useState<string | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry?.contentRect.width ?? 0)
      if (w < 10) return
      const h = Math.round(Math.min(620, Math.max(440, w < 560 ? w * 1.3 : w * 0.9)))
      setSize((prev) => (Math.abs(prev.w - w) < 4 && prev.h === h ? prev : { w, h }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const nodes: SimNode[] = graphNodes.map((n, i) => {
      const angle = restAngle.get(n.id) ?? 0
      const degree = adjacency.get(n.id)?.size ?? 0
      return {
        ...n,
        degree,
        angle,
        r: n.kind === 'research' ? 10 : 5 + Math.min(degree * 0.7, 3.5),
        tx: V / 2 + Math.cos(angle) * RING[n.kind],
        ty: V / 2 + Math.sin(angle) * RING[n.kind],
        // start bunched at the centre so the graph unfolds into place
        x: V / 2 + Math.cos(i * 2.4) * 30,
        y: V / 2 + Math.sin(i * 2.4) * 30,
      }
    })
    const links: SimLink[] = graphLinks.map(([source, target]) => ({ source, target }))

    const sim = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(120).strength(0.015))
      .force('charge', forceManyBody<SimNode>().strength(-45))
      .force('collide', forceCollide<SimNode>().radius((d) => d.r * 2 + 10))
      .force('x', forceX<SimNode>((d) => d.tx).strength(0.12))
      .force('y', forceY<SimNode>((d) => d.ty).strength(0.12))
      .alphaDecay(0.022)

    nodesRef.current = nodes
    linksRef.current = links
    simRef.current = sim

    if (reduce) {
      sim.stop()
      sim.tick(320)
      redraw()
    } else {
      sim.on('tick', redraw)
    }
    return () => {
      sim.stop()
    }
  }, [reduce])

  const { w, h } = size
  const narrow = w < 560
  const padX = narrow ? 36 : 98
  const padY = 50
  const sx = Math.max((w / 2 - padX) / REACH, 0.05)
  const sy = Math.max((h / 2 - padY) / REACH, 0.05)
  const px = (x = V / 2) => w / 2 + (x - V / 2) * sx
  const py = (y = V / 2) => h / 2 + (y - V / 2) * sy

  const near = focus ? new Set([focus, ...(adjacency.get(focus) ?? [])]) : null
  const focusNode = focus ? nodesRef.current.find((n) => n.id === focus) : undefined

  const toVirtual = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: V / 2 + (e.clientX - r.left - w / 2) / sx, y: V / 2 + (e.clientY - r.top - h / 2) / sy }
  }

  return (
    <div>
      {/* The SVG is absolutely positioned so it never sizes its own container: the wrapper's
          width comes from the layout, the ResizeObserver reads it, and the SVG follows. */}
      <div ref={wrapRef} className="relative w-full min-w-0" style={{ height: h }}>
        <svg
          ref={svgRef}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label="Network of research directions, concepts and skills. A table view with the same data is available."
          className="absolute top-0 left-0 block touch-pan-y select-none"
        >
          {/* concentric guides */}
          {KINDS.map((k) => (
            <ellipse key={k} cx={w / 2} cy={h / 2} rx={RING[k] * sx} ry={RING[k] * sy} fill="none" stroke={C.grid} strokeWidth={1} />
          ))}

          {linksRef.current.map((l, i) => {
            const s = l.source as SimNode
            const t = l.target as SimNode
            const on = !near || s.id === focus || t.id === focus
            return (
              <line
                key={i}
                x1={px(s.x)}
                y1={py(s.y)}
                x2={px(t.x)}
                y2={py(t.y)}
                stroke={near && on ? C.ink3 : C.axis}
                strokeWidth={near && on ? 1.5 : 1}
                opacity={near ? (on ? 1 : 0.12) : 0.85}
              />
            )
          })}

          {nodesRef.current.map((n) => {
            const dim = near ? !near.has(n.id) : false
            const size = narrow ? 11 : 12
            const label = labelFor(n, size, narrow)
            // Narrow: research directions stay labelled; everything else on tap / focus.
            const showLabel = !narrow || n.kind === 'research' || (near?.has(n.id) ?? false)
            return (
              <g
                key={n.id}
                transform={`translate(${px(n.x)} ${py(n.y)})`}
                tabIndex={0}
                aria-label={`${n.label}, ${KIND_LABEL[n.kind]}, ${n.degree} connections`}
                opacity={dim ? 0.2 : 1}
                style={{ cursor: 'grab', touchAction: 'none', transition: 'opacity .25s' }}
                onPointerEnter={() => setFocus(n.id)}
                onPointerLeave={() => dragging.current !== n.id && setFocus(null)}
                onFocus={() => setFocus(n.id)}
                onBlur={() => setFocus(null)}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  dragging.current = n.id
                  setFocus(n.id)
                  const p = toVirtual(e)
                  n.fx = p.x
                  n.fy = p.y
                  simRef.current?.alphaTarget(0.3).restart()
                }}
                onPointerMove={(e) => {
                  if (dragging.current !== n.id) return
                  const p = toVirtual(e)
                  n.fx = p.x
                  n.fy = p.y
                }}
                onPointerUp={() => {
                  dragging.current = null
                  n.fx = null
                  n.fy = null
                  simRef.current?.alphaTarget(0)
                }}
              >
                {n.kind === 'research' && <circle r={n.r + 6} fill="none" stroke={KIND_COLOR[n.kind]} strokeWidth={1} opacity={0.4} />}
                {/* generous invisible hit target */}
                <circle r={Math.max(n.r + 10, 18)} fill="transparent" />
                <circle r={n.r} fill={KIND_COLOR[n.kind]} stroke={C.surface} strokeWidth={2} />
                {showLabel && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.anchor}
                    fill={n.kind === 'research' ? C.ink : C.ink2}
                    fontSize={size}
                    fontWeight={n.kind === 'research' ? 650 : 500}
                    paintOrder="stroke"
                    stroke={C.surface}
                    strokeWidth={4}
                    strokeLinejoin="round"
                    pointerEvents="none"
                  >
                    {label.lines.map((line, i) => (
                      <tspan key={i} x={label.x} dy={i === 0 ? 0 : size + 2}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legend">
        {KINDS.map((k) => (
          <span key={k} className="flex items-center gap-2 text-xs text-ink-2">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {KIND_LABEL[k]}
          </span>
        ))}
      </div>

      <p className="mt-3 min-h-10 text-sm text-ink-2" aria-live="polite">
        {focusNode ? (
          <>
            <strong className="font-semibold text-ink">{focusNode.label}</strong>
            <span className="text-ink-3">
              {' '}
              · {KIND_LABEL[focusNode.kind]} · {focusNode.degree} connections:{' '}
            </span>
            {[...(adjacency.get(focusNode.id) ?? [])].map((id) => labelOf.get(id)).join(', ')}
          </>
        ) : (
          <span className="text-ink-3">
            {narrow ? 'Tap' : 'Hover'} a node to trace its connections. Drag one and let go; it springs back.
          </span>
        )}
      </p>
    </div>
  )
}
