import { describe, expect, it } from 'vitest'
import { CONTINENT_BN, countries, WORLD_HEIGHT, WORLD_WIDTH } from './worldCountries'

describe('world country map data', () => {
  it('has unique ids and a Bangla name for every country', () => {
    expect(countries.length).toBeGreaterThan(200)
    expect(new Set(countries.map((c) => c.id)).size).toBe(countries.length)
    for (const c of countries) expect(c.nameBn, c.name).toMatch(/[ঀ-৿]/)
  })

  it('only uses the continents the page lists', () => {
    const known = new Set(Object.keys(CONTINENT_BN))
    for (const c of countries) expect(known.has(c.continent), c.name).toBe(true)
  })

  it('draws every country as closed paths and puts its label inside the map box', () => {
    for (const c of countries) {
      expect(c.d, c.name).toMatch(/^M[MZ\d. -]+Z$/)
      const [x, y] = c.label
      expect(x, c.name).toBeGreaterThanOrEqual(0)
      expect(x, c.name).toBeLessThanOrEqual(WORLD_WIDTH)
      expect(y, c.name).toBeGreaterThanOrEqual(0)
      expect(y, c.name).toBeLessThanOrEqual(WORLD_HEIGHT)
    }
  })
})
