import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, BookOpen, Box, Building2, Check, ChevronLeft, ChevronRight, ExternalLink, Flag, Footprints, GraduationCap, House, Info, Map, Maximize2, Minus, Moon, Orbit, Plus, RotateCcw, Search, Sun, Trees, Type, X } from 'lucide-react'
import { campusGeometry as geometry, campusPlaces, campusSources, campusTour, type CampusPlace } from '@/data/buetCampus'
import { campusArchitectureReferences } from '@/data/buetCampusArchitecture'
import { createCampusProjection, filterCampusPlaces, getPlaceMapsUrl, polygonPath } from '@/lib/buetCampus'
import type { CampusCameraCommand } from './BuetCampusScene'
import './BuetCampusMap.css'

const BuetCampusScene = lazy(() => import('./BuetCampusScene').then((module) => ({ default: module.BuetCampusScene })))
type Point = [number, number]
type Category = CampusPlace['category']
interface Camera { x: number; y: number; zoom: number }
const WIDTH = 1200
const HEIGHT = 900
const INITIAL_CAMERA: Camera = { x: 0, y: 0, zoom: 1 }
const CATEGORIES = [
  { id: 'academic', label: 'Academic', Icon: GraduationCap },
  { id: 'residential', label: 'Halls', Icon: House },
  { id: 'facilities', label: 'Facilities', Icon: BookOpen },
  { id: 'landmark', label: 'Landmarks', Icon: Flag },
] as const
// Fit the academic and residential core first; the larger source extract remains available by panning.
const projection = createCampusProjection({ west: 90.3878, south: 23.7238, east: 90.3956, north: 23.7284 }, WIDTH, HEIGHT, 65)
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
function categoryLabel(category: Category) { return CATEGORIES.find((item) => item.id === category)?.label ?? category }

