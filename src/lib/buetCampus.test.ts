import { describe, expect, it } from 'vitest'
import { createCampusProjection, filterCampusPlaces, getPlaceMapsUrl, polygonPath } from './buetCampus'
import { campusGeometry, campusPlaces, campusTour } from '../data/buetCampus'

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
    for (const place of campusPlaces) {
      const [longitude, latitude] = place.coordinates
      expect(Number.isFinite(longitude) && longitude >= west && longitude <= east, `${place.id}: longitude`).toBe(true)
      expect(Number.isFinite(latitude) && latitude >= south && latitude <= north, `${place.id}: latitude`).toBe(true)
      for (const id of place.buildingIds) expect(buildingIds.has(id), `${place.id}: unknown building ${id}`).toBe(true)
      expect(place.name.trim().length, place.id).toBeGreaterThan(0)
      expect(place.shortName.trim().length, place.id).toBeGreaterThan(0)
      expect(new URL(place.sourceUrl).protocol, place.id).toBe('https:')
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
