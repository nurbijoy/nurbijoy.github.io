import { DIVISIONS, districts, type District, type Division } from '@/data/bangladeshDistricts'

export const TOTAL_DISTRICTS = districts.length

/** The deep green of the reference map is the default; the swatches and custom picker offer the rest. */
export const DEFAULT_COLOUR = '#17794e'

/** Longest name shown on the generated image. */
export const MAX_NAME_LENGTH = 40

export const PRESET_COLOURS = [
  { name: 'সবুজ', value: DEFAULT_COLOUR },
  { name: 'আকাশি', value: '#0ea5e9' },
  { name: 'নীল', value: '#6366f1' },
  { name: 'বেগুনি', value: '#a855f7' },
  { name: 'গোলাপি', value: '#f43f5e' },
  { name: 'কমলা', value: '#f59e0b' },
] as const

export interface DivisionProgress {
  division: Division
  visited: number
  total: number
}

/** Visited count per division, in the order the divisions are listed in the data. */
export function divisionProgress(visited: ReadonlySet<string>): DivisionProgress[] {
  return DIVISIONS.map((division) => {
    const inDivision = districts.filter((d) => d.division === division)
    return {
      division,
      visited: inDivision.filter((d) => visited.has(d.id)).length,
      total: inDivision.length,
    }
  })
}

export interface SavedTravelMap {
  visited: string[]
  colour: string
  name: string
}

/**
 * Lower-case, without spaces, punctuation or Bangla joiners, so "Cox's Bazar" matches
 * "coxs bazar" and Bangla names match as typed.
 */
export function normaliseQuery(text: string): string {
  return text.normalize('NFC').toLowerCase().replace(/[\s'’`.\-‌‍]/g, '')
}

/**
 * Districts whose English name, Bangla name or alias matches the query. Names that start with
 * the query come first, then names that contain it.
 */
export function searchDistricts(query: string, limit = 8): District[] {
  const q = normaliseQuery(query)
  if (!q) return []
  const rank = (d: District) => {
    const keys = [d.name, d.nameBn, ...d.aliases].map(normaliseQuery)
    if (keys.some((k) => k.startsWith(q))) return 0
    if (keys.some((k) => k.includes(q))) return 1
    return -1
  }
  return districts
    .map((d) => ({ d, rank: rank(d) }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.d.name.localeCompare(b.d.name))
    .slice(0, limit)
    .map((x) => x.d)
}

/** Ids of every district in one division, in data order. */
export function districtIdsIn(division: Division): string[] {
  return districts.filter((d) => d.division === division).map((d) => d.id)
}

const KNOWN_IDS = new Set(districts.map((d) => d.id))
const HEX_COLOUR = /^#[0-9a-f]{6}$/i

/**
 * Turns whatever is in storage into a map this build understands. Unknown district ids
 * (from an older build) are dropped, a damaged colour falls back to the default, and the
 * name is trimmed and capped.
 */
export function parseSaved(raw: string | null): SavedTravelMap {
  const fallback: SavedTravelMap = { visited: [], colour: DEFAULT_COLOUR, name: '' }
  if (!raw) return fallback
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return fallback
    const { visited, colour, name } = data as Record<string, unknown>
    const ids = Array.isArray(visited) ? visited : []
    return {
      visited: [...new Set(ids)].filter((id): id is string => typeof id === 'string' && KNOWN_IDS.has(id)),
      colour: typeof colour === 'string' && HEX_COLOUR.test(colour) ? colour : DEFAULT_COLOUR,
      name: typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LENGTH) : '',
    }
  } catch {
    return fallback
  }
}
