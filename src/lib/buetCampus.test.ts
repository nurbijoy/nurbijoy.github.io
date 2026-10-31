import { describe, expect, it } from 'vitest'
import { campusPlaceHash, campusPlaceIdFromHash, createCampusProjection, filterCampusPlaces, getPlaceMapsUrl, polygonAreaMeters, polygonPath } from './buetCampus'
import { campusGeometry, campusPlaces, campusTour } from '../data/buetCampus'
import { campusArchitecture } from '../data/buetCampusArchitecture'
import { campusWorldPoint, distanceToCampusSegment, pointInCampusRing } from './buetCampus3d'

describe('campus projection', () => {
  const bounds = { west: 90.386, south: 23.723, east: 90.397, north: 23.732 }
  const projection = createCampusProjection(bounds)

  it('keeps north up, east right and centers the campus inside the available area', () => {
    const northwest = projection.project([bounds.west, bounds.north])
    const southeast = projection.project([bounds.east, bounds.south])
    expect(northwest[0]).toBeLessThan(southeast[0])
    expect(northwest[1]).toBeLessThan(southeast[1])
    expect(northwest[0]).toBeGreaterThanOrEqual(60)
    expect(northwest[1]).toBeGreaterThanOrEqual(60)
    expect(southeast[0]).toBeLessThanOrEqual(1140)
    expect(southeast[1]).toBeLessThanOrEqual(840)
    const middle = projection.project([(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2])
    expect(middle[0]).toBeCloseTo(600)
    expect(middle[1]).toBeCloseTo(450)
  })

  it('uses the same distance scale for an equal metre offset east and north', () => {
    const longitude = (bounds.west + bounds.east) / 2
    const latitude = (bounds.south + bounds.north) / 2
    const metresPerDegree = Math.PI * 6_371_000 / 180
    const origin = projection.project([longitude, latitude])
    const east = projection.project([longitude + 100 / (metresPerDegree * Math.cos(latitude * Math.PI / 180)), latitude])
    const north = projection.project([longitude, latitude + 100 / metresPerDegree])
    expect(east[0] - origin[0]).toBeCloseTo(origin[1] - north[1], 5)
    expect((east[0] - origin[0]) * projection.metersPerUnit).toBeCloseTo(100, 5)
  })

  it('rejects degenerate bounds or a drawing area consumed by padding', () => {
    expect(() => createCampusProjection({ ...bounds, east: bounds.west })).toThrow(RangeError)
    expect(() => createCampusProjection(bounds, 100, 100, 60)).toThrow(RangeError)
  })

  it('calculates local footprint area in square metres, including courtyard cutouts', () => {
    const metresPerDegree = Math.PI * 6_371_000 / 180
    const latitude = 23.7263
    const longitude = 90.3913
    const east100 = 100 / (metresPerDegree * Math.cos(latitude * Math.PI / 180))
    const north100 = 100 / metresPerDegree
    const outer = [[longitude, latitude], [longitude + east100, latitude], [longitude + east100, latitude + north100], [longitude, latitude + north100]] as const
    const east20 = 20 / (metresPerDegree * Math.cos(latitude * Math.PI / 180))
    const north20 = 20 / metresPerDegree
    const courtyard = [[longitude + east20, latitude + north20], [longitude + east20 * 2, latitude + north20], [longitude + east20 * 2, latitude + north20 * 2], [longitude + east20, latitude + north20 * 2]] as const
    expect(polygonAreaMeters(outer)).toBeCloseTo(10_000, 0)
    expect(polygonAreaMeters(outer, [courtyard])).toBeCloseTo(9_600, 0)
  })
})

describe('campus place search', () => {
  const places = [
    { id: 'ece', name: 'ECE Building', shortName: 'ECE', nameBn: 'ইসিই ভবন', category: 'academic', aliases: ['CSE', 'EEE', 'Electrical and Computer Engineering'] },
    { id: 'library', name: 'Central Library', shortName: 'Library', nameBn: 'কেন্দ্রীয় গ্রন্থাগার', category: 'facilities', aliases: [] },
    { id: 'rashid', name: 'Dr. M. A. Rashid Hall', shortName: 'Rashid Hall', category: 'residential', aliases: ['Student hall'] },
  ]

  it('searches Bangla names, English aliases, punctuation and multiword queries', () => {
    expect(filterCampusPlaces(places, ' ইসিই ').map((p) => p.id)).toEqual(['ece'])
    expect(filterCampusPlaces(places, 'cSe').map((p) => p.id)).toEqual(['ece'])
    expect(filterCampusPlaces(places, ' E.C.E. ').map((p) => p.id)).toEqual(['ece'])
    expect(filterCampusPlaces(places, 'hall rashid').map((p) => p.id)).toEqual(['rashid'])
    expect(filterCampusPlaces(places, 'central library').map((p) => p.id)).toEqual(['library'])
  })

  it('combines category and query filters, retaining source order for blank searches', () => {
    expect(filterCampusPlaces(places, '   ')).toEqual(places)
    expect(filterCampusPlaces(places, '', 'residential')).toEqual([places[2]])
    expect(filterCampusPlaces(places, 'cse', 'facilities')).toEqual([])
    expect(filterCampusPlaces(places, 'not a campus place')).toEqual([])
  })
})

describe('campus SVG and directions helpers', () => {
  it('creates closed SVG paths with stable two-decimal coordinates', () => {
    expect(polygonPath([[0, 0], [12.345, 8.9], [10, 10]])).toBe('M0,0 L12.35,8.9 L10,10 Z')
    expect(polygonPath([])).toBe('')
  })

  it('converts longitude/latitude map coordinates to a latitude/longitude walking destination', () => {
    const url = new URL(getPlaceMapsUrl([90.3921, 23.7268]))
    expect(url.origin).toBe('https://www.google.com')
    expect(url.searchParams.get('destination')).toBe('23.7268,90.3921')
    expect(url.searchParams.get('travelmode')).toBe('walking')
    expect(url.searchParams.get('api')).toBe('1')
  })
})

describe('campus map data integrity', () => {
  it('fits every directory place inside the initial 2D map extent', () => {
    const mapProjection = createCampusProjection(campusGeometry.bounds, 1200, 900, 65)
    for (const place of campusPlaces) {
      const [x, y] = mapProjection.project(place.coordinates)
      expect(x, `${place.id}: map x`).toBeGreaterThanOrEqual(65)
      expect(x, `${place.id}: map x`).toBeLessThanOrEqual(1135)
      expect(y, `${place.id}: map y`).toBeGreaterThanOrEqual(65)
      expect(y, `${place.id}: map y`).toBeLessThanOrEqual(835)
    }
  })

  it('keeps directory identifiers unique and tour stops connected to real places', () => {
    const placeIds = new Set(campusPlaces.map((place) => place.id))
    expect(placeIds.size).toBe(campusPlaces.length)
    expect(campusTour.length).toBeGreaterThan(1)
    expect(new Set(campusTour).size).toBe(campusTour.length)
    for (const id of campusTour) expect(placeIds.has(id), `unknown tour stop ${id}`).toBe(true)
  })

  it('places every landmark inside the published map extent and links only existing buildings', () => {
    const { west, south, east, north } = campusGeometry.bounds
    const buildingIds = new Set(campusGeometry.buildings.map((building) => building.id))
    const greenIds = new Set(campusGeometry.greens.map((green) => green.id))
    for (const place of campusPlaces) {
      const [longitude, latitude] = place.coordinates
      expect(Number.isFinite(longitude) && longitude >= west && longitude <= east, `${place.id}: longitude`).toBe(true)
      expect(Number.isFinite(latitude) && latitude >= south && latitude <= north, `${place.id}: latitude`).toBe(true)
      for (const id of place.buildingIds) expect(buildingIds.has(id), `${place.id}: unknown building ${id}`).toBe(true)
      for (const id of place.greenIds ?? []) expect(greenIds.has(id), `${place.id}: unknown green area ${id}`).toBe(true)
      expect(place.name.trim().length, place.id).toBeGreaterThan(0)
      expect(place.shortName.trim().length, place.id).toBeGreaterThan(0)
      expect(new URL(place.sourceUrl).protocol, place.id).toBe('https:')
    }
  })

  it('anchors every place to its mapped footprint, open-space polygon, or exact OSM point', () => {
    const buildings = new Map(campusGeometry.buildings.map((building) => [building.id, building]))
    const greens = new Map(campusGeometry.greens.map((green) => [green.id, green]))
    const buildingOwners = new Map<string, string>()
    const sourceNodeCoordinates: Record<string, readonly [number, number]> = {
      '830037031': [90.3897246, 23.7264045],
      '830039614': [90.3905006, 23.7257365],
      '1119027966': [90.3918607, 23.7261287],
    }
    for (const place of campusPlaces) {
      const point = campusWorldPoint(place.coordinates)
      for (const id of place.buildingIds) {
        expect(buildingOwners.has(id), `${id}: assigned to multiple places`).toBe(false)
        buildingOwners.set(id, place.id)
      }
      const linkedBuildings = place.buildingIds.map((id) => buildings.get(id)).filter((building) => building !== undefined)
      if (linkedBuildings.length) {
        const distanceToFootprint = (ring: readonly (readonly [number, number])[]) => {
          const worldRing = ring.map(campusWorldPoint)
          if (pointInCampusRing(point, worldRing)) return 0
          return worldRing.slice(1).reduce((nearest, next, index) => Math.min(nearest,
            distanceToCampusSegment(point, worldRing[index], next)), Infinity)
        }
        // Pins sit on a linked building; 2 m allows a marker on the seam between a hall's blocks.
        const nearest = Math.min(...linkedBuildings.map((building) => distanceToFootprint(building.points)))
        expect(nearest, `${place.id}: nearest linked footprint`).toBeLessThanOrEqual(2)
      }
      for (const id of place.greenIds ?? []) {
        const green = greens.get(id)!
        expect(pointInCampusRing(point, green.points.map(campusWorldPoint)), `${place.id}: marker inside ${id}`).toBe(true)
      }
      const sourceNodeId = place.sourceUrl.match(/openstreetmap\.org\/node\/(\d+)/)?.[1]
      if (sourceNodeId && sourceNodeCoordinates[sourceNodeId]) {
        expect(place.coordinates, `${place.id}: OSM node coordinate`).toEqual(sourceNodeCoordinates[sourceNodeId])
      }
      expect(linkedBuildings.length + (place.greenIds?.length ?? 0) + Number(Boolean(sourceNodeId)), `${place.id}: mapped anchor`).toBeGreaterThan(0)
    }
  })

  it('shows only BUET: no footprint or open space belongs to a neighbouring institution, and roads stay on campus', () => {
    // Names found in the full OSM snapshot around the campus; none may reappear in the reduced geometry.
    const neighbours = /jagannath|salimullah|zahurul|shamsun|eden|nursing|medical college|azimpur|dhakeshwari|fire service|palashi bazar|army|জনসংখ্যা|\bDU\b|University of Dhaka/i
    const named = [...campusGeometry.buildings, ...campusGeometry.greens].filter((feature) => feature.name)
    expect(named.length).toBeGreaterThan(10)
    for (const feature of named) expect(feature.name, feature.id).not.toMatch(neighbours)
    // The campus keeps 120 footprints; the full neighbourhood snapshot had 452 and the raw boundary 177.
    expect(campusGeometry.buildings.length).toBeGreaterThan(100)
    expect(campusGeometry.buildings.length).toBeLessThan(140)
    // Spot checks from the Google Maps cross-check: staff colony, girls' school, health institute, private block.
    const ids = new Set(campusGeometry.buildings.map((building) => building.id))
    for (const id of ['way/435101817', 'way/367479409', 'way/316804616', 'way/506174756']) expect(ids.has(id), id).toBe(false)
    // ...and BUET buildings beside them that must stay: Staff Quarter 64, Ship Model Testing Center, JIDPUS.
    for (const id of ['way/506174765', 'way/1001442057', 'way/235414270']) expect(ids.has(id), id).toBe(true)
    const { west, south, east, north } = campusGeometry.bounds
    for (const road of campusGeometry.roads) for (const [longitude, latitude] of road.points) {
      expect(longitude >= west && longitude <= east && latitude >= south && latitude <= north, road.id).toBe(true)
    }
  })

  it('keeps footprint area data positive and architectural level references attached to real buildings', () => {
    const buildingIds = new Set(campusGeometry.buildings.map((building) => building.id))
    for (const building of campusGeometry.buildings) {
      expect(polygonAreaMeters(building.points, building.holes ?? []), `${building.id}: area`).toBeGreaterThan(0)
    }
    for (const green of campusGeometry.greens) expect(polygonAreaMeters(green.points), `${green.id}: area`).toBeGreaterThan(0)
    for (const [id, details] of Object.entries(campusArchitecture)) {
      expect(buildingIds.has(id), `${id}: architecture record without footprint`).toBe(true)
      if (details.levels !== undefined) expect(Number.isFinite(details.levels) && details.levels > 0, `${id}: levels`).toBe(true)
      if (details.height !== undefined) expect(Number.isFinite(details.height) && details.height > 0, `${id}: height`).toBe(true)
    }
  })

  it('keeps geometry finite and polygons closed, including courtyard cutouts', () => {
    const validCoordinate = (coordinate: readonly number[]) => coordinate.length === 2
      && coordinate.every(Number.isFinite) && Math.abs(coordinate[0]) <= 180 && Math.abs(coordinate[1]) <= 90
    const closedRing = (points: readonly (readonly number[])[]) => points.length >= 4
      && points.every(validCoordinate) && points[0][0] === points.at(-1)![0] && points[0][1] === points.at(-1)![1]

    for (const features of [campusGeometry.buildings, campusGeometry.roads, campusGeometry.greens]) {
      expect(new Set(features.map((feature) => feature.id)).size).toBe(features.length)
    }
    for (const building of campusGeometry.buildings) {
      expect(closedRing(building.points), building.id).toBe(true)
      for (const hole of building.holes ?? []) expect(closedRing(hole), `${building.id}: courtyard`).toBe(true)
      if (building.levels !== undefined) expect(Number.isFinite(building.levels) && building.levels > 0, building.id).toBe(true)
    }
    for (const green of campusGeometry.greens) expect(closedRing(green.points), green.id).toBe(true)
    for (const road of campusGeometry.roads) {
      expect(road.points.length >= 2 && road.points.every(validCoordinate), road.id).toBe(true)
    }
  })
})

describe('shareable place links', () => {
  const ids = ['library', 'ece']

  it('round-trips a place through the project hash', () => {
    expect(campusPlaceHash('campus', 'library')).toBe('#campus/library')
    expect(campusPlaceHash('campus', null)).toBe('#campus')
    expect(campusPlaceIdFromHash(campusPlaceHash('campus', 'ece'), 'campus', ids)).toBe('ece')
  })

  it('ignores other projects, unknown places, extra segments and malformed escapes', () => {
    expect(campusPlaceIdFromHash('#campus', 'campus', ids)).toBeNull()
    expect(campusPlaceIdFromHash('#other/library', 'campus', ids)).toBeNull()
    expect(campusPlaceIdFromHash('#campus/unknown', 'campus', ids)).toBeNull()
    expect(campusPlaceIdFromHash('#campus/library/extra', 'campus', ids)).toBeNull()
    expect(campusPlaceIdFromHash('#campus/%E0%A4%A', 'campus', ids)).toBeNull()
  })
})
