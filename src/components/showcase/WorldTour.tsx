import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eraser, ImageDown, ListChecks, Search, X, ZoomIn } from 'lucide-react'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/700.css'
import { Modal } from '@/components/ui/Modal'
import { CONTINENT_BN, countries, WORLD_HEIGHT, WORLD_WIDTH, type Continent, type Country } from '@/data/worldCountries'
import { PRESET_COLOURS, MAX_NAME_LENGTH } from '@/lib/travelMap'
import {
  CONTINENT_ORDER,
  continentProgress,
  parseWorldSaved,
  searchCountries,
  TOTAL_COUNTRIES,
  WORLD_STORAGE_KEY,
} from '@/lib/worldTour'
import { renderWorldTourPng } from '@/lib/worldTourImage'
import { bestLabelLayout, leaderArrow, type LabelItem } from '@/lib/districtLabels'
import { useUnitPx } from '@/hooks/useUnitPx'
import { measureBangla } from '@/lib/textMeasure'
import { toBn } from '@/lib/bangla'
import { ContinentPicker } from './ContinentPicker'
import './TravelMap.css'
import './WorldTour.css'

const UNVISITED_FILL = 'var(--line-strong)'
const CUSTOM_RING_GRADIENT = 'conic-gradient(#ef4444, #f59e0b, #22c55e, #0ea5e9, #6366f1, #a855f7, #ef4444)'
const VIEW_BOUNDS = { width: WORLD_WIDTH, height: WORLD_HEIGHT }
/** Font sizes for the visited countries' names on the page map, in map units, largest first. */
const PAGE_NAME_SIZES = [4, 3.6, 3.2, 3, 2.6, 2.3, 2, 1.8, 1.6, 1.4]

/** How countries get marked: tapping the map, typing a name, or ticking a continent's countries. */
type InputMode = 'tap' | 'search' | 'continent'

const INPUT_MODES: { id: InputMode; label: string }[] = [
  { id: 'tap', label: 'ট্যাপ করে বাছুন' },
  { id: 'search', label: 'খুঁজে যোগ করুন' },
  { id: 'continent', label: 'মহাদেশ অনুযায়ী' },
]

/** Storage can be blocked (private windows, strict settings). Then the map is simply not remembered. */
function readSaved() {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(WORLD_STORAGE_KEY)
  } catch {
    // Start from an empty map.
  }
  return parseWorldSaved(raw)
}

function writeSaved(visited: ReadonlySet<string>, colour: string, name: string) {
  try {
    window.localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify({ visited: [...visited], colour, name }))
  } catch {
    // The map still works for this visit.
  }
}

interface ShapeProps {
  country: Country
  on: boolean
  colour: string
  onToggle: (id: string) => void
  onHover: (country: Country | null) => void
}

/**
 * One country. The map is drawn three times (-360, 0, +360) so countries across the antimeridian
 * appear at both edges. Only the central copy is the focusable control; all three respond to a tap.
 */
const CountryShape = memo(function CountryShape({ country, on, colour, onToggle, onHover }: ShapeProps) {
  const style = { fill: on ? colour : UNVISITED_FILL }
  const handlers = {
    onClick: () => onToggle(country.id),
    onPointerEnter: () => onHover(country),
    onPointerLeave: () => onHover(null),
  }
  return (
    <g>
      <path d={country.d} fillRule="evenodd" className="world-country" style={style} transform="translate(-360 0)" {...handlers} />
      <path
        d={country.d}
        fillRule="evenodd"
        className="world-country"
        style={style}
        role="checkbox"
        aria-checked={on}
        aria-label={country.nameBn}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle(country.id)
          }
        }}
        onFocus={() => onHover(country)}
        onBlur={() => onHover(null)}
        {...handlers}
      />
      <path d={country.d} fillRule="evenodd" className="world-country" style={style} transform="translate(360 0)" {...handlers} />
    </g>
  )
})

