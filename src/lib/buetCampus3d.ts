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
