/**
 * Places district names on the map so they do not overlap. Works in map units, so the layout is
 * the same at every screen size; only the display scale changes.
 */

export interface LabelItem {
  id: string
  text: string
  /** Point inside the district the name is centred on, in map units. */
  x: number
  y: number
}

export interface PlacedLabel {
  id: string
  text: string
  /** Centre of the name, in map units. */
  x: number
  y: number
  /**
   * A line from the district's own point to the nearest edge of its name, when the name had to
   * move away from it. Null when the name sits on its district.
   */
  leader: { x1: number; y1: number; x2: number; y2: number } | null
}

export interface LabelLayout {
  /** Font size in map units. */
  size: number
  placed: PlacedLabel[]
  /** Ids of names that could not be placed at this size without overlapping another name. */
  hidden: string[]
}

/** Measures a name at a font size, in the same units as the map. */
export type Measure = (text: string, size: number) => number

export interface LeaderArrow {
  /** A gently curved line from the name to the district. */
  curve: string
  /** A filled arrowhead, its tip on the district. */
  head: string
}

/**
 * A curved connector from a moved name to its district, ending in an arrowhead on the district.
 * The bend is a small fraction of the length, so the line reads as a connector, not a pointer.
 * The head is `headLength` long in map units.
 */
export function leaderArrow(leader: NonNullable<PlacedLabel['leader']>, headLength: number): LeaderArrow {
  const sx = leader.x2
  const sy = leader.y2
  const ex = leader.x1
  const ey = leader.y1
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.hypot(dx, dy) || 1
  const bend = len * 0.18
  const cx = (sx + ex) / 2 - (dy / len) * bend
  const cy = (sy + ey) / 2 + (dx / len) * bend

  // The arrow points along the curve's direction at the district.
  const tx = ex - cx
  const ty = ey - cy
  const tl = Math.hypot(tx, ty) || 1
  const ux = tx / tl
  const uy = ty / tl
  const bx = ex - ux * headLength
  const by = ey - uy * headLength
  const half = headLength / 2
  const lx = bx - uy * half
  const ly = by + ux * half
  const rx = bx + uy * half
  const ry = by - ux * half

  const f = (n: number) => (Math.round(n * 100) / 100).toString()
  return {
    curve: `M${f(sx)} ${f(sy)} Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`,
    head: `M${f(ex)} ${f(ey)} L${f(lx)} ${f(ly)} L${f(rx)} ${f(ry)} Z`,
  }
}

export interface Bounds {
  width: number
  height: number
}

/** Font sizes to try, largest first. The largest size that fits every name wins. */
export const LABEL_SIZES = [18, 17, 16, 15, 14, 13, 12]

const GAP = 1
/** Name box height as a multiple of the font size. */
const LINE = 1.3
/** How far from the centre a name may move, in map units, nearest first. */
const RADII = [0, 8, 16, 26, 38]
const DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
  [0.7071, -0.7071],
  [-0.7071, -0.7071],
  [0.7071, 0.7071],
  [-0.7071, 0.7071],
]

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP

/** Lays out every name at one font size, widest names first. */
export function layoutLabels(items: readonly LabelItem[], measure: Measure, size: number, bounds: Bounds): LabelLayout {
  const h = size * LINE
  const sized = items.map((item) => ({ item, w: measure(item.text, size) + 2 }))
  sized.sort((a, b) => b.w - a.w)

  const placed: PlacedLabel[] = []
  const boxes: Box[] = []
  const hidden: string[] = []
  const inside = (b: Box) => b.x >= 0 && b.y >= 0 && b.x + b.w <= bounds.width && b.y + b.h <= bounds.height

  for (const { item, w } of sized) {
    let spot: { cx: number; cy: number; box: Box } | null = null
    search: for (const r of RADII) {
      for (const [dx, dy] of r === 0 ? [[0, 0] as const] : DIRECTIONS) {
        const cx = item.x + dx * r + Math.sign(dx) * (w / 2)
        const cy = item.y + dy * r + Math.sign(dy) * (h / 2)
        const box = { x: cx - w / 2, y: cy - h / 2, w, h }
        if (!inside(box)) continue
        if (boxes.some((o) => overlaps(box, o))) continue
        spot = { cx, cy, box }
        break search
      }
    }
    if (spot) {
      const { box } = spot
      boxes.push(box)
      const onDistrict = item.x >= box.x && item.x <= box.x + box.w && item.y >= box.y && item.y <= box.y + box.h
      const leader = onDistrict
        ? null
        : {
            x1: item.x,
            y1: item.y,
            x2: Math.min(Math.max(item.x, box.x), box.x + box.w),
            y2: Math.min(Math.max(item.y, box.y), box.y + box.h),
          }
      placed.push({ id: item.id, text: item.text, x: spot.cx, y: spot.cy, leader })
    } else {
      hidden.push(item.id)
    }
  }
  return { size, placed, hidden }
}

/**
 * The largest font size at which every name fits. If none fits, the size that hides the fewest
 * names is used, so the rest still show.
 */
export function bestLabelLayout(
  items: readonly LabelItem[],
  measure: Measure,
  bounds: Bounds,
  sizes: readonly number[] = LABEL_SIZES,
): LabelLayout {
  let best: LabelLayout | null = null
  for (const size of sizes) {
    const layout = layoutLabels(items, measure, size, bounds)
    if (layout.hidden.length === 0) return layout
    if (!best || layout.hidden.length < best.hidden.length) best = layout
  }
  return best ?? { size: sizes[0] ?? 0, placed: [], hidden: items.map((i) => i.id) }
}