export function BuetCampusMap() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [is3D, setIs3D] = useState(true)
  const [sceneMode, setSceneMode] = useState<'orbit' | 'walk'>('orbit')
  const [lighting, setLighting] = useState<'day' | 'evening'>('day')
  const [sceneCommand, setSceneCommand] = useState<CampusCameraCommand>({ kind: 'reset', sequence: 0 })
  const [sceneView, setSceneView] = useState({ zoom: 1, heading: 0 })
  const [sceneError, setSceneError] = useState(false)
  const [labels, setLabels] = useState(true)
  const [camera, setCamera] = useState<Camera>(INITIAL_CAMERA)
  const [tourStep, setTourStep] = useState<number | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const [displayScale, setDisplayScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new globalThis.Map<number, Point>())
  const patternId = useId().replace(/:/g, '')
  const places = useMemo(() => filterCampusPlaces(campusPlaces, query, category), [query, category])
  const visibleIds = useMemo(() => new Set(places.map((place) => place.id)), [places])
  const selected = campusPlaces.find((place) => place.id === selectedId)
  const selectedVisible = selected && visibleIds.has(selected.id) ? selected : undefined
  const referencePhoto = selectedVisible && campusArchitectureReferences.find((reference) => selectedVisible.buildingIds.includes(reference.buildingId))
  const placeByBuilding = useMemo(() => new globalThis.Map(campusPlaces.flatMap((place) => (place.buildingIds ?? []).map((id) => [id, place] as const))), [])

  const toMapPoint = useCallback((coordinate: readonly number[]): Point => projection.project([coordinate[0], coordinate[1]]), [])
  const screenPoint = useCallback((clientX: number, clientY: number): Point => {
    const matrix = svgRef.current?.getScreenCTM()
    if (!matrix) return [WIDTH / 2, HEIGHT / 2]
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
    return [point.x, point.y]
  }, [])

  const focusPlace = useCallback((place: CampusPlace, zoom = 2.2) => {
    const [x, y] = toMapPoint(place.coordinates)
    setCamera(constrain({ x: WIDTH / 2 - x * zoom, y: HEIGHT / 2 - y * zoom, zoom }))
    setSelectedId(place.id)
    setSceneCommand((current) => ({ kind: 'focus', placeId: place.id, sequence: current.sequence + 1 }))
  }, [toMapPoint])
  const explorePlace = (place: CampusPlace) => { setTourStep(null); focusPlace(place) }
  const moveTour = (step: number) => {
    const place = campusPlaces.find((item) => item.id === campusTour[step])
    if (!place) return
    setCategory('all'); setQuery(''); setTourStep(step); focusPlace(place)
  }
  const resetMap = () => {
    setCamera(INITIAL_CAMERA); setSelectedId(null); setTourStep(null); setHoveredId(null)
    setSceneCommand((current) => ({ kind: 'reset', sequence: current.sequence + 1 }))
  }
  const changeQuery = (value: string) => { setQuery(value); resetMap() }
  const changeCategory = (value: Category | 'all') => { setCategory(value); resetMap() }
  const changeView = (value: boolean) => {
    setIs3D(value); if (value) setSceneError(false); setSceneMode('orbit'); pointers.current.clear()
    if (selectedVisible) focusPlace(selectedVisible)
    else {
      setCamera(INITIAL_CAMERA)
      setSceneCommand((current) => ({ kind: 'reset', sequence: current.sequence + 1 }))
    }
  }
  const commandScene = (kind: CampusCameraCommand['kind']) => setSceneCommand((current) => ({ kind, sequence: current.sequence + 1 }))
  const onSceneError = useCallback(() => { setSceneError(true); setIs3D(false) }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && document.activeElement !== svg) return
      event.preventDefault()
      const anchor = screenPoint(event.clientX, event.clientY)
      setCamera((current) => zoomCamera(current, Math.exp(-event.deltaY * .002), anchor))
    }
    svg.addEventListener('wheel', wheel, { passive: false })
    return () => svg.removeEventListener('wheel', wheel)
  }, [screenPoint, is3D])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new ResizeObserver(() => {
      const rect = svg.getBoundingClientRect()
      setDisplayScale(Math.min(rect.width / WIDTH, rect.height / HEIGHT) || 1)
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [is3D])

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

  const buildings = useMemo(() => geometry.buildings.map((building) => {
    const points = building.points.map(toMapPoint)
    return { ...building, projected: points }
  }), [toMapPoint])

  const terrain = useMemo(() => <>
    <g className="buet-map-greens">{geometry.greens.map((green) => <g key={green.id} className={green.kind === 'water' ? 'is-water' : ''}><path d={polygonPath(green.points.map(toMapPoint))} /><path className="buet-grass-texture" style={{ fill: `url(#${patternId}-grass)` }} d={polygonPath(green.points.map(toMapPoint))} /></g>)}</g>
    <g className="buet-road-casings">{geometry.roads.map((road) => <path key={road.id} className={`buet-road buet-road-${road.kind}`} d={polygonPath(road.points.map(toMapPoint)).replace(/\s*[zZ]$/, '')} />)}</g>
    <g className="buet-roads">{geometry.roads.map((road) => <path key={road.id} className={`buet-road buet-road-${road.kind}`} d={polygonPath(road.points.map(toMapPoint)).replace(/\s*[zZ]$/, '')} />)}</g>
  </>, [toMapPoint, patternId])

  const buildingLayer = useMemo(() => <g className="buet-buildings">{buildings.map((building) => {
    const place = placeByBuilding.get(building.id)
    const active = place && (place.id === selectedVisible?.id || place.id === hoveredId)
    const muted = place && !visibleIds.has(place.id)
    const roofPath = [building.projected, ...(building.holes ?? []).map((ring) => ring.map(toMapPoint))].map(polygonPath).join(' ')
    return <g key={building.id} className={`buet-building ${place ? `buet-building-${place.category}` : ''} ${active ? 'is-highlighted' : ''} ${muted ? 'is-muted' : ''}`}>
      <path className="buet-building-roof" fillRule="evenodd" d={roofPath} />
    </g>
  })}</g>, [buildings, hoveredId, selectedVisible?.id, visibleIds, placeByBuilding, toMapPoint])

  // Keep labels readable at every zoom; prioritise the current selection and hover.
  const markerLabels = useMemo(() => {
    const boxes: { x: number; y: number; w: number }[] = []
    const accepted = new globalThis.Map<string, { x: number; width: number }>()
    const positions = places.map((place) => {
      const [x, y] = toMapPoint(place.coordinates)
      return { id: place.id, x: (x * camera.zoom + camera.x) * displayScale,
        y: (y * camera.zoom + camera.y) * displayScale }
    })
    const ordered = [...places].sort((a, b) => Number(b.id === selectedId || b.id === hoveredId) - Number(a.id === selectedId || a.id === hoveredId))
    for (const place of ordered) {
      const point = positions.find((position) => position.id === place.id)!
      const width = place.shortName.length * 8 + 20
      for (const offset of [22, -width - 22]) {
        const box = { x: point.x + offset, y: point.y - 31, w: width }
        const hitsLabel = boxes.some((other) => box.x < other.x + other.w && box.x + box.w > other.x && Math.abs(box.y - other.y) < 30)
        const hitsPin = positions.some((other) => other.id !== place.id && box.x < other.x + 18 && box.x + box.w > other.x - 18 && box.y < other.y + 8 && box.y + 27 > other.y - 29)
        if (!hitsLabel && !hitsPin) {
          accepted.set(place.id, { x: offset, width }); boxes.push(box); break
        }
      }
    }
    return accepted
  }, [places, selectedId, hoveredId, camera, toMapPoint, displayScale])

  return (
    <div className={`buet-explorer ${is3D ? 'is-3d' : ''}`} ref={containerRef}>
      <div className="buet-masthead">
        <div className="buet-brand"><span className="buet-brand-icon"><Box size={23} /></span><div><span className="buet-kicker">BUET · A campus in three dimensions</span><h3>A new perspective on familiar places.</h3></div></div>
        <span className="buet-location"><span /> Palashi, Dhaka <ArrowUpRight size={14} /></span>
      </div>

      <div className="buet-workspace">
        <aside className="buet-sidebar" aria-label="Campus places">
          <div className="buet-sidebar-heading"><span>EXPLORE CAMPUS</span><span>{campusPlaces.length} places</span></div>
          <div className="buet-search"><Search size={17} aria-hidden /><input aria-label="Search campus places" placeholder="Find a building, hall, place…" value={query} onChange={(event) => changeQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => changeQuery('')}><X size={15} /></button>}</div>
          <div className="buet-filters" aria-label="Filter places by category">
            <button className={category === 'all' ? 'is-active' : ''} aria-pressed={category === 'all'} onClick={() => changeCategory('all')}>All places</button>
            {CATEGORIES.map(({ id, label }) => <button key={id} className={category === id ? 'is-active' : ''} aria-pressed={category === id} onClick={() => changeCategory(id)}>{label}</button>)}
          </div>
          <div className="buet-results-heading" aria-live="polite"><span>{query ? 'Search results' : category === 'all' ? 'The campus directory' : categoryLabel(category)}</span><span>{places.length.toString().padStart(2, '0')}</span></div>
          <div className="buet-place-list">
            {places.map((place) => {
              const index = campusPlaces.findIndex((item) => item.id === place.id)
              return <button key={place.id} className={`buet-place ${selectedVisible?.id === place.id ? 'is-selected' : ''}`} aria-pressed={selectedVisible?.id === place.id} aria-label={`Explore ${place.name}`} onClick={() => explorePlace(place)} onPointerEnter={() => setHoveredId(place.id)} onPointerLeave={() => setHoveredId(null)}>
                <span className={`buet-place-number buet-${place.category}`}>{String(index + 1).padStart(2, '0')}</span><span><strong>{place.name}</strong><small>{categoryLabel(place.category)}</small></span>{selectedVisible?.id === place.id ? <Check size={15} /> : <ArrowUpRight size={15} />}
              </button>
            })}
            {places.length === 0 && <div className="buet-empty"><Search size={25} /><strong>No places found</strong><p>Try “library”, “CSE” or a hall name.</p><button onClick={() => { changeQuery(''); changeCategory('all') }}>Show all places</button></div>}
          </div>
          {selectedVisible ? <div className={`buet-place-detail buet-detail-${selectedVisible.category}`} aria-live="polite">
            <div className="buet-detail-top"><span>{categoryLabel(selectedVisible.category)}</span><button aria-label="Close place details" onClick={() => { setSelectedId(null); setTourStep(null) }}><X size={15} /></button></div>
            <h4>{selectedVisible.name}</h4>{selectedVisible.nameBn && <p className="buet-bangla" lang="bn">{selectedVisible.nameBn}</p>}<p>{selectedVisible.description}</p>
            {referencePhoto && <figure className="buet-reference-photo"><a href={referencePhoto.sourceUrl} target="_blank" rel="noopener noreferrer"><img src={referencePhoto.path} alt={`${referencePhoto.label}, photographed in ${referencePhoto.year}`} width={960} height={640} loading="lazy" /><span>Reference photo · {referencePhoto.year}<ExternalLink size={11} /></span></a><figcaption>Photo: <a href={referencePhoto.sourceUrl} target="_blank" rel="noopener noreferrer">{referencePhoto.author}</a> · <a href={referencePhoto.licenseUrl} target="_blank" rel="noopener noreferrer">{referencePhoto.license}</a></figcaption></figure>}
            <a href={getPlaceMapsUrl(selectedVisible.coordinates)} target="_blank" rel="noopener noreferrer">Directions in Google Maps <ExternalLink size={13} /></a>
          </div> : <div className="buet-sidebar-note"><Trees size={21} /><p>Big ideas. Familiar corners.<br /><strong>A campus worth exploring.</strong></p></div>}
        </aside>

        <div className="buet-map-column">
          <div className="buet-map-toolbar">
            <div className="buet-view-switch" aria-label="Map view"><button aria-pressed={is3D} className={is3D ? 'is-active' : ''} onClick={() => changeView(true)}><Box size={15} /> 3D campus</button><button aria-pressed={!is3D} className={!is3D ? 'is-active' : ''} onClick={() => changeView(false)}><Map size={15} /> 2D map</button></div>
            {is3D && <span className="buet-renderer-tag"><span /> Live 3D</span>}
            <div className="buet-toolbar-actions"><button className={`buet-icon-button ${labels ? 'is-active' : ''}`} aria-label="Toggle map labels" aria-pressed={labels} title="Map labels" onClick={() => setLabels(!labels)}><Type size={17} /></button><button className="buet-icon-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen campus map'} title="Fullscreen" onClick={() => void toggleFullscreen()}><Maximize2 size={17} /></button></div>
          </div>
          <div className={`buet-map-stage ${is3D ? `is-3d-stage lighting-${lighting}` : ''}`}>
            <div className="buet-map-caption" aria-hidden><span className="buet-kicker">BUET / DHAKA · 1000</span><span>{is3D ? sceneMode === 'walk' ? 'See campus from the ground.' : 'Explore from any angle.' : 'Every corner has a story.'}</span></div>
            {is3D ? <>
              <Suspense fallback={<div className="buet-scene-loading" role="status"><Box size={30} /><strong>Building your campus view…</strong><span>Geometry, materials & sunlight</span></div>}>
                <BuetCampusScene places={places} selectedId={selectedVisible?.id ?? null} hoveredId={hoveredId} labels={labels} cameraCommand={sceneCommand} lighting={lighting} mode={sceneMode} onSelect={explorePlace} onViewChange={setSceneView} onError={onSceneError} />
              </Suspense>
              <div className="buet-scene-settings">
                <div className="buet-scene-segment" aria-label="3D camera mode"><button className={sceneMode === 'orbit' ? 'is-active' : ''} aria-pressed={sceneMode === 'orbit'} onClick={() => setSceneMode('orbit')}><Orbit size={14} /> Orbit</button><button className={sceneMode === 'walk' ? 'is-active' : ''} aria-pressed={sceneMode === 'walk'} onClick={() => setSceneMode('walk')}><Footprints size={14} /> Walk</button></div>
                <button className="buet-light-button" aria-label={lighting === 'day' ? 'Switch to evening lighting' : 'Switch to daylight'} onClick={() => setLighting(lighting === 'day' ? 'evening' : 'day')}>{lighting === 'day' ? <Sun size={15} /> : <Moon size={15} />}<span>{lighting === 'day' ? 'Daylight' : 'Evening'}</span></button>
              </div>
            </> : <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="buet-map-svg" role="group" aria-label="Interactive BUET campus map" aria-describedby={`${patternId}-help`} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onLostPointerCapture={onPointerEnd} onKeyDown={(event) => {
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
                  const number = campusPlaces.findIndex((item) => item.id === place.id) + 1
                  const active = place.id === selectedVisible?.id || place.id === hoveredId
                  const label = markerLabels.get(place.id)
                  return <g key={place.id} data-map-place="true" role="button" tabIndex={0} aria-label={`Select ${place.name}`} aria-pressed={selectedVisible?.id === place.id} className={`buet-marker buet-marker-${place.category} ${active ? 'is-active' : ''}`} transform={`translate(${x} ${y}) scale(${1 / (camera.zoom * displayScale)})`} onClick={() => explorePlace(place)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); explorePlace(place) } }} onPointerEnter={() => setHoveredId(place.id)} onPointerLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(place.id)} onBlur={() => setHoveredId(null)}>
                    <title>{place.name}</title><circle className="buet-marker-hit" cy="-11" r="23" /><circle className="buet-marker-halo" cy="-11" r="24" /><path className="buet-marker-pin" d="M0 9 L-7 0 A16 16 0 1 1 7 0 Z" /><text textAnchor="middle" y="-7" className="buet-marker-number">{String(number).padStart(2, '0')}</text>
                    {labels && label && <g className="buet-marker-label"><rect x={label.x} y="-31" width={label.width} height="27" rx="5" /><text x={label.x + 10} y="-13">{place.shortName}</text></g>}
                  </g>
                })}
              </g>
            </svg>}
            <div className="buet-compass" title="North direction"><span>N</span><svg style={{ transform: is3D ? `rotate(${-sceneView.heading}deg)` : undefined }} width="28" height="37" viewBox="0 0 28 37" aria-hidden><path d="M14 1 25 34 14 26 3 34Z" fill="currentColor" /><path d="M14 1v25L3 34Z" fill="var(--bm-paper)" opacity=".6" /></svg></div>
            <div className="buet-map-controls">
              {is3D && <><button aria-label="Rotate campus left" title="Rotate left" onClick={() => commandScene('rotate-left')}><ChevronLeft size={18} /></button><button aria-label="Rotate campus right" title="Rotate right" onClick={() => commandScene('rotate-right')}><ChevronRight size={18} /></button></>}
              <button aria-label="Zoom in on campus" title="Zoom in" disabled={!is3D && camera.zoom >= 5} onClick={() => is3D ? commandScene('zoom-in') : setCamera((current) => zoomCamera(current, 1.3))}><Plus size={18} /></button><span>{Math.round((is3D ? sceneView.zoom : camera.zoom) * 100)}%</span><button aria-label="Zoom out of campus" title="Zoom out" disabled={!is3D && camera.zoom <= .8} onClick={() => is3D ? commandScene('zoom-out') : setCamera((current) => zoomCamera(current, 1 / 1.3))}><Minus size={18} /></button><button aria-label="Reset campus map view" title="Fit campus to view" onClick={resetMap}><RotateCcw size={16} /></button>
            </div>
            {is3D ? <div className="buet-model-caption"><span>ARCHITECTURAL EXPLORER</span><small>Mapped footprints · Estimated building details</small></div> : <div className="buet-scale" aria-label="Map scale"><span>{Math.round(projection.metersPerUnit * 100 / (camera.zoom * displayScale))} m</span><i /></div>}
            <span className={`buet-map-hint ${is3D ? 'buet-3d-hint' : ''}`} id={`${patternId}-help`}>{is3D ? sceneMode === 'walk' ? 'WASD / arrows to move · Drag to look' : 'Drag to orbit · Right-drag to pan · Scroll to zoom' : 'Drag to explore · Pinch or Ctrl + scroll to zoom'}<br /><span>{is3D ? sceneMode === 'walk' ? 'Select a place to move nearby. Return to Orbit for an aerial view.' : 'Touch: one finger to orbit, two fingers to pan or zoom.' : 'Keyboard: arrows to pan, + / − to zoom, Home to reset.'}</span></span>
            {tourStep !== null && <div className="buet-tour-overlay" aria-live="polite"><div><span>THE CAMPUS TRAIL</span><strong>{tourStep + 1} <small>/ {campusTour.length}</small></strong></div><p>{campusPlaces.find((place) => place.id === campusTour[tourStep])?.shortName}</p><button aria-label="End campus tour" onClick={() => setTourStep(null)}><X size={16} /></button><div className="buet-tour-progress">{campusTour.map((id, index) => <span key={id} className={index <= tourStep ? 'is-complete' : ''} />)}</div></div>}
          </div>
          <div className="buet-map-legend">{CATEGORIES.map(({ id, label }) => <span key={id}><i className={`buet-${id}`} />{label}</span>)}<span className="buet-footprints"><Building2 size={12} /> Real building footprints</span><a className="buet-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></div>
        </div>
      </div>

      <div className="buet-tour-bar"><span className="buet-tour-icon"><ArrowDownLeft size={23} /></span><div><strong>{tourStep === null ? 'New here? Take the scenic route.' : tourStep === campusTour.length - 1 ? 'You’ve reached the last stop.' : 'One campus. So many perspectives.'}</strong><p>{tourStep === null ? `An ${campusTour.length}-stop introduction to the places that make this campus.` : 'Explore each stop on the map, then continue at your own pace.'}</p></div>{tourStep === null ? <button className="buet-primary-button" onClick={() => moveTour(0)}>Take a virtual tour <ArrowUpRight size={16} /></button> : <div className="buet-tour-navigation"><button className="buet-icon-button" aria-label="Previous tour stop" disabled={tourStep === 0} onClick={() => moveTour(tourStep - 1)}><ChevronLeft size={18} /></button><button className="buet-primary-button" onClick={() => tourStep === campusTour.length - 1 ? resetMap() : moveTour(tourStep + 1)}>{tourStep === campusTour.length - 1 ? 'Finish tour' : 'Next stop'}<ChevronRight size={16} /></button></div>}</div>
      {fullscreenError && <p className="buet-error" role="status">{fullscreenError}</p>}
      {sceneError && <p className="buet-error" role="status">The 3D view needs WebGL 2. Your browser is showing the interactive 2D map instead.</p>}
      <details className="buet-about"><summary><Info size={13} /> About the model & sources <ChevronRight size={13} /></summary><div><p>An independent 3D campus explorer built from OpenStreetMap building footprints, roads and open spaces. Façades, windows, vegetation and unsourced heights are architectural estimates. The model is an interpretation of the campus, with approximate place pins and no indoor maps or verified accessible walking routes. Reference photographs may predate renovations; their dates and credits appear beside each photo.</p><p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL). <a href="https://www.openstreetmap.org/#map=17/23.7266/90.3910" target="_blank" rel="noopener noreferrer">View the area on OpenStreetMap <ExternalLink size={11} /></a></p><div className="buet-source-links">{campusSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={11} /></a>)}<a href="/maps/buet/credits.json" target="_blank" rel="noopener noreferrer">Reference photo credits <ExternalLink size={11} /></a><a href="/maps/buet-campus.osm" download>Download source map data <ExternalLink size={11} /></a></div></div></details>
    </div>
  )
}
