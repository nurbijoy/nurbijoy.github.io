import { CONTINENT_BN, countries, type Continent, type Country } from '@/data/worldCountries'
import { DEFAULT_COLOUR, normaliseQuery } from './travelMap'

export const WORLD_STORAGE_KEY = 'world-tour-map'

export const TOTAL_COUNTRIES = countries.length

/** Continents in the order the page lists them. */
export const CONTINENT_ORDER = Object.keys(CONTINENT_BN) as Continent[]

export interface ContinentProgress {
  continent: Continent
  visited: number
  total: number
}

/** Visited count per continent, in page order. */
export function continentProgress(visited: ReadonlySet<string>): ContinentProgress[] {
  return CONTINENT_ORDER.map((continent) => {
    const inContinent = countries.filter((c) => c.continent === continent)
    return {
      continent,
      visited: inContinent.filter((c) => visited.has(c.id)).length,
      total: inContinent.length,
    }
  })
}

/** Ids of every country in one continent, in data order. */
export function countryIdsIn(continent: Continent): string[] {
  return countries.filter((c) => c.continent === continent).map((c) => c.id)
}

/**
 * Countries whose English name, Bangla name or alias matches the query. Names that start with
 * the query come first, then names that contain it.
 */
export function searchCountries(query: string, limit = 8): Country[] {
  const q = normaliseQuery(query)
  if (!q) return []
  const rank = (c: Country) => {
    const keys = [c.name, c.nameBn, ...c.aliases].map(normaliseQuery)
    if (keys.some((k) => k.startsWith(q))) return 0
    if (keys.some((k) => k.includes(q))) return 1
    return -1
  }
  return countries
    .map((c) => ({ c, rank: rank(c) }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.c.name.localeCompare(b.c.name))
    .slice(0, limit)
    .map((x) => x.c)
}

const KNOWN_IDS = new Set(countries.map((c) => c.id))
const HEX_COLOUR = /^#[0-9a-f]{6}$/i
const MAX_NAME = 40

export interface SavedWorldTour {
  visited: string[]
  colour: string
  name: string
}

/**
 * Turns whatever is in storage into a map this build understands. Unknown country ids are
 * dropped, a damaged colour falls back to the default, and the name is trimmed and capped.
 */
export function parseWorldSaved(raw: string | null): SavedWorldTour {
  const fallback: SavedWorldTour = { visited: [], colour: DEFAULT_COLOUR, name: '' }
  if (!raw) return fallback
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return fallback
    const { visited, colour, name } = data as Record<string, unknown>
    const ids = Array.isArray(visited) ? visited : []
    return {
      visited: [...new Set(ids)].filter((id): id is string => typeof id === 'string' && KNOWN_IDS.has(id)),
      colour: typeof colour === 'string' && HEX_COLOUR.test(colour) ? colour : DEFAULT_COLOUR,
      name: typeof name === 'string' ? name.trim().slice(0, MAX_NAME) : '',
    }
  } catch {
    return fallback
  }
}