export function WorldTour() {
  const [saved] = useState(readSaved)
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set(saved.visited))
  const [colour, setColour] = useState(saved.colour)
  const [name, setName] = useState(saved.name)
  const [hovered, setHovered] = useState<Country | null>(null)
  const [image, setImage] = useState<{ url: string; signature: string } | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [failed, setFailed] = useState(false)
  const [viewing, setViewing] = useState(false)
  const closeView = useCallback(() => setViewing(false), [])
  const [mode, setMode] = useState<InputMode>('tap')
  const [query, setQuery] = useState('')
  // The continent whose picker is open. Null means the picker is closed.
  const [pickerContinent, setPickerContinent] = useState<Continent | null>(null)
  const closePicker = useCallback(() => setPickerContinent(null), [])
  const applyPicker = useCallback((next: ReadonlySet<string>) => {
    setVisited(new Set(next))
    setPickerContinent(null)
  }, [])

  // Names are placed once the Bangla font is ready, so that they are measured correctly.
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    const done = () => setFontsReady(true)
    if (!('fonts' in document)) return done()
    document.fonts.load('700 18px "Hind Siliguri"', countries.map((c) => c.nameBn).join('')).then(done, done)
  }, [])
  // Only the visited countries are named on the page; every country is named on the saved picture.
  const visitedLabels = useMemo(() => {
    if (!fontsReady) return null
    const items: LabelItem[] = countries
      .filter((c) => visited.has(c.id))
      .map((c) => ({ id: c.id, text: c.nameBn, x: c.label[0], y: c.label[1] }))
    return bestLabelLayout(items, measureBangla, VIEW_BOUNDS, PAGE_NAME_SIZES)
  }, [fontsReady, visited])

  // The arrowhead is about 9 screen pixels long, whatever the size of the map.
  const svgRef = useRef<SVGSVGElement>(null)
  const unitPx = useUnitPx(svgRef, WORLD_WIDTH)
  const headLength = 9 / unitPx

  useEffect(() => writeSaved(visited, colour, name), [visited, colour, name])

  // Frees a picture's object URL when a newer one replaces it, and when the map unmounts.
  const imageUrl = image?.url
  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const toggle = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const count = visited.size
  const percent = Math.round((count / TOTAL_COUNTRIES) * 100)
  const progress = continentProgress(visited)
  const matches = searchCountries(query)
  const signature = `${colour}|${name}|${[...visited].sort().join(',')}`
  // A picture only matches the map it was drawn from, so any change hides it until it is regenerated.
  const preview = image && image.signature === signature ? image : null
  const customColour = !PRESET_COLOURS.some((c) => c.value.toLowerCase() === colour.toLowerCase())
  const previewAlt = `${toBn(count)}টি দেশ ভ্রমণের বিশ্ব মানচিত্র`

  const generate = async () => {
    setDrawing(true)
    setFailed(false)
    try {
      const blob = await renderWorldTourPng({ visited, colour, name })
      setImage({ url: URL.createObjectURL(blob), signature })
    } catch {
      setFailed(true)
    } finally {
      setDrawing(false)
    }
  }

  const readout = hovered
    ? `${hovered.nameBn} · ${CONTINENT_BN[hovered.continent]} · ${visited.has(hovered.id) ? 'ভ্রমণ করা হয়েছে' : 'এখনো যাওয়া হয়নি'}`
    : 'দেশে ক্লিক করে রং করুন। আবার ক্লিক করলে মুছে যাবে।'

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface-2/40 p-3 sm:p-5">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          role="group"
          aria-label="বিশ্বের দেশের মানচিত্র"
          className="block h-auto w-full"
        >
          <rect x={-WORLD_WIDTH} y={0} width={WORLD_WIDTH * 3} height={WORLD_HEIGHT} fill="var(--surface)" />
          {countries.map((c) => (
            <CountryShape
              key={c.id}
              country={c}
              on={visited.has(c.id)}
              colour={colour}
              onToggle={toggle}
              onHover={setHovered}
            />
          ))}
          {visitedLabels &&
            visitedLabels.placed.map((p) => {
              if (!p.leader) return null
              const arrow = leaderArrow(p.leader, headLength)
              return (
                <g key={`leader-${p.id}`}>
                  <path d={arrow.curve} className="map-leader" />
                  <path d={arrow.head} className="map-arrowhead" />
                </g>
              )
            })}
          {visitedLabels &&
            visitedLabels.placed.map((p) => (
              <text
                key={p.id}
                x={p.x}
                y={p.y}
                fontSize={visitedLabels.size}
                textAnchor="middle"
                dominantBaseline="central"
                className="map-label is-on"
                aria-hidden="true"
              >
                {countries.find((c) => c.id === p.id)?.nameBn}
              </text>
            ))}
        </svg>
      </div>
      <p className="bn mt-4 min-h-6 text-sm text-ink-2">{readout}</p>
      <p className="mt-1 text-xs text-ink-3">মানচিত্র: Natural Earth (public domain)।</p>
      {visitedLabels && visitedLabels.hidden.length > 0 && (
        <p className="bn mt-1 text-xs text-ink-3">
          {toBn(visitedLabels.hidden.length)}টি দেশের নাম জায়গা না পাওয়ায় মানচিত্রে দেখানো যায়নি। দেশে ক্লিক করলে নাম দেখাবে।
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <div>
            <div role="group" aria-label="দেশ যোগ করার উপায়" className="seg flex w-full">
              {INPUT_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className="flex-1 justify-center"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'search' && (
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" />
                  <input
                    id="country-search"
                    type="search"
                    aria-label="দেশ খুঁজুন"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const first = matches.find((c) => !visited.has(c.id))
                      if (first) toggle(first.id)
                    }}
                    placeholder="ইংরেজি বা বাংলায় দেশের নাম লিখুন"
                    autoComplete="off"
                    className="bn w-full rounded-xl border border-line-strong bg-surface py-2.5 pr-3 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent-ink focus:outline-none"
                  />
                </div>
                {query.trim() === '' ? (
                  <p className="text-xs text-ink-3">Enter চাপলে এখনো যোগ হয়নি এমন প্রথম দেশটি যোগ হবে।</p>
                ) : matches.length === 0 ? (
                  <p className="text-xs text-ink-3">“{query.trim()}” নামে কোনো দেশ নেই।</p>
                ) : (
                  <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface">
                    {matches.map((c) => {
                      const on = visited.has(c.id)
                      return (
                        <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="min-w-0 truncate">
                            <span className="bn text-sm text-ink">{c.nameBn}</span>
                            <span className="ml-2 text-xs text-ink-3">{CONTINENT_BN[c.continent]}</span>
                          </span>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(c.id)}
                            className="chip shrink-0 py-1 text-xs"
                          >
                            {on ? 'যোগ হয়েছে ✓' : 'যোগ করুন'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {mode === 'continent' && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {progress.map((p) => (
                    <button
                      key={p.continent}
                      type="button"
                      onClick={() => setPickerContinent(p.continent)}
                      className="rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-accent-ink"
                    >
                      <span className="bn block text-sm text-ink">{CONTINENT_BN[p.continent]}</span>
                      <span className="block font-mono text-[0.7rem] text-ink-3">
                        {toBn(p.visited)}/{toBn(p.total)}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost w-full py-2 text-sm"
                  onClick={() => setPickerContinent(CONTINENT_ORDER[0] ?? null)}
                >
                  <ListChecks size={15} /> মহাদেশ ধরে দেশ বাছুন
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="world-tour-name" className="eyebrow">
              আপনার নাম (ছবিতে দেখাবে)
            </label>
            <input
              id="world-tour-name"
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম"
              autoComplete="name"
              className="bn mt-3 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-3 focus:border-accent-ink focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">ভ্রমণ করা দেশ</p>
              <p className="mt-2 font-display text-6xl leading-none font-bold tracking-tight">
                {toBn(count)}
                <span className="text-3xl font-semibold text-ink-3"> / {toBn(TOTAL_COUNTRIES)}</span>
              </p>
            </div>
            <p className="font-mono text-sm text-ink-2">{toBn(percent)}%</p>
          </div>
          <div
            role="progressbar"
            aria-label="ভ্রমণ করা দেশ"
            aria-valuemin={0}
            aria-valuemax={TOTAL_COUNTRIES}
            aria-valuenow={count}
            className="-mt-4 h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%`, background: colour }}
            />
          </div>

          <div>
            <p className="eyebrow">রং</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {PRESET_COLOURS.map((c) => {
                const on = colour.toLowerCase() === c.value.toLowerCase()
                return (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    aria-label={`${c.name} রং`}
                    aria-pressed={on}
                    onClick={() => setColour(c.value)}
                    className="size-9 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110"
                    style={{
                      background: c.value,
                      boxShadow: on ? `0 0 0 2px var(--surface), 0 0 0 4px ${c.value}` : undefined,
                    }}
                  />
                )
              })}
              <div
                title="যেকোনো রং বাছুন"
                className="relative size-9 overflow-hidden rounded-full transition-transform duration-200 hover:scale-110"
                style={{
                  background: CUSTOM_RING_GRADIENT,
                  boxShadow: customColour ? `0 0 0 2px var(--surface), 0 0 0 4px ${colour}` : undefined,
                }}
              >
                <input
                  type="color"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  aria-label="নিজের পছন্দের রং"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">মহাদেশ অনুযায়ী</p>
            <ul className="mt-3 space-y-2.5">
              {progress.map((p) => (
                <li key={p.continent} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
                  <span className="bn text-ink-2">{CONTINENT_BN[p.continent]}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full transition-[width] duration-500 ease-out"
                      style={{ width: `${(p.visited / p.total) * 100}%`, background: colour }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs text-ink-3">
                    {toBn(p.visited)}/{toBn(p.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-primary disabled:pointer-events-none disabled:opacity-40"
                onClick={generate}
                disabled={count === 0 || drawing}
              >
                <ImageDown size={17} /> {drawing ? 'আঁকা হচ্ছে…' : 'ছবি তৈরি করুন'}
              </button>
              <button
                type="button"
                className="btn btn-ghost disabled:pointer-events-none disabled:opacity-40"
                onClick={() => setVisited(new Set<string>())}
                disabled={count === 0}
              >
                <Eraser size={16} /> মানচিত্র মুছুন
              </button>
            </div>
            {failed && (
              <p role="alert" className="text-sm text-accent-ink">
                এই ব্রাউজারে ছবি আঁকা যায়নি। আবার চেষ্টা করুন।
              </p>
            )}
            <p className="text-xs text-ink-3">আপনার নাম, দেশ ও রং শুধু এই ব্রাউজারে সংরক্ষিত থাকে।</p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="mt-10 grid gap-6 rounded-2xl border border-line bg-surface-2/50 p-5 sm:p-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:items-center">
          <button
            type="button"
            onClick={() => setViewing(true)}
            aria-label="মানচিত্র পূর্ণ আকারে দেখুন"
            className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-line"
          >
            <img
              src={preview.url}
              alt={previewAlt}
              className="block w-full transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-surface/80 text-ink backdrop-blur">
              <ZoomIn size={18} />
            </span>
          </button>
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">আপনার মানচিত্র তৈরি</p>
            <p className="mt-2 text-sm text-ink-2">
              আপনার নাম, ভ্রমণ করা দেশ ও রং নিয়ে PNG ছবি তৈরি হয়েছে। পূর্ণ আকারে দেখে নামিয়ে নিন। মানচিত্র বদলালে আবার
              তৈরি করুন।
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => setViewing(true)}>
                <ZoomIn size={17} /> পূর্ণ আকারে দেখুন
              </button>
              <a href={preview.url} download="world-tour.png" className="btn btn-primary">
                <Download size={17} /> PNG নামিয়ে নিন
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setViewing(false)
                  setImage(null)
                }}
              >
                <X size={16} /> বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={viewing && preview !== null} onClose={closeView} labelledBy="world-tour-view-title">
        {preview && (
          <div className="p-5 pt-16 sm:p-8 sm:pt-16">
            <h3 id="world-tour-view-title" className="font-display text-xl font-semibold tracking-tight">
              আপনার বিশ্ব ভ্রমণ মানচিত্র
            </h3>
            <img
              src={preview.url}
              alt={previewAlt}
              className="mx-auto mt-5 max-h-[62vh] w-auto max-w-full rounded-xl border border-line"
            />
            <div className="mt-6 flex justify-center">
              <a href={preview.url} download="world-tour.png" className="btn btn-primary">
                <Download size={17} /> PNG নামিয়ে নিন
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ContinentPicker
        open={pickerContinent !== null}
        continent={pickerContinent ?? CONTINENT_ORDER[0]!}
        visited={visited}
        onApply={applyPicker}
        onClose={closePicker}
      />
    </div>
  )
}
