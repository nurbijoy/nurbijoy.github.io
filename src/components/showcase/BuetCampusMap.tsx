import { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, Box, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Flag, Footprints, GraduationCap, House, Info, Link2, Map, MapPin, Maximize2, Minimize2, Minus, Moon, Navigation, Orbit, Pause, Play, Plus, RotateCcw, RotateCw, Route, Search, Sun, Tags, Trees, X } from 'lucide-react'
import { campusGeometry as geometry, campusPlaces, campusSources, campusTour, type CampusPlace } from '@/data/buetCampus'
import { campusArchitecture, campusArchitectureReferences } from '@/data/buetCampusArchitecture'
import { campusPlaceHash, campusPlaceIdFromHash, createCampusProjection, filterCampusPlaces, getPlaceMapsUrl, polygonAreaMeters, polygonPath } from '@/lib/buetCampus'
import { placeCampusLabels, type CampusLabelBox } from '@/lib/buetCampus3d'
import type { CampusCameraCommand, CampusScenePoint } from './BuetCampusScene'
import './BuetCampusMap.css'

const BuetCampusScene = lazy(() => import('./BuetCampusScene').then((module) => ({ default: module.BuetCampusScene })))
type Point = [number, number]
type Category = CampusPlace['category']
type HintKey = 'orbit' | 'walk' | '2d'
interface Camera { x: number; y: number; zoom: number }
const PROJECT_ID = 'buet-campus-map'
const WIDTH = 1200
const HEIGHT = 900
const TOUR_INTERVAL = 9000
const HINT_STORAGE = 'campus-explorer-hints'
const INITIAL_CAMERA: Camera = { x: 0, y: 0, zoom: 1 }
const CATEGORIES = [
  { id: 'academic', label: 'Academic', Icon: GraduationCap },
  { id: 'residential', label: 'Halls', Icon: House },
  { id: 'facilities', label: 'Facilities', Icon: BookOpen },
  { id: 'landmark', label: 'Landmarks', Icon: Flag },
] as const
const HINTS: Record<HintKey, { title: string; lines: string[] }> = {
  orbit: { title: 'Fly around the campus', lines: ['Drag to orbit · right-drag or two fingers to pan', 'Scroll or pinch to zoom · click a building to explore'] },
  walk: { title: 'You are on the ground', lines: ['W A S D or arrow keys to walk · hold Shift to run', 'Drag to look around · pick a place to walk to it'] },
  '2d': { title: 'Explore the plan', lines: ['Drag to pan · scroll or pinch to zoom', 'Arrow keys pan · + / − zoom · Home resets'] },
}
const TOUCH_HINTS: Record<HintKey, { title: string; lines: string[] }> = {
  orbit: { title: 'Fly around the campus', lines: ['One finger orbits · two fingers pan and zoom', 'Tap a building or number to explore'] },
  walk: { title: 'You are on the ground', lines: ['Use the arrow pad to walk · drag to look around'] },
  '2d': { title: 'Explore the plan', lines: ['Drag to pan · pinch to zoom · tap a pin'] },
}
// Fit the published campus extent so every directory place is on the map at first load.
const projection = createCampusProjection(geometry.bounds, WIDTH, HEIGHT, 65)
const placeIds = campusPlaces.map((place) => place.id)
const tourPlaces = campusTour.map((id) => campusPlaces.find((place) => place.id === id)).filter((place): place is CampusPlace => !!place)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const constrain = (camera: Camera): Camera => ({
  zoom: clamp(camera.zoom, .8, 5),
  x: clamp(camera.x, WIDTH * (1 - Math.max(1, camera.zoom)) - 250, 250),
  y: clamp(camera.y, HEIGHT * (1 - Math.max(1, camera.zoom)) - 200, 200),
})
function zoomCamera(camera: Camera, factor: number, anchor: Point = [WIDTH / 2, HEIGHT / 2]): Camera {
  const zoom = clamp(camera.zoom * factor, .8, 5)
  const ratio = zoom / camera.zoom
  return constrain({ zoom, x: anchor[0] - (anchor[0] - camera.x) * ratio, y: anchor[1] - (anchor[1] - camera.y) * ratio })
}
const toMapPoint = (coordinate: readonly number[]): Point => projection.project([coordinate[0], coordinate[1]])
function cameraFor(place: CampusPlace, zoom = 2.2): Camera {
  const [x, y] = toMapPoint(place.coordinates)
  return constrain({ x: WIDTH / 2 - x * zoom, y: HEIGHT / 2 - y * zoom, zoom })
}
function categoryLabel(category: Category) { return CATEGORIES.find((item) => item.id === category)?.label ?? category }
const placeNumber = (place: CampusPlace) => String(campusPlaces.indexOf(place) + 1).padStart(2, '0')
const referenceFor = (place: CampusPlace) => campusArchitectureReferences.find((reference) => place.buildingIds.includes(reference.buildingId))

let measureContext: CanvasRenderingContext2D | null | undefined
function labelWidth(text: string) {
  if (measureContext === undefined) {
    measureContext = document.createElement('canvas').getContext('2d')
    if (measureContext) measureContext.font = `600 12px ${getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif'}`
  }
  return Math.ceil((measureContext?.measureText(text).width ?? text.length * 7.2) + 22)
}
function readHints(): HintKey[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(HINT_STORAGE) ?? '[]'); return Array.isArray(value) ? value.filter((key): key is HintKey => key in HINTS) : [] } catch { return [] }
}
function avoidRects(stage: HTMLElement | null): CampusLabelBox[] {
  if (!stage) return []
  const origin = stage.getBoundingClientRect()
  return [...stage.querySelectorAll<HTMLElement>('[data-label-avoid]')].flatMap((element) => {
    const rect = element.getBoundingClientRect()
    return rect.width && rect.height ? [{ x: Math.round(rect.left - origin.left), y: Math.round(rect.top - origin.top), w: Math.round(rect.width), h: Math.round(rect.height) }] : []
  })
}

