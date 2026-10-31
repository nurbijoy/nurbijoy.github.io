import type { CampusCoordinate } from '@/data/buetCampus'

export type GroundPoint = readonly [x: number, z: number]
const ORIGIN: CampusCoordinate = [90.3913, 23.7263]
const METRES_PER_DEGREE = Math.PI * 6_371_000 / 180

/** Campus-sized local tangent plane. One world unit is one metre; negative Z is north. */
export function campusWorldPoint([longitude, latitude]: CampusCoordinate): [number, number] {
  return [(longitude - ORIGIN[0]) * METRES_PER_DEGREE * Math.cos(ORIGIN[1] * Math.PI / 180),
    (ORIGIN[1] - latitude) * METRES_PER_DEGREE]
}

export function pointInCampusRing([x, z]: GroundPoint, ring: readonly GroundPoint[]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i]
    const [xj, zj] = ring[j]
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

export function pointInCampusBuilding(point: GroundPoint, exterior: readonly GroundPoint[], holes: readonly (readonly GroundPoint[])[] = []): boolean {
  return pointInCampusRing(point, exterior) && !holes.some((hole) => pointInCampusRing(point, hole))
}

export function campusSeed(text: string): number {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619)
  return value >>> 0
}

export function campusRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function campusRingBounds(points: readonly GroundPoint[]) {
  return { minX: Math.min(...points.map((point) => point[0])), maxX: Math.max(...points.map((point) => point[0])),
    minZ: Math.min(...points.map((point) => point[1])), maxZ: Math.max(...points.map((point) => point[1])) }
}

export function distanceToCampusSegment(point: GroundPoint, a: GroundPoint, b: GroundPoint): number {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const lengthSquared = dx * dx + dz * dz
  const t = lengthSquared ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dz) / lengthSquared)) : 0
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dz)
}

/** Yaw for a camera whose forward vector is (-sin yaw, 0, -cos yaw), turned to face a ground target. */
export function campusFacingYaw([fromX, fromZ]: GroundPoint, [toX, toZ]: GroundPoint): number {
  return Math.atan2(fromX - toX, fromZ - toZ)
}

export interface CampusHeightField {
  minX: number
  minZ: number
  cell: number
  columns: number
  rows: number
  heights: Float32Array
  /** Index of the tallest footprint covering each cell, or -1 for open ground. */
  owners: Int32Array
}

interface HeightFieldBuilding { points: readonly GroundPoint[]; holes?: readonly (readonly GroundPoint[])[]; height: number }

/** Rasterise extruded footprints into a coarse top-down grid, so sight lines can be tested without raycasting meshes. */
export function createCampusHeightField(buildings: readonly HeightFieldBuilding[], cell = 4): CampusHeightField {
  const bounds = campusRingBounds(buildings.flatMap((building) => building.points))
  const minX = bounds.minX - cell, minZ = bounds.minZ - cell
  const columns = Math.max(1, Math.ceil((bounds.maxX - minX) / cell) + 2)
  const rows = Math.max(1, Math.ceil((bounds.maxZ - minZ) / cell) + 2)
  const heights = new Float32Array(columns * rows)
  const owners = new Int32Array(columns * rows).fill(-1)
  buildings.forEach((building, index) => {
    const box = campusRingBounds(building.points)
    for (let row = Math.max(0, Math.floor((box.minZ - minZ) / cell)); row <= Math.min(rows - 1, Math.floor((box.maxZ - minZ) / cell)); row++) {
      for (let column = Math.max(0, Math.floor((box.minX - minX) / cell)); column <= Math.min(columns - 1, Math.floor((box.maxX - minX) / cell)); column++) {
        const cellIndex = row * columns + column
        if (building.height <= heights[cellIndex]) continue
        if (pointInCampusBuilding([minX + (column + .5) * cell, minZ + (row + .5) * cell], building.points, building.holes)) {
          heights[cellIndex] = building.height; owners[cellIndex] = index
        }
      }
    }
  })
  return { minX, minZ, cell, columns, rows, heights, owners }
}

