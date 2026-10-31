import { describe, expect, it } from 'vitest'
import { campusFacingYaw, campusRandom, campusSeed, campusSightBlocked, campusWorldPoint, createCampusHeightField, distanceToCampusSegment, placeCampusLabels, pointInCampusBuilding, pointInCampusRing, type CampusLabelBox } from './buetCampus3d'

describe('campus 3D geography and walking collision', () => {
  const exterior = [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]] as const
  const courtyard = [[5, 5], [15, 5], [15, 15], [5, 15], [5, 5]] as const

  it('uses metre-scale world coordinates with north on negative Z', () => {
    expect(campusWorldPoint([90.3913, 23.7263])).toEqual([0, 0])
    const [east] = campusWorldPoint([90.3923, 23.7263])
    const [, north] = campusWorldPoint([90.3913, 23.7273])
    expect(east).toBeGreaterThan(100)
    expect(east).toBeLessThan(103)
    expect(north).toBeCloseTo(-111.195, 2)
  })

  it('blocks building walls while leaving real courtyard holes walkable', () => {
    expect(pointInCampusRing([2, 2], exterior)).toBe(true)
    expect(pointInCampusBuilding([2, 2], exterior, [courtyard])).toBe(true)
    expect(pointInCampusBuilding([10, 10], exterior, [courtyard])).toBe(false)
    expect(pointInCampusBuilding([30, 10], exterior, [courtyard])).toBe(false)
  })

  it('measures distance to a finite road segment, including its end caps', () => {
    expect(distanceToCampusSegment([5, 3], [0, 0], [10, 0])).toBe(3)
    expect(distanceToCampusSegment([13, 4], [0, 0], [10, 0])).toBe(5)
    expect(distanceToCampusSegment([3, 4], [0, 0], [0, 0])).toBe(5)
  })

  it('rebuilds the same landscaping deterministically without changing random state elsewhere', () => {
    const a = campusRandom(campusSeed('campus-garden'))
    const b = campusRandom(campusSeed('campus-garden'))
    expect(Array.from({ length: 12 }, a)).toEqual(Array.from({ length: 12 }, b))
    expect(campusSeed('campus-garden')).not.toBe(campusSeed('campus-road'))
    for (let i = 0; i < 100; i++) { const value = a(); expect(value >= 0 && value < 1).toBe(true) }
  })
})

describe('walking camera orientation', () => {
  it('turns the camera to face a target in every quadrant', () => {
    for (const [tx, tz] of [[10, 0], [-10, 0], [0, 10], [0, -10], [7, -3], [-4, 9]]) {
      const yaw = campusFacingYaw([2, 3], [2 + tx, 3 + tz])
      const length = Math.hypot(tx, tz)
      expect(-Math.sin(yaw)).toBeCloseTo(tx / length, 6)
      expect(-Math.cos(yaw)).toBeCloseTo(tz / length, 6)
    }
  })

  it('does not simply face north (the old walk-mode default)', () => {
    expect(campusFacingYaw([0, 0], [0, 20])).not.toBeCloseTo(0, 3)
  })
})

describe('sight lines through mapped footprints', () => {
  const wall = { points: [[10, -5], [12, -5], [12, 5], [10, 5], [10, -5]] as const, height: 20 }
  const tower = { points: [[30, -5], [40, -5], [40, 5], [30, 5], [30, -5]] as const, height: 40 }
  const field = createCampusHeightField([wall, tower], 1)

  it('records the tallest footprint over each cell', () => {
    const at = (x: number, z: number) => field.owners[Math.floor((z - field.minZ) / field.cell) * field.columns + Math.floor((x - field.minX) / field.cell)]
    expect(at(11, 0)).toBe(0)
    expect(at(35, 0)).toBe(1)
    expect(at(20, 0)).toBe(-1)
  })

  it('blocks a low sight line that crosses a taller wall, but not one that clears it', () => {
    expect(campusSightBlocked(field, [0, 2, 0], [24, 2, 0])).toBe(true)
    expect(campusSightBlocked(field, [0, 60, 0], [24, 50, 0])).toBe(false)
    expect(campusSightBlocked(field, [0, 2, 20], [24, 2, 20])).toBe(false)
  })

  it('ignores the target building itself so a label on its own roof stays visible', () => {
    expect(campusSightBlocked(field, [20, 2, 0], [35, 44, 0])).toBe(true)
    expect(campusSightBlocked(field, [20, 2, 0], [35, 44, 0], (owner) => owner === 1)).toBe(false)
  })
})