export function BuetCampusMap() {
  const [initialPlaceId] = useState(() => typeof window === 'undefined' ? null : campusPlaceIdFromHash(window.location.hash, PROJECT_ID, placeIds))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(initialPlaceId)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoverCard, setHoverCard] = useState<{ id: string; x: number; y: number } | null>(null)
  const [is3D, setIs3D] = useState(true)
  const [sceneMode, setSceneMode] = useState<'orbit' | 'walk'>('orbit')
  const [lighting, setLighting] = useState<'day' | 'evening'>('day')
  const [sceneCommand, setSceneCommand] = useState<CampusCameraCommand>(() => initialPlaceId ? { kind: 'focus', placeId: initialPlaceId, sequence: 0 } : { kind: 'reset', sequence: 0 })
  const [sceneView, setSceneView] = useState({ zoom: 1, heading: 0 })
  const [sceneError, setSceneError] = useState(false)
  const [labels, setLabels] = useState(true)
  const [camera, setCamera] = useState<Camera>(() => { const place = campusPlaces.find((item) => item.id === initialPlaceId); return place ? cameraFor(place) : INITIAL_CAMERA })
  const [tourStep, setTourStep] = useState<number | null>(null)
  const [tourPlaying, setTourPlaying] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const [stageSize, setStageSize] = useState({ width: WIDTH, height: HEIGHT })
  const [reserved2d, setReserved2d] = useState<CampusLabelBox[]>([])
  const [seenHints, setSeenHints] = useState<HintKey[]>(readHints)
  const [copied, setCopied] = useState(false)
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new globalThis.Map<number, Point>())
  const copyTimer = useRef(0)
  const patternId = useId().replace(/:/g, '')

  const queryPlaces = useMemo(() => filterCampusPlaces(campusPlaces, query), [query])
  const places = useMemo(() => category === 'all' ? queryPlaces : queryPlaces.filter((place) => place.category === category), [queryPlaces, category])
  const visibleIds = useMemo(() => new Set(places.map((place) => place.id)), [places])
  const selected = campusPlaces.find((place) => place.id === selectedId)
  const selectedVisible = selected && visibleIds.has(selected.id) ? selected : undefined
  const selectedIndex = selectedVisible ? places.indexOf(selectedVisible) : -1
  const tourPlace = tourStep === null ? undefined : tourPlaces[tourStep]
  const hoverPlace = hoverCard ? campusPlaces.find((place) => place.id === hoverCard.id) : undefined
  const hintKey: HintKey = is3D ? sceneMode : '2d'
  const showHint = !seenHints.includes(hintKey) && tourStep === null
  const hint = (touch ? TOUCH_HINTS : HINTS)[hintKey]
  const displayScale = Math.min(stageSize.width / WIDTH, stageSize.height / HEIGHT) || 1
  const placeByBuilding = useMemo(() => new globalThis.Map(campusPlaces.flatMap((place) => (place.buildingIds ?? []).map((id) => [id, place] as const))), [])
  const placeByGreen = useMemo(() => new globalThis.Map(campusPlaces.flatMap((place) => (place.greenIds ?? []).map((id) => [id, place] as const))), [])

  const screenPoint = useCallback((clientX: number, clientY: number): Point => {
    const matrix = svgRef.current?.getScreenCTM()
    if (!matrix) return [WIDTH / 2, HEIGHT / 2]
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
    return [point.x, point.y]
  }, [])
  const focusPlace = useCallback((place: CampusPlace) => {
    setCamera(cameraFor(place))
    setSelectedId(place.id)
    setSceneCommand((current) => ({ kind: 'focus', placeId: place.id, sequence: current.sequence + 1 }))
  }, [])
  const goToStop = useCallback((step: number) => {
    const place = tourPlaces[step]
    if (!place) return
    setCategory('all'); setQuery(''); setTourStep(step); focusPlace(place)
  }, [focusPlace])
  const startTour = () => { setTourPlaying(true); goToStop(0) }
  const endTour = () => { setTourStep(null); setTourPlaying(false) }
  const explorePlace = (place: CampusPlace) => {
    if (tourStep !== null && tourPlaces[tourStep]?.id !== place.id) endTour()
    setHoverCard(null); focusPlace(place)
  }
  const closePlace = () => { setSelectedId(null); endTour() }
  const resetMap = () => {
    setCamera(INITIAL_CAMERA); setSelectedId(null); endTour(); setHoveredId(null); setHoverCard(null)
    setSceneCommand((current) => ({ kind: 'reset', sequence: current.sequence + 1 }))
  }
  const changeView = (value: boolean) => {
    setIs3D(value); if (value) setSceneError(false); setSceneMode('orbit'); pointers.current.clear(); setHoverCard(null)
    if (selectedVisible) focusPlace(selectedVisible)
    else {
      setCamera(INITIAL_CAMERA)
      setSceneCommand((current) => ({ kind: 'reset', sequence: current.sequence + 1 }))
    }
  }
  const walkTo = (place: CampusPlace) => { setIs3D(true); setSceneError(false); setSceneMode('walk'); setTourPlaying(false); focusPlace(place) }
  const commandScene = (kind: CampusCameraCommand['kind']) => setSceneCommand((current) => ({ kind, sequence: current.sequence + 1 }))
  const onSceneError = useCallback(() => { setSceneError(true); setIs3D(false) }, [])
  const onSceneHover = useCallback((place: CampusPlace | null, point?: CampusScenePoint) => {
    setHoveredId(place?.id ?? null)
    setHoverCard((current) => !place || !point ? null
      : current?.id === place.id && Math.hypot(current.x - point.x, current.y - point.y) < 6 ? current : { id: place.id, x: point.x, y: point.y })
  }, [])
  const hoverFromPointer = (place: CampusPlace, event: ReactPointerEvent<Element>) => {
    setHoveredId(place.id)
    const origin = stageRef.current?.getBoundingClientRect()
    if (event.pointerType !== 'touch' && origin) setHoverCard({ id: place.id, x: event.clientX - origin.left, y: event.clientY - origin.top })
  }
  const clearHover = () => { setHoveredId(null); setHoverCard(null) }
  const dismissHint = () => {
    if (seenHints.includes(hintKey)) return
    const next = [...seenHints, hintKey]
    setSeenHints(next)
    try { localStorage.setItem(HINT_STORAGE, JSON.stringify(next)) } catch { /* storage blocked: the hint simply returns next visit */ }
  }
  const onStageGesture = (event: { target: EventTarget }) => {
    if ((event.target as Element).closest?.('[data-label-avoid]')) return
    dismissHint(); setTourPlaying(false)
  }
  const copyLink = (place: CampusPlace) => {
    const url = `${window.location.origin}${window.location.pathname}${campusPlaceHash(PROJECT_ID, place.id)}`
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true); window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
    }).catch(() => undefined)
  }

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  // Keep the address shareable: #buet-campus-map/<place> follows the selection.
  useEffect(() => {
    if (window.location.hash.replace(/^#/, '').split('/')[0] !== PROJECT_ID) return
    const next = campusPlaceHash(PROJECT_ID, selectedVisible?.id ?? null)
    if (window.location.hash !== next) window.history.replaceState(window.history.state, '', next)
  }, [selectedVisible?.id])
  useEffect(() => {
    const onHash = () => {
      const id = campusPlaceIdFromHash(window.location.hash, PROJECT_ID, placeIds)
      const place = campusPlaces.find((item) => item.id === id)
      if (place) { setCategory('all'); setQuery(''); focusPlace(place) }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [focusPlace])

  useEffect(() => {
    if (tourStep === null || !tourPlaying) return
    const timer = window.setTimeout(() => {
      if (tourStep < tourPlaces.length - 1) goToStop(tourStep + 1)
      else setTourPlaying(false)
    }, TOUR_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [tourStep, tourPlaying, goToStop])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (!containerRef.current?.contains(target) || target.closest('input, textarea, select')) return
      if (event.key === 'Escape' && (tourStep !== null || selectedId)) {
        if (tourStep !== null) endTour(); else setSelectedId(null)
      } else if (tourStep !== null && (event.key === 'ArrowRight' || event.key === 'ArrowLeft') && !target.closest('canvas, svg')) {
        goToStop(clamp(tourStep + (event.key === 'ArrowRight' ? 1 : -1), 0, tourPlaces.length - 1))
      } else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tourStep, selectedId, goToStop])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      const anchor = screenPoint(event.clientX, event.clientY)
      const deltaY = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? svg.clientHeight : 1)
      setCamera((current) => zoomCamera(current, Math.exp(-deltaY * .002), anchor))
    }
    svg.addEventListener('wheel', wheel, { passive: false })
    return () => svg.removeEventListener('wheel', wheel)
  }, [screenPoint, is3D])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(() => setStageSize({ width: stage.clientWidth || WIDTH, height: stage.clientHeight || HEIGHT }))
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])
  // 2D labels steer clear of the on-map controls, cards and hints.
  useLayoutEffect(() => {
    if (is3D) return
    const next = avoidRects(stageRef.current)
    setReserved2d((current) => JSON.stringify(current) === JSON.stringify(next) ? current : next)
  }, [is3D, stageSize, tourStep, showHint, selectedVisible?.id, fullscreen])

  useEffect(() => {
    const onFullscreen = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => document.removeEventListener('fullscreenchange', onFullscreen)
  }, [])
  const toggleFullscreen = async () => {
    setFullscreenError('')
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch { setFullscreenError('Fullscreen is unavailable in this browser. You can still zoom and pan the map.') }
  }

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest('[data-map-place]') || event.button !== 0) return
    pointers.current.set(event.pointerId, screenPoint(event.clientX, event.clientY))
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    const next = screenPoint(event.clientX, event.clientY)
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1]
    if (other) {
      const oldDistance = Math.hypot(previous[0] - other[0], previous[1] - other[1])
      const newDistance = Math.hypot(next[0] - other[0], next[1] - other[1])
      const midpoint: Point = [(previous[0] + other[0]) / 2, (previous[1] + other[1]) / 2]
      setCamera((current) => {
        const zoomed = zoomCamera(current, oldDistance > 1 ? newDistance / oldDistance : 1, midpoint)
        return constrain({ ...zoomed, x: zoomed.x + (next[0] - previous[0]) / 2, y: zoomed.y + (next[1] - previous[1]) / 2 })
      })
    } else {
      setCamera((current) => constrain({ ...current, x: current.x + next[0] - previous[0], y: current.y + next[1] - previous[1] }))
    }
    pointers.current.set(event.pointerId, next)
  }
  const onPointerEnd = (event: ReactPointerEvent<SVGSVGElement>) => { pointers.current.delete(event.pointerId) }

  const buildings = useMemo(() => geometry.buildings.map((building) => ({ ...building, projected: building.points.map(toMapPoint) })), [])
  const terrain = useMemo(() => <>
    <g className="buet-map-greens">{geometry.greens.map((green) => {
      const place = placeByGreen.get(green.id)
      const active = place && (place.id === selectedVisible?.id || place.id === hoveredId)
      return <g key={green.id} className={`${green.kind === 'water' ? 'is-water' : ''} ${active ? 'is-highlighted' : ''}`}><path d={polygonPath(green.points.map(toMapPoint))} /><path className="buet-grass-texture" style={{ fill: `url(#${patternId}-grass)` }} d={polygonPath(green.points.map(toMapPoint))} /></g>
    })}</g>
    <g className="buet-road-casings">{geometry.roads.map((road) => <path key={road.id} className={`buet-road buet-road-${road.kind}`} d={polygonPath(road.points.map(toMapPoint)).replace(/\s*[zZ]$/, '')} />)}</g>
    <g className="buet-roads">{geometry.roads.map((road) => <path key={road.id} className={`buet-road buet-road-${road.kind}`} d={polygonPath(road.points.map(toMapPoint)).replace(/\s*[zZ]$/, '')} />)}</g>
  </>, [patternId, hoveredId, selectedVisible?.id, placeByGreen])
  const buildingLayer = useMemo(() => <g className="buet-buildings">{buildings.map((building) => {
    const place = placeByBuilding.get(building.id)
    const active = place && (place.id === selectedVisible?.id || place.id === hoveredId)
    const muted = place && !visibleIds.has(place.id)
    const roofPath = [building.projected, ...(building.holes ?? []).map((ring) => ring.map(toMapPoint))].map(polygonPath).join(' ')
    return <g key={building.id} className={`buet-building ${place ? `buet-building-${place.category}` : 'buet-building-campus'} ${active ? 'is-highlighted' : ''} ${muted ? 'is-muted' : ''}`}>
      <path className="buet-building-roof" fillRule="evenodd" d={roofPath} />
    </g>
  })}</g>, [buildings, hoveredId, selectedVisible?.id, visibleIds, placeByBuilding])

  // Collision-free 2D labels: every pin stays, names appear only where they fit inside the stage.
  const markerLabels = useMemo(() => {
    const offsetX = (stageSize.width - WIDTH * displayScale) / 2, offsetY = (stageSize.height - HEIGHT * displayScale) / 2
    const screen = new globalThis.Map(places.map((place) => {
      const [x, y] = toMapPoint(place.coordinates)
      return [place.id, [offsetX + (x * camera.zoom + camera.x) * displayScale, offsetY + (y * camera.zoom + camera.y) * displayScale] as const]
    }))
    const pins = [...screen.values()].map(([x, y]) => ({ x: x - 17, y: y - 28, w: 34, h: 38 }))
    const tour = new Set(campusTour)
    const candidates = places.map((place) => {
      const [x, y] = screen.get(place.id)!
      const width = labelWidth(place.shortName)
      return { id: place.id, options: [{ x: x + 22, y: y - 24, w: width, h: 26 }, { x: x - 22 - width, y: y - 24, w: width, h: 26 }], pinned: place.id === selectedVisible?.id || place.id === hoveredId, priority: tour.has(place.id) ? 1 : 0 }
    })
    const placed = placeCampusLabels(labels ? candidates : candidates.filter((candidate) => candidate.pinned), stageSize, [...pins, ...reserved2d])
    return new globalThis.Map([...placed].map(([id, placement]) => [id, { x: placement.box.x - screen.get(id)![0], width: placement.box.w }]))
  }, [places, selectedVisible?.id, hoveredId, camera, displayScale, stageSize, reserved2d, labels])

  const selectedFootprints = selectedVisible ? geometry.buildings.filter((building) => selectedVisible.buildingIds.includes(building.id)) : []
  const selectedGreens = selectedVisible ? geometry.greens.filter((green) => selectedVisible.greenIds?.includes(green.id)) : []
  const footprintAreas = selectedFootprints.map((building) => ({ building, area: polygonAreaMeters(building.points, building.holes ?? []) }))
  const mappedArea = [...footprintAreas.map(({ area }) => area), ...selectedGreens.map((green) => polygonAreaMeters(green.points))].reduce((total, area) => total + area, 0)
  const levelDetails = selectedFootprints.map((building) => {
    const details = campusArchitecture[building.id]
    const levels = details?.levels ?? building.levels
    if (!levels) return null
    const basis = /official BUET/i.test(details?.note ?? '') ? 'official source'
      : /inferred|estimate/i.test(details?.note ?? '') ? 'photo estimate' : 'OpenStreetMap'
    return `${levels} ${levels === 1 ? 'level' : 'levels'} (${basis})`
  }).filter((detail): detail is string => detail !== null)
  const levelSummary = [...new Set(levelDetails)].map((detail) => {
    const count = levelDetails.filter((item) => item === detail).length
    return count > 1 ? `${count} footprints × ${detail}` : detail
  }).join(', ') || 'Storey count not mapped'
  const referencePhoto = selectedVisible && referenceFor(selectedVisible)
  const hoverPhoto = hoverPlace && referenceFor(hoverPlace)
  // Flip the hover card left before it would slide under the zoom controls on the right edge.
  const hoverLeft = hoverCard ? (hoverCard.x + 252 > stageSize.width - 64 ? Math.max(8, hoverCard.x - 252) : hoverCard.x + 16) : 0
  const hoverTop = hoverCard ? clamp(hoverCard.y + 16, 8, stageSize.height - (hoverPhoto ? 214 : 118)) : 0

  return (
    <div className={`buet-explorer ${is3D ? 'is-3d' : 'is-2d'} ${fullscreen ? 'is-fullscreen' : ''}`} ref={containerRef}>
      <header className="buet-masthead">
        <div className="buet-brand"><span className="buet-brand-icon"><Box size={22} /></span><div><span className="buet-kicker">BUET · Campus explorer</span><h3>A new perspective on familiar places.</h3></div></div>
        <div className="buet-masthead-meta">
          <span className="buet-stat"><strong>{campusPlaces.length}</strong> places</span>
          <span className="buet-stat"><strong>{geometry.buildings.length}</strong> mapped footprints</span>
          <a className="buet-location" href="https://www.openstreetmap.org/#map=17/23.7266/90.3910" target="_blank" rel="noopener noreferrer"><MapPin size={13} /> Palashi, Dhaka <ArrowUpRight size={13} /></a>
        </div>
      </header>

      <div className="buet-workspace">
        <aside className="buet-sidebar" ref={sidebarRef} aria-label="Campus places">
          {selectedVisible ? <div className={`buet-detail buet-detail-${selectedVisible.category}`} key={selectedVisible.id} aria-live="polite">
            <div className="buet-detail-nav">
              <button className="buet-back-button" onClick={closePlace}><ArrowLeft size={15} /> All places</button>
              <span className="buet-detail-position">{selectedIndex + 1} / {places.length}</span>
              <div className="buet-detail-steps">
                <button className="buet-icon-button" aria-label="Previous place" disabled={places.length < 2} onClick={() => explorePlace(places[(selectedIndex - 1 + places.length) % places.length])}><ChevronLeft size={16} /></button>
                <button className="buet-icon-button" aria-label="Next place" disabled={places.length < 2} onClick={() => explorePlace(places[(selectedIndex + 1) % places.length])}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="buet-detail-scroll">
              {referencePhoto && <figure className="buet-detail-photo">
                <a href={referencePhoto.sourceUrl} target="_blank" rel="noopener noreferrer"><img src={referencePhoto.path} alt={`${referencePhoto.label}, photographed in ${referencePhoto.year}`} width={960} height={640} /><span>Reference photo · {referencePhoto.year}<ExternalLink size={12} /></span></a>
                <figcaption>Photo: <a href={referencePhoto.sourceUrl} target="_blank" rel="noopener noreferrer">{referencePhoto.author}</a> · <a href={referencePhoto.licenseUrl} target="_blank" rel="noopener noreferrer">{referencePhoto.license}</a></figcaption>
              </figure>}
              <div className="buet-detail-head"><span className={`buet-place-number buet-${selectedVisible.category}`}>{placeNumber(selectedVisible)}</span><span className={`buet-chip buet-${selectedVisible.category}`}>{categoryLabel(selectedVisible.category)}</span></div>
              <h4>{selectedVisible.name}</h4>
              {selectedVisible.nameBn && <p className="buet-bangla" lang="bn">{selectedVisible.nameBn}</p>}
              <p className="buet-detail-description">{selectedVisible.description}</p>
              <div className="buet-detail-actions">
                <button className="buet-primary-button" onClick={() => walkTo(selectedVisible)}><Footprints size={15} /> Walk here</button>
                <a className="buet-secondary-button" href={getPlaceMapsUrl(selectedVisible.coordinates)} target="_blank" rel="noopener noreferrer"><Navigation size={14} /> Directions</a>
                <button className="buet-secondary-button" onClick={() => copyLink(selectedVisible)}>{copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? 'Copied' : 'Copy link'}</button>
              </div>
              <dl className="buet-facts" aria-label="Mapped coordinates and size">
                {selectedFootprints.length > 0 && <div><dt><Building2 size={13} aria-hidden /> Footprint</dt><dd>≈ {Math.round(mappedArea).toLocaleString()} m² · {selectedFootprints.length} mapped {selectedFootprints.length === 1 ? 'building' : 'buildings'}</dd></div>}
                {selectedFootprints.length > 0 && <div><dt><Building2 size={13} aria-hidden /> Height</dt><dd>{levelSummary}</dd></div>}
                {selectedFootprints.length === 0 && selectedGreens.length > 0 && <div><dt><Trees size={13} aria-hidden /> Open space</dt><dd>≈ {Math.round(mappedArea).toLocaleString()} m²</dd></div>}
                {selectedFootprints.length === 0 && selectedGreens.length === 0 && <div><dt><Flag size={13} aria-hidden /> Outline</dt><dd>Point feature · no outline mapped</dd></div>}
                <div><dt><MapPin size={13} aria-hidden /> Location</dt><dd>{selectedVisible.coordinates[1].toFixed(5)}° N, {selectedVisible.coordinates[0].toFixed(5)}° E</dd></div>
              </dl>
              {footprintAreas.length > 1 && <ul className="buet-footprint-list">{footprintAreas.map(({ building, area }) => <li key={building.id}>{building.name ?? 'Unnamed OpenStreetMap footprint'} · ≈ {Math.round(area).toLocaleString()} m²</li>)}</ul>}
              <p className="buet-detail-note">OpenStreetMap geometry retrieved {geometry.retrievedAt}. Area is the ground outline, not total floor area; heights are sourced or estimated.</p>
              <a className="buet-text-link" href={selectedVisible.sourceUrl} target="_blank" rel="noopener noreferrer">Place source <ExternalLink size={13} /></a>
            </div>
          </div> : <>
            <div className="buet-sidebar-heading"><span>Explore campus</span><span>{campusPlaces.length} places</span></div>
            <div className="buet-search"><Search size={17} aria-hidden /><input aria-label="Search campus places" placeholder="Find a building, hall, place…" value={query} onChange={(event) => { setQuery(event.target.value); endTour() }} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}</div>
            <div className="buet-filters" aria-label="Filter places by category">
              <button className={category === 'all' ? 'is-active' : ''} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All <span>{queryPlaces.length}</span></button>
              {CATEGORIES.map(({ id, label, Icon }) => <button key={id} className={category === id ? 'is-active' : ''} aria-pressed={category === id} onClick={() => setCategory(id)}><Icon size={13} aria-hidden />{label} <span>{queryPlaces.filter((place) => place.category === id).length}</span></button>)}
            </div>
            <div className="buet-results-heading" aria-live="polite"><span>{query ? 'Search results' : category === 'all' ? 'Campus directory' : categoryLabel(category)}</span><span>{places.length.toString().padStart(2, '0')}</span></div>
            <div className="buet-place-list">
              {places.map((place) => <button key={place.id} className="buet-place" aria-label={`Explore ${place.name}`} onClick={() => explorePlace(place)} onPointerEnter={() => setHoveredId(place.id)} onPointerLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(place.id)} onBlur={() => setHoveredId(null)}>
                <span className={`buet-place-number buet-${place.category}`}>{placeNumber(place)}</span><span><strong>{place.name}</strong><small>{categoryLabel(place.category)}{campusTour.includes(place.id) ? ' · Tour stop' : ''}</small></span><ArrowUpRight size={15} />
              </button>)}
              {places.length === 0 && <div className="buet-empty"><Search size={24} /><strong>No places found</strong><p>Try “library”, “CSE” or a hall name.</p><button onClick={() => { setQuery(''); setCategory('all') }}>Show all places</button></div>}
            </div>
            <div className="buet-tour-cta">
              <span className="buet-tour-icon"><Route size={20} /></span>
              <div><strong>New here? Take the campus trail.</strong><p>{tourPlaces.length} stops, about a minute, hands-free.</p></div>
              <button className="buet-primary-button" onClick={startTour}><Play size={14} /> Start</button>
            </div>
          </>}
        </aside>

        <div className="buet-map-column">
          <div className="buet-map-toolbar">
            <div className="buet-segment" aria-label="Map view"><button aria-pressed={is3D} className={is3D ? 'is-active' : ''} onClick={() => changeView(true)}><Box size={15} /> <span>3D</span></button><button aria-pressed={!is3D} className={!is3D ? 'is-active' : ''} onClick={() => changeView(false)}><Map size={15} /> <span>2D</span></button></div>
            {is3D && <div className="buet-segment" aria-label="3D camera mode"><button className={sceneMode === 'orbit' ? 'is-active' : ''} aria-pressed={sceneMode === 'orbit'} onClick={() => setSceneMode('orbit')}><Orbit size={15} /> <span>Orbit</span></button><button className={sceneMode === 'walk' ? 'is-active' : ''} aria-pressed={sceneMode === 'walk'} onClick={() => { setSceneMode('walk'); setTourPlaying(false) }}><Footprints size={15} /> <span>Walk</span></button></div>}
            {is3D && <button className="buet-tool-button" aria-pressed={lighting === 'evening'} aria-label={lighting === 'day' ? 'Switch to evening lighting' : 'Switch to daylight'} title={lighting === 'day' ? 'Evening lighting' : 'Daylight'} onClick={() => setLighting(lighting === 'day' ? 'evening' : 'day')}>{lighting === 'day' ? <Sun size={15} /> : <Moon size={15} />}<span>{lighting === 'day' ? 'Day' : 'Evening'}</span></button>}
            <div className="buet-toolbar-end">
              <button className={`buet-tool-button ${tourStep !== null ? 'is-active' : ''}`} aria-pressed={tourStep !== null} onClick={() => tourStep === null ? startTour() : endTour()}><Route size={15} /><span>{tourStep === null ? 'Tour' : 'End tour'}</span></button>
              <button className={`buet-icon-button ${labels ? 'is-active' : ''}`} aria-label="Show place names" aria-pressed={labels} title="Place names" onClick={() => setLabels(!labels)}><Tags size={16} /></button>
              <button className="buet-icon-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen campus map'} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
            </div>
          </div>
          <div ref={stageRef} className={`buet-map-stage ${is3D ? `is-3d-stage lighting-${lighting}` : ''} ${selectedVisible && tourStep === null ? 'has-peek' : ''} ${tourStep !== null ? 'has-tour' : ''}`} onPointerDownCapture={onStageGesture} onWheelCapture={onStageGesture}>
            {is3D ? <Suspense fallback={<div className="buet-scene-loading" role="status"><Box size={28} /><strong>Building your campus view…</strong><span>Geometry, materials & sunlight</span></div>}>
              <BuetCampusScene places={places} selectedId={selectedVisible?.id ?? null} hoveredId={hoveredId} labels={labels} cameraCommand={sceneCommand} lighting={lighting} mode={sceneMode} autoOrbit={tourPlaying && sceneMode === 'orbit'} priorityIds={campusTour} onSelect={explorePlace} onHover={onSceneHover} onViewChange={setSceneView} onError={onSceneError} />
            </Suspense> : <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="buet-map-svg" role="group" aria-label="Interactive BUET campus map" aria-describedby={`${patternId}-help`} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onLostPointerCapture={onPointerEnd} onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) event.preventDefault()
              if (event.key === 'Home') resetMap()
              else if (event.key === '+' || event.key === '=') setCamera((current) => zoomCamera(current, 1.25))
              else if (event.key === '-') setCamera((current) => zoomCamera(current, .8))
              else if (event.key.startsWith('Arrow')) setCamera((current) => constrain({ ...current, x: current.x + (event.key === 'ArrowLeft' ? 65 : event.key === 'ArrowRight' ? -65 : 0), y: current.y + (event.key === 'ArrowUp' ? 65 : event.key === 'ArrowDown' ? -65 : 0) }))
            }}>
              <defs><pattern id={`${patternId}-grass`} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="currentColor" /></pattern><clipPath id={`${patternId}-bounds`}><path d={polygonPath([[geometry.bounds.west, geometry.bounds.north], [geometry.bounds.east, geometry.bounds.north], [geometry.bounds.east, geometry.bounds.south], [geometry.bounds.west, geometry.bounds.south]].map(toMapPoint))} /></clipPath></defs>
              <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
                <g clipPath={`url(#${patternId}-bounds)`}>{terrain}{buildingLayer}</g>
                {places.map((place) => {
                  const [x, y] = toMapPoint(place.coordinates)
                  const active = place.id === selectedVisible?.id || place.id === hoveredId
                  const label = markerLabels.get(place.id)
                  return <g key={place.id} data-map-place="true" role="button" tabIndex={0} aria-label={`Select ${place.name}`} aria-pressed={selectedVisible?.id === place.id} className={`buet-marker buet-marker-${place.category} ${active ? 'is-active' : ''} ${selectedVisible?.id === place.id ? 'is-selected' : ''}`} transform={`translate(${x} ${y}) scale(${1 / (camera.zoom * displayScale)})`} onClick={() => explorePlace(place)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); explorePlace(place) } }} onPointerEnter={(event) => hoverFromPointer(place, event)} onPointerLeave={clearHover} onFocus={() => setHoveredId(place.id)} onBlur={() => setHoveredId(null)}>
                    <title>{place.name}</title><circle className="buet-marker-hit" cy="-11" r="23" /><circle className="buet-marker-halo" cy="-11" r="24" /><path className="buet-marker-pin" d="M0 9 L-7 0 A16 16 0 1 1 7 0 Z" /><text textAnchor="middle" y="-7" className="buet-marker-number">{placeNumber(place)}</text>
                    {label && <g className="buet-marker-label"><rect x={label.x} y="-24" width={label.width} height="26" rx="6" /><text x={label.x + 11} y="-6.5">{place.shortName}</text></g>}
                  </g>
                })}
              </g>
            </svg>}

            <div className="buet-map-controls" data-label-avoid>
              <button className="buet-compass" aria-label="Face north" title="Face north" disabled={!is3D} onClick={() => commandScene('north')}><svg style={{ transform: is3D ? `rotate(${-sceneView.heading}deg)` : undefined }} width="22" height="22" viewBox="0 0 22 22" aria-hidden><path d="M11 2 16 18 11 14.5 6 18Z" fill="currentColor" /><path d="M11 2v12.5L6 18Z" fill="var(--bm-surface)" opacity=".55" /></svg><span>N</span></button>
              {is3D && <div className="buet-controls-rotate"><button aria-label="Rotate campus left" title="Rotate left" onClick={() => commandScene('rotate-left')}><RotateCcw size={16} /></button><button aria-label="Rotate campus right" title="Rotate right" onClick={() => commandScene('rotate-right')}><RotateCw size={16} /></button></div>}
              <button aria-label="Zoom in on campus" title="Zoom in" disabled={!is3D && camera.zoom >= 5} onClick={() => is3D ? commandScene('zoom-in') : setCamera((current) => zoomCamera(current, 1.3))}><Plus size={17} /></button>
              <span className="buet-zoom-readout">{Math.round((is3D ? sceneView.zoom : camera.zoom) * 100)}%</span>
              <button aria-label="Zoom out of campus" title="Zoom out" disabled={!is3D && camera.zoom <= .8} onClick={() => is3D ? commandScene('zoom-out') : setCamera((current) => zoomCamera(current, 1 / 1.3))}><Minus size={17} /></button>
              <button aria-label="Reset campus map view" title="Fit campus to view" onClick={resetMap}><Maximize2 size={15} /></button>
            </div>

            {!is3D && <div className="buet-scale" aria-label="Map scale" data-label-avoid><span>{Math.round(projection.metersPerUnit * 100 / (camera.zoom * displayScale))} m</span><i /></div>}

            {showHint && <div className="buet-hint" id={`${patternId}-help`} role="note" data-label-avoid>
              <div><strong>{hint.title}</strong>{hint.lines.map((line) => <span key={line}>{line}</span>)}</div>
              <button aria-label="Dismiss tip" onClick={dismissHint}><X size={14} /></button>
            </div>}
            {!showHint && <span className="buet-visually-hidden" id={`${patternId}-help`}>{hint.lines.join('. ')}</span>}

            {hoverPlace && hoverCard && hoverPlace.id !== selectedVisible?.id && <div className="buet-hover-card" style={{ left: hoverLeft, top: hoverTop }} aria-hidden>
              {hoverPhoto && <img src={hoverPhoto.path} alt="" width={960} height={640} />}
              <div><span className={`buet-hover-meta buet-${hoverPlace.category}`}><b>{placeNumber(hoverPlace)}</b>{categoryLabel(hoverPlace.category)}</span><strong>{hoverPlace.name}</strong><p>{hoverPlace.description}</p><small>Click to explore</small></div>
            </div>}

            {selectedVisible && tourStep === null && <div className="buet-peek" data-label-avoid>
              <button className="buet-peek-main" aria-label={`Show details for ${selectedVisible.name}`} onClick={() => sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                <span className={`buet-place-number buet-${selectedVisible.category}`}>{placeNumber(selectedVisible)}</span>
                <span><small>{categoryLabel(selectedVisible.category)} · details below</small><strong>{selectedVisible.name}</strong></span>
                <ChevronDown size={18} aria-hidden />
              </button>
              <button className="buet-icon-button" aria-label="Close place details" onClick={closePlace}><X size={15} /></button>
            </div>}

            {tourPlace && tourStep !== null && <div className="buet-tour-card" role="region" aria-label="Campus tour" data-label-avoid>
              <div className="buet-tour-card-top"><span>Campus trail</span><span>{tourStep + 1} / {tourPlaces.length}</span><button aria-label="End campus tour" onClick={endTour}><X size={15} /></button></div>
              <div className="buet-tour-card-body" aria-live="polite">
                {referenceFor(tourPlace) ? <img src={referenceFor(tourPlace)!.path} alt="" width={960} height={640} /> : <span className={`buet-tour-card-badge buet-${tourPlace.category}`}>{placeNumber(tourPlace)}</span>}
                <div><small>{categoryLabel(tourPlace.category)}</small><strong>{tourPlace.name}</strong><p>{tourPlace.description}</p></div>
              </div>
              <div className="buet-tour-card-controls">
                <button className="buet-icon-button" aria-label="Previous tour stop" disabled={tourStep === 0} onClick={() => goToStop(tourStep - 1)}><ChevronLeft size={17} /></button>
                <button className="buet-icon-button is-play" aria-label={tourPlaying ? 'Pause tour' : 'Play tour'} onClick={() => setTourPlaying(!tourPlaying)}>{tourPlaying ? <Pause size={15} /> : <Play size={15} />}</button>
                <button className="buet-icon-button" aria-label={tourStep === tourPlaces.length - 1 ? 'Finish tour' : 'Next tour stop'} onClick={() => tourStep === tourPlaces.length - 1 ? endTour() : goToStop(tourStep + 1)}>{tourStep === tourPlaces.length - 1 ? <Check size={16} /> : <ChevronRight size={17} />}</button>
                <div className="buet-tour-steps">{tourPlaces.map((place, index) => <button key={place.id} aria-label={`Stop ${index + 1}: ${place.shortName}`} aria-current={index === tourStep ? 'step' : undefined} className={index < tourStep ? 'is-complete' : index === tourStep ? 'is-current' : ''} onClick={() => goToStop(index)}>{index === tourStep && tourPlaying && <i key={tourStep} style={{ animationDuration: `${TOUR_INTERVAL}ms` }} />}</button>)}</div>
              </div>
            </div>}
          </div>
          <div className="buet-map-legend">
            {CATEGORIES.map(({ id, label }) => <span key={id}><i className={`buet-${id}`} />{label}</span>)}
            <span className="buet-legend-note"><Building2 size={13} /> Real footprints · façades & heights estimated</span>
            <a className="buet-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
          </div>
        </div>
      </div>

      {fullscreenError && <p className="buet-error" role="status">{fullscreenError}</p>}
      {sceneError && <p className="buet-error" role="status">The 3D view needs WebGL 2. Your browser is showing the interactive 2D map instead.</p>}
      <details className="buet-about"><summary><Info size={14} /> About the model & sources <ChevronRight size={14} /></summary><div><p>An independent 3D campus explorer built from OpenStreetMap building footprints, roads and open spaces. Only BUET is shown. OpenStreetMap's campus boundary also takes in some neighbours, so each building inside it was checked against Google Maps place labels: the Palashi Government Staff Colony, Azimpur Govt. Girls' School, the Public Auditorium, the Maternal & Child Health Training Institute, the Civil Surgeon Office, nearby shops and private houses, the fire station, Palashi Bazar and the Army recruiting HQ are left out. Roads stop at the campus edge. Footprints, roads and open spaces match the OpenStreetMap snapshot exactly. The seven photographed buildings take their façade colours and patterns from the dated reference photos; other façades, windows, street lamps and vegetation are generic estimates. Buildings without a mapped storey count are drawn at three storeys. The model is an interpretation of the campus, with approximate place pins and no indoor maps or verified accessible walking routes. Reference photographs may predate renovations; their dates and credits appear beside each photo.</p><p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL). <a href="https://www.openstreetmap.org/#map=17/23.7266/90.3910" target="_blank" rel="noopener noreferrer">View the area on OpenStreetMap <ExternalLink size={12} /></a></p><div className="buet-source-links">{campusSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={12} /></a>)}<a href="/maps/buet/credits.json" target="_blank" rel="noopener noreferrer">Reference photo credits <ExternalLink size={12} /></a><a href="/maps/buet-campus.osm" download>Download source map data <ExternalLink size={12} /></a></div></div></details>
    </div>
  )
}
