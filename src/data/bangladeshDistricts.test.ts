import { describe, expect, it } from 'vitest'
import { DIVISION_BN, DIVISIONS, districts, MAP_HEIGHT, MAP_WIDTH } from './bangladeshDistricts'

describe('Bangladesh district map data', () => {
  it('has all 64 districts, each with a unique id and English name', () => {
    expect(districts).toHaveLength(64)
    expect(new Set(districts.map((d) => d.id)).size).toBe(64)
    expect(new Set(districts.map((d) => d.name)).size).toBe(64)
  })

  it('gives every district a Bangla name, and every division a Bangla name', () => {
    expect(new Set(districts.map((d) => d.nameBn)).size).toBe(64)
    for (const d of districts) expect(d.nameBn, d.name).toMatch(/^[ঀ-৿ ]+$/)
    for (const division of DIVISIONS) expect(DIVISION_BN[division], division).toMatch(/^[ঀ-৿ ]+$/)
  })

  it('splits the districts across the 8 divisions', () => {
    const counts = Object.fromEntries(
      DIVISIONS.map((division) => [division, districts.filter((d) => d.division === division).length]),
    )
    expect(counts).toEqual({
      Barishal: 6,
      Chattogram: 11,
      Dhaka: 13,
      Khulna: 10,
      Mymensingh: 4,
      Rajshahi: 8,
      Rangpur: 8,
      Sylhet: 4,
    })
  })

  it('draws every district as closed paths that sit inside the map box', () => {
    for (const d of districts) {
      expect(d.d, d.name).toMatch(/^M[MZ\d. ]+Z$/)
      const nums = (d.d.match(/\d+(\.\d+)?/g) ?? []).map(Number)
      expect(nums.length % 2, d.name).toBe(0)
      for (let i = 0; i < nums.length; i += 2) {
        const [x, y] = [nums[i]!, nums[i + 1]!]
        expect(x, d.name).toBeGreaterThanOrEqual(0)
        expect(x, d.name).toBeLessThanOrEqual(MAP_WIDTH)
        expect(y, d.name).toBeGreaterThanOrEqual(0)
        expect(y, d.name).toBeLessThanOrEqual(MAP_HEIGHT)
      }
    }
  })

  it('puts each label point inside the map box', () => {
    for (const d of districts) {
      const [x, y] = d.label
      expect(x, d.name).toBeGreaterThan(0)
      expect(x, d.name).toBeLessThan(MAP_WIDTH)
      expect(y, d.name).toBeGreaterThan(0)
      expect(y, d.name).toBeLessThan(MAP_HEIGHT)
    }
  })
})
