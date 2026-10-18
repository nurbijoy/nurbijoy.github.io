import { describe, expect, it } from 'vitest'
import {
  DEFAULT_COLOUR,
  districtIdsIn,
  divisionProgress,
  MAX_NAME_LENGTH,
  parseSaved,
  searchDistricts,
  TOTAL_DISTRICTS,
} from './travelMap'

describe('divisionProgress', () => {
  it('counts visited districts per division, and the totals add up to 64', () => {
    const progress = divisionProgress(new Set(['dhaka', 'faridpur', 'sylhet']))
    expect(progress.find((p) => p.division === 'Dhaka')).toEqual({ division: 'Dhaka', visited: 2, total: 13 })
    expect(progress.find((p) => p.division === 'Sylhet')).toEqual({ division: 'Sylhet', visited: 1, total: 4 })
    expect(progress.reduce((sum, p) => sum + p.total, 0)).toBe(TOTAL_DISTRICTS)
  })

  it('is zero everywhere for an empty map', () => {
    expect(divisionProgress(new Set<string>()).every((p) => p.visited === 0)).toBe(true)
  })
})

describe('parseSaved', () => {
  it('falls back to an empty map, the default colour and no name when nothing usable is stored', () => {
    const empty = { visited: [], colour: DEFAULT_COLOUR, name: '' }
    expect(parseSaved(null)).toEqual(empty)
    expect(parseSaved('not json')).toEqual(empty)
    expect(parseSaved('42')).toEqual(empty)
  })

  it('keeps each known district once and drops ids this build does not know', () => {
    const raw = JSON.stringify({ visited: ['dhaka', 'dhaka', 'atlantis', 7], colour: '#ABCDEF', name: 'Rahim' })
    expect(parseSaved(raw)).toEqual({ visited: ['dhaka'], colour: '#ABCDEF', name: 'Rahim' })
  })

  it('replaces a damaged colour with the default', () => {
    expect(parseSaved(JSON.stringify({ visited: [], colour: 'red' })).colour).toBe(DEFAULT_COLOUR)
    expect(parseSaved(JSON.stringify({ visited: [], colour: '#12345' })).colour).toBe(DEFAULT_COLOUR)
  })

  it('trims the name and caps its length', () => {
    expect(parseSaved(JSON.stringify({ visited: [], name: '  Rahim  ' })).name).toBe('Rahim')
    const long = 'x'.repeat(MAX_NAME_LENGTH + 10)
    expect(parseSaved(JSON.stringify({ visited: [], name: long })).name).toHaveLength(MAX_NAME_LENGTH)
    expect(parseSaved(JSON.stringify({ visited: [], name: 42 })).name).toBe('')
  })
})

describe('searchDistricts', () => {
  const names = (query: string) => searchDistricts(query).map((d) => d.name)

  it('finds a district from part of its English name, ignoring case and punctuation', () => {
    expect(names('dhak')).toContain('Dhaka')
    expect(names('coxs baz')).toEqual(["Cox's Bazar"])
  })

  it('finds a district from its Bangla name', () => {
    expect(names('কুমিল্লা')).toEqual(['Cumilla'])
    expect(searchDistricts('ঢাকা')[0]?.name).toBe('Dhaka')
  })

  it('finds a district from an older spelling kept as an alias', () => {
    expect(names('chittagong')).toEqual(['Chattogram'])
    expect(names('comilla')).toEqual(['Cumilla'])
  })

  it('puts names that start with the query before names that only contain it', () => {
    const results = names('sylh')
    expect(results[0]).toBe('Sylhet')
  })

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchDistricts('   ')).toEqual([])
    expect(searchDistricts('a', 3)).toHaveLength(3)
  })
})

describe('districtIdsIn', () => {
  it('lists the districts of one division', () => {
    const ids = districtIdsIn('Sylhet')
    expect(ids.sort()).toEqual(['habiganj', 'moulvibazar', 'sunamganj', 'sylhet'])
  })
})
