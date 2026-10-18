import { memo, useCallback, useEffect, useState } from 'react'
import { Download, Eraser, ImageDown, ListChecks, Search, X, ZoomIn } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { DivisionPicker } from './DivisionPicker'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/700.css'
import {
  DIVISIONS,
  DIVISION_BN,
  districts,
  MAP_HEIGHT,
  MAP_WIDTH,
  type District,
  type Division,
} from '@/data/bangladeshDistricts'
import { renderTravelMapPng } from '@/lib/travelMapImage'
import {
  divisionProgress,
  MAX_NAME_LENGTH,
  parseSaved,
  PRESET_COLOURS,
  searchDistricts,
  TOTAL_DISTRICTS,
} from '@/lib/travelMap'
import { toBn } from '@/lib/bangla'
import './TravelMap.css'

const STORAGE_KEY = 'bangladesh-travel-map'
const UNVISITED_FILL = 'var(--line-strong)'
const CUSTOM_RING_GRADIENT = 'conic-gradient(#ef4444, #f59e0b, #22c55e, #0ea5e9, #6366f1, #a855f7, #ef4444)'

/** How districts get marked: tapping the map, typing a name, or ticking a division's districts. */
type InputMode = 'tap' | 'search' | 'division'

const INPUT_MODES: { id: InputMode; label: string }[] = [
  { id: 'tap', label: 'ট্যাপ করে বাছুন' },
  { id: 'search', label: 'খুঁজে যোগ করুন' },
  { id: 'division', label: 'বিভাগ অনুযায়ী' },
]

/** Storage can be blocked (private windows, strict settings). Then the map is simply not remembered. */
function readSaved() {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Start from an empty map.
  }
  return parseSaved(raw)
}

function writeSaved(visited: ReadonlySet<string>, colour: string, name: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ visited: [...visited], colour, name }))
  } catch {
    // The map still works for this visit.
  }
}

interface ShapeProps {
  district: District
  on: boolean
  colour: string
  onToggle: (id: string) => void
  onHover: (district: District | null) => void
}

/** One district. Memoised, so hovering one district does not repaint all 64. */
const Shape = memo(function Shape({ district, on, colour, onToggle, onHover }: ShapeProps) {
  return (
    <path
      d={district.d}
      fillRule="evenodd"
      className="map-district"
      role="checkbox"
      aria-checked={on}
      aria-label={district.nameBn}
      tabIndex={0}
      style={{ fill: on ? colour : UNVISITED_FILL }}
      onClick={() => onToggle(district.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle(district.id)
        }
      }}
      onPointerEnter={() => onHover(district)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(district)}
      onBlur={() => onHover(null)}
    />
  )
})