/** True when a straight sight line passes through a mapped footprint taller than the line at that point. */
export function campusSightBlocked(field: CampusHeightField, from: readonly [number, number, number], to: readonly [number, number, number], ignore?: (owner: number) => boolean): boolean {
  const dx = to[0] - from[0], dz = to[2] - from[2]
  const length = Math.hypot(dx, dz)
  const step = field.cell / 2
  // Skip the endpoints: the viewer may stand beside a wall and the target sits on its own roof.
  for (let distance = step; distance < length - field.cell; distance += step) {
    const t = distance / length
    const column = Math.floor((from[0] + dx * t - field.minX) / field.cell)
    const row = Math.floor((from[2] + dz * t - field.minZ) / field.cell)
    if (column < 0 || row < 0 || column >= field.columns || row >= field.rows) continue
    const index = row * field.columns + column
    const owner = field.owners[index]
    if (owner >= 0 && field.heights[index] > from[1] + (to[1] - from[1]) * t && !ignore?.(owner)) return true
  }
  return false
}

export interface CampusLabelBox { x: number; y: number; w: number; h: number }
export interface CampusLabelCandidate {
  id: string
  /** Preferred boxes in order, usually the full label to the right and then to the left of its anchor. */
  options: readonly CampusLabelBox[]
  /** A compact marker that is always shown inside the stage; full labels of other places steer around it. */
  fallback?: CampusLabelBox
  /** Selected or hovered places are always shown. */
  pinned?: boolean
  priority?: number
  distance?: number
}
/** `option` is the index into `options`, or -1 for the fallback marker. */
export interface CampusLabelPlacement { option: number; box: CampusLabelBox }

const boxesOverlap = (a: CampusLabelBox, b: CampusLabelBox, gap: number) =>
  a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y

/**
 * Greedy collision-free label layout. Every place keeps its compact marker (unless it falls outside the stage
 * or under a reserved control); full labels are then added in priority order wherever they clear the markers,
 * the reserved areas and each other.
 */
export function placeCampusLabels(candidates: readonly CampusLabelCandidate[], bounds: { width: number; height: number }, reserved: readonly CampusLabelBox[] = [], gap = 4, margin = 6): Map<string, CampusLabelPlacement> {
  const placements = new Map<string, CampusLabelPlacement>()
  const inside = (box: CampusLabelBox) => box.x >= margin && box.y >= margin && box.x + box.w <= bounds.width - margin && box.y + box.h <= bounds.height - margin
  const markers = new Map<string, CampusLabelBox>()
  for (const candidate of candidates) {
    const marker = candidate.fallback
    if (marker && inside(marker) && !reserved.some((other) => boxesOverlap(marker, other, 0))) markers.set(candidate.id, marker)
  }
  const labels: CampusLabelBox[] = []
  const free = (id: string, box: CampusLabelBox) => inside(box) && !reserved.some((other) => boxesOverlap(box, other, gap))
    && !labels.some((other) => boxesOverlap(box, other, gap))
    && ![...markers].some(([other, marker]) => other !== id && boxesOverlap(box, marker, gap))
  const ordered = [...candidates].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)
    || (b.priority ?? 0) - (a.priority ?? 0) || (a.distance ?? 0) - (b.distance ?? 0))
  for (const candidate of ordered) {
    let option = candidate.options.findIndex((box) => free(candidate.id, box))
    if (option < 0 && candidate.pinned) option = candidate.options.findIndex(inside)
    if (option >= 0) {
      const box = candidate.options[option]
      labels.push(box); placements.set(candidate.id, { option, box })
    } else if (markers.has(candidate.id)) placements.set(candidate.id, { option: -1, box: markers.get(candidate.id)! })
    else if (candidate.pinned && candidate.options.length) placements.set(candidate.id, { option: 0, box: candidate.options[0] })
  }
  return placements
}
