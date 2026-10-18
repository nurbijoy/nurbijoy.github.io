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
      boxes.push(spot.box)
      placed.push({ id: item.id, text: item.text, x: spot.cx, y: spot.cy })
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