export function TravelMap() {
  const [saved] = useState(readSaved)
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set(saved.visited))
  const [colour, setColour] = useState(saved.colour)
  const [name, setName] = useState(saved.name)
  const [hovered, setHovered] = useState<District | null>(null)
  const [image, setImage] = useState<{ url: string; signature: string } | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [failed, setFailed] = useState(false)
  const [viewing, setViewing] = useState(false)
  const closeView = useCallback(() => setViewing(false), [])
  const [mode, setMode] = useState<InputMode>('tap')
  const [query, setQuery] = useState('')
  // The division whose picker is open. Null means the picker is closed.
  const [pickerDivision, setPickerDivision] = useState<Division | null>(null)
  const closePicker = useCallback(() => setPickerDivision(null), [])
  const applyPicker = useCallback((next: ReadonlySet<string>) => {
    setVisited(new Set(next))
    setPickerDivision(null)
  }, [])

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
  const percent = Math.round((count / TOTAL_DISTRICTS) * 100)
  const progress = divisionProgress(visited)
  const matches = searchDistricts(query)
  const signature = `${colour}|${name}|${[...visited].sort().join(',')}`
  // A picture only matches the map it was drawn from, so any change hides it until it is regenerated.
  const preview = image && image.signature === signature ? image : null
  const customColour = !PRESET_COLOURS.some((c) => c.value.toLowerCase() === colour.toLowerCase())
  const previewAlt = `${toBn(count)}টি জেলা ভ্রমণের বাংলাদেশ মানচিত্র`

  const generate = async () => {
    setDrawing(true)
    setFailed(false)
    try {
      const blob = await renderTravelMapPng({ visited, colour, name })
      setImage({ url: URL.createObjectURL(blob), signature })
    } catch {
      setFailed(true)
    } finally {
      setDrawing(false)
    }
  }

  const readout = hovered
    ? `${hovered.nameBn} · ${DIVISION_BN[hovered.division]} বিভাগ · ${visited.has(hovered.id) ? 'ভ্রমণ করা হয়েছে' : 'এখনো যাওয়া হয়নি'}`
    : 'জেলায় ক্লিক করে রং করুন। আবার ক্লিক করলে মুছে যাবে।'

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="flex justify-center rounded-2xl border border-line bg-surface-2/40 p-4 sm:p-6">
            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="group"
              aria-label="বাংলাদেশের ৬৪টি জেলার মানচিত্র"
              className="h-[min(68vh,40rem)] w-auto max-w-full aspect-[709/1000]"
            >
              {districts.map((d) => (
                <Shape
                  key={d.id}
                  district={d}
                  on={visited.has(d.id)}
                  colour={colour}
                  onToggle={toggle}
                  onHover={setHovered}
                />
              ))}
            </svg>
          </div>
          <p className="bn mt-4 min-h-6 text-sm text-ink-2">{readout}</p>
          <p className="mt-1 text-xs text-ink-3">সীমানা: geoBoundaries, BBS ২০২০ (CC BY 3.0 IGO)।</p>
        </div>

        <div className="space-y-6">
          <div>
            <div role="group" aria-label="জেলা যোগ করার উপায়" className="seg flex w-full">
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
                    id="district-search"
                    type="search"
                    aria-label="জেলা খুঁজুন"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const first = matches.find((d) => !visited.has(d.id))
                      if (first) toggle(first.id)
                    }}
                    placeholder="ইংরেজি বা বাংলায় জেলার নাম লিখুন"
                    autoComplete="off"
                    className="bn w-full rounded-xl border border-line-strong bg-surface py-2.5 pr-3 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent-ink focus:outline-none"
                  />
                </div>
                {query.trim() === '' ? (
                  <p className="text-xs text-ink-3">Enter চাপলে এখনো যোগ হয়নি এমন প্রথম জেলাটি যোগ হবে।</p>
                ) : matches.length === 0 ? (
                  <p className="text-xs text-ink-3">“{query.trim()}” নামে কোনো জেলা নেই।</p>
                ) : (
                  <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface">
                    {matches.map((d) => {
                      const on = visited.has(d.id)
                      return (
                        <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="min-w-0 truncate">
                            <span className="bn text-sm text-ink">{d.nameBn}</span>
                            <span className="ml-2 text-xs text-ink-3">{DIVISION_BN[d.division]} বিভাগ</span>
                          </span>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(d.id)}
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

            {mode === 'division' && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {progress.map((p) => (
                    <button
                      key={p.division}
                      type="button"
                      onClick={() => setPickerDivision(p.division)}
                      className="rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-accent-ink"
                    >
                      <span className="bn block text-sm text-ink">{DIVISION_BN[p.division]}</span>
                      <span className="block font-mono text-[0.7rem] text-ink-3">
                        {toBn(p.visited)}/{toBn(p.total)}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost w-full py-2 text-sm"
                  onClick={() => setPickerDivision(DIVISIONS[0])}
                >
                  <ListChecks size={15} /> বিভাগ ধরে জেলা বাছুন
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="travel-map-name" className="eyebrow">
              আপনার নাম (ছবিতে দেখাবে)
            </label>
            <input
              id="travel-map-name"
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম"
              autoComplete="name"
              className="bn mt-3 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-3 focus:border-accent-ink focus:outline-none"
            />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">ভ্রমণ করা জেলা</p>
              <p className="mt-2 font-display text-6xl leading-none font-bold tracking-tight">
                {toBn(count)}
                <span className="text-3xl font-semibold text-ink-3"> / {toBn(TOTAL_DISTRICTS)}</span>
              </p>
            </div>
            <p className="font-mono text-sm text-ink-2">{toBn(percent)}%</p>
          </div>
          <div
            role="progressbar"
            aria-label="ভ্রমণ করা জেলা"
            aria-valuemin={0}
            aria-valuemax={TOTAL_DISTRICTS}
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
            <p className="eyebrow">বিভাগ অনুযায়ী</p>
            <ul className="mt-3 space-y-2.5">
              {progress.map((p) => (
                <li key={p.division} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                  <span className="bn text-ink-2">{DIVISION_BN[p.division]}</span>
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
            <p className="text-xs text-ink-3">আপনার নাম, জেলা ও রং শুধু এই ব্রাউজারে সংরক্ষিত থাকে।</p>
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
              ১২০০ × ১৮০০ পিক্সেলের PNG ছবিতে আপনার নাম, ভ্রমণ করা জেলা ও রং থাকবে। পূর্ণ আকারে দেখে নামিয়ে নিন।
              মানচিত্র বদলালে আবার তৈরি করুন।
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => setViewing(true)}>
                <ZoomIn size={17} /> পূর্ণ আকারে দেখুন
              </button>
              <a href={preview.url} download="bangladesh-travel-map.png" className="btn btn-primary">
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

      <Modal open={viewing && preview !== null} onClose={closeView} labelledBy="travel-map-view-title">
        {preview && (
          <div className="p-5 pt-16 sm:p-8 sm:pt-16">
            <h3 id="travel-map-view-title" className="font-display text-xl font-semibold tracking-tight">
              আপনার বাংলাদেশ ভ্রমণ মানচিত্র
            </h3>
            <img
              src={preview.url}
              alt={previewAlt}
              className="mx-auto mt-5 max-h-[62vh] w-auto max-w-full rounded-xl border border-line"
            />
            <div className="mt-6 flex justify-center">
              <a href={preview.url} download="bangladesh-travel-map.png" className="btn btn-primary">
                <Download size={17} /> PNG নামিয়ে নিন
              </a>
            </div>
          </div>
        )}
      </Modal>

      <DivisionPicker
        open={pickerDivision !== null}
        division={pickerDivision ?? DIVISIONS[0]}
        visited={visited}
        onApply={applyPicker}
        onClose={closePicker}
      />
    </div>
  )
}
