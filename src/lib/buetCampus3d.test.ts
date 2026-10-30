import { describe, expect, it } from 'vitest'
import { campusRandom, campusSeed, campusWorldPoint, distanceToCampusSegment, pointInCampusBuilding, pointInCampusRing } from './buetCampus3d'

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
