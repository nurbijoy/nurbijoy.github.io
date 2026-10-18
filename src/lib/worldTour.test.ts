import { describe, expect, it } from 'vitest'
import { DEFAULT_COLOUR } from './travelMap'
import { continentProgress, countryIdsIn, parseWorldSaved, searchCountries, TOTAL_COUNTRIES } from './worldTour'

describe('continentProgress', () => {
  it('counts visited countries per continent, and the totals add up to every country', () => {
    const progress = continentProgress(new Set(['bgd', 'ind', 'fra']))
    expect(progress.find((p) => p.continent === 'Asia')?.visited).toBe(2)
    expect(progress.find((p) => p.continent === 'Europe')?.visited).toBe(1)
    expect(progress.reduce((sum, p) => sum + p.total, 0)).toBe(TOTAL_COUNTRIES)
  })

  it('is zero everywhere for an empty map', () => {
    expect(continentProgress(new Set<string>()).every((p) => p.visited === 0)).toBe(true)
  })
})

describe('countryIdsIn', () => {
  it('lists the countries of one continent', () => {
    expect(countryIdsIn('Asia')).toContain('bgd')
    expect(countryIdsIn('Asia')).not.toContain('fra')
  })
})

describe('searchCountries', () => {
  it('finds a country from its English name, ignoring case', () => {
    expect(searchCountries('bangla')[0]?.id).toBe('bgd')
  })

  it('finds a country from its Bangla name', () => {
    expect(searchCountries('বাংলাদেশ')[0]?.id).toBe('bgd')
  })

  it('finds a country from a common short form kept as an alias', () => {
    expect(searchCountries('uk').map((c) => c.id)).toContain('gbr')
    expect(searchCountries('usa').map((c) => c.id)).toContain('usa')
  })

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchCountries('  ')).toEqual([])
    expect(searchCountries('a', 3)).toHaveLength(3)
  })
})

describe('parseWorldSaved', () => {
  it('falls back to an empty map when nothing usable is stored', () => {
    const empty = { visited: [], colour: DEFAULT_COLOUR, name: '' }
    expect(parseWorldSaved(null)).toEqual(empty)
    expect(parseWorldSaved('not json')).toEqual(empty)
  })

  it('keeps known countries once and drops unknown ids', () => {
    const raw = JSON.stringify({ visited: ['bgd', 'bgd', 'atlantis', 3], colour: '#ABCDEF', name: '  Rahim  ' })
    expect(parseWorldSaved(raw)).toEqual({ visited: ['bgd'], colour: '#ABCDEF', name: 'Rahim' })
  })
})