describe('collision-free label placement', () => {
  const bounds = { width: 400, height: 300 }
  const label = (id: string, x: number, y: number, extra: Partial<Parameters<typeof placeCampusLabels>[0][number]> = {}) => ({
    id,
    options: [{ x: x - 12, y: y - 12, w: 120, h: 24 }, { x: x + 12 - 120, y: y - 12, w: 120, h: 24 }],
    fallback: { x: x - 12, y: y - 12, w: 24, h: 24 },
    ...extra,
  })
  const overlaps = (a: CampusLabelBox, b: CampusLabelBox) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

  it('keeps every place marked, and never lets a full label cover another label or marker, when 21 places crowd one spot', () => {
    // Twelve places spread over a grid, nine more piled into one corner of it.
    const crowd = Array.from({ length: 21 }, (_, i) => i < 12
      ? label(String(i), 30 + (i % 3) * 130, 30 + Math.floor(i / 3) * 38)
      : label(String(i), 200 + (i % 3) * 8, 230 + Math.floor((i - 12) / 3) * 6))
    const result = placeCampusLabels(crowd, bounds)
    expect(result.size).toBe(crowd.length)
    const full = [...result].filter(([, placement]) => placement.option >= 0)
    expect(full.length).toBeGreaterThan(0)
    expect(full.length).toBeLessThan(crowd.length)
    for (const [id, placement] of full) {
      for (const [otherId, other] of full) if (otherId !== id) expect(overlaps(placement.box, other.box)).toBe(false)
      for (const candidate of crowd) if (candidate.id !== id) expect(overlaps(placement.box, candidate.fallback)).toBe(false)
    }
  })

  it('flips to the left near the right edge and falls back to a compact marker when crowded', () => {
    expect(placeCampusLabels([label('edge', 360, 150)], bounds).get('edge')?.option).toBe(1)
    const result = placeCampusLabels([
      { id: 'a', priority: 2, options: [{ x: 100, y: 100, w: 200, h: 24 }] },
      { id: 'b', priority: 1, options: [{ x: 150, y: 110, w: 100, h: 24 }, { x: 20, y: 110, w: 60, h: 24 }] },
      { id: 'c', options: [{ x: 120, y: 105, w: 100, h: 24 }, { x: 40, y: 112, w: 60, h: 24 }], fallback: { x: 320, y: 200, w: 24, h: 24 } },
    ], bounds)
    expect(result.get('a')?.option).toBe(0)
    expect(result.get('b')?.option).toBe(1)
    expect(result.get('c')?.option).toBe(-1)
  })

  it('keeps labels out of reserved control areas and the stage edges', () => {
    const reserved = [{ x: 150, y: 100, w: 250, h: 100 }]
    expect(placeCampusLabels([label('covered', 200, 150)], bounds, reserved).has('covered')).toBe(false)
    expect(placeCampusLabels([label('covered', 200, 150)], bounds).has('covered')).toBe(true)
    expect(placeCampusLabels([label('outside', 2, 2)], bounds).has('outside')).toBe(false)
  })

  it('always shows the selected place, ahead of nearer unselected ones', () => {
    const result = placeCampusLabels([label('near', 200, 150, { distance: 1 }), label('selected', 202, 151, { pinned: true, distance: 99 })], bounds)
    expect(result.get('selected')?.option).toBe(0)
    expect(result.get('near')?.option).not.toBe(0)
  })
})
