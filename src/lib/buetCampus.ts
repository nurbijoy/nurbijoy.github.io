export type CampusCoordinate = readonly [longitude: number, latitude: number]

export interface CampusBounds {
  west: number
  south: number
  east: number
  north: number
}

/** Local equirectangular projection: north stays up and metres have the same scale on both axes. */
export function createCampusProjection(bounds: CampusBounds, width = 1200, height = 900, padding = 60) {
  const { west, south, east, north } = bounds
  if (![west, south, east, north, width, height, padding].every(Number.isFinite)
    || east <= west || north <= south || padding < 0 || width <= 2 * padding || height <= 2 * padding) {
    throw new RangeError('Campus projection needs valid bounds and a positive drawing area.')
  }

  const metresPerDegree = Math.PI * 6_371_000 / 180
  const longitudeScale = metresPerDegree * Math.cos((north + south) / 2 * Math.PI / 180)
  const spanX = (east - west) * longitudeScale
  const spanY = (north - south) * metresPerDegree
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY)
  const offsetX = (width - spanX * scale) / 2
  const offsetY = (height - spanY * scale) / 2

  return {
    project([longitude, latitude]: CampusCoordinate): [number, number] {
      return [offsetX + (longitude - west) * longitudeScale * scale,
        offsetY + (north - latitude) * metresPerDegree * scale]
    },
    metersPerUnit: 1 / scale,
  }
}

interface SearchableCampusPlace {
  name: string
  shortName: string
  nameBn?: string
  category: string
  aliases?: readonly string[]
}

const normalizeSearch = (text: string) => text.normalize('NFC').toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim()

/** Keep the authored order while matching English, Bangla, abbreviations and multiword queries. */
export function filterCampusPlaces<T extends SearchableCampusPlace>(places: readonly T[], query: string, category = 'all'): T[] {
  const normalized = normalizeSearch(query)
  const terms = normalized.split(/\s+/).filter(Boolean)
  const acronym = terms.length > 1 && terms.every((term) => term.length === 1)
  return places.filter((place) => {
    if (category !== 'all' && place.category !== category) return false
    if (!terms.length) return true
    const haystack = normalizeSearch([place.name, place.shortName, place.nameBn ?? '', ...(place.aliases ?? [])].join(' '))
    return (!acronym && terms.every((term) => haystack.includes(term)))
      || haystack.replace(/\s/g, '').includes(normalized.replace(/\s/g, ''))
  })
}

export function polygonPath(points: readonly (readonly number[])[]): string {
  if (!points.length) return ''
  return points.map(([x, y], index) => `${index ? 'L' : 'M'}${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(' ') + ' Z'
}

/** Hand real walking directions to a mapping service instead of inventing campus routes. */
export function getPlaceMapsUrl([longitude, latitude]: CampusCoordinate): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
}
