import { countries, WORLD_HEIGHT, WORLD_WIDTH, type Country } from '@/data/worldCountries'
import { site } from '@/data/site'
import { toBn } from './bangla'
import { bestLabelLayout, leaderArrow, type LabelItem } from './districtLabels'
import { measureBangla } from './textMeasure'
import { CONTINENT_ORDER, continentProgress, TOTAL_COUNTRIES } from './worldTour'

/** The design size. The canvas is drawn at SCALE_UP times this, so every name stays legible. */
const WIDTH = 1200
const HEIGHT = 1640
const SCALE_UP = 2.5
const PAD = 96
const RIGHT = WIDTH - PAD

const FRAME_WIDTH = RIGHT - PAD
/** Design pixels per map unit: the frame fills the width, so the whole world fits. */
const SCALE = FRAME_WIDTH / WORLD_WIDTH
const FRAME_HEIGHT = WORLD_HEIGHT * SCALE
const MAP_TOP = 280

const LIST_TOP = MAP_TOP + FRAME_HEIGHT + 90
const LIST_ROW = 40
const LIST_COLUMNS = 3
const LIST_ROWS = 11
const LIST_CELLS = LIST_COLUMNS * LIST_ROWS

const BAR_Y = LIST_TOP + LIST_ROWS * LIST_ROW + 30

/** Font sizes for the names on the map, in map units, largest first. */
const NAME_SIZES = [3, 2.6, 2.3, 2.1, 2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3]
const NAME_ITEMS: LabelItem[] = countries.map((c) => ({ id: c.id, text: c.nameBn, x: c.label[0], y: c.label[1] }))

// Fixed colours: the image looks the same whatever theme the page is in.
const BG = '#f6f1e6'
const INK = '#1d1b16'
const MUTED = '#6f695c'
const OCEAN = '#f1ecdf'
const EMPTY = '#cfc7b1'
const RULE = '#d8d0bd'

const BANGLA = '"Hind Siliguri", sans-serif'
const MONO = '"Geist Mono Variable", ui-monospace, monospace'

async function loadFonts(sample: string): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all([
      document.fonts.load(`400 28px ${BANGLA}`, sample),
      document.fonts.load(`700 28px ${BANGLA}`, sample),
      document.fonts.load(`400 22px ${MONO}`, 'Boundaries Natural Earth public domain nurbijoy.github.io'),
    ])
  } catch {
    // Not fatal: the generic families in the font stacks take over.
  }
}

export interface WorldTourImageInput {
  visited: ReadonlySet<string>
  colour: string
  /** Shown in the title as "<name>-এর বিশ্ব ভ্রমণ". Empty falls back to "আমার বিশ্ব ভ্রমণ". */
  name: string
}

/**
 * Draws the world map as a shareable PNG: every country named on the map, the visited countries
 * in the chosen colour, the names of the visited countries, and the totals.
 */
export async function renderWorldTourPng({ visited, colour, name }: WorldTourImageInput): Promise<Blob> {
  const count = visited.size
  const percent = Math.round((count / TOTAL_COUNTRIES) * 100)
  const continentsTouched = continentProgress(visited).filter((p) => p.visited > 0).length
  const visitedCountries: Country[] = countries
    .filter((c) => visited.has(c.id))
    .sort((a, b) => CONTINENT_ORDER.indexOf(a.continent) - CONTINENT_ORDER.indexOf(b.continent))

  const title = name ? `${name}-এর বিশ্ব ভ্রমণ` : 'আমার বিশ্ব ভ্রমণ'
  const eyebrow = 'বিশ্ব ভ্রমণ মানচিত্র'
  const stats = `${toBn(percent)}% পৃথিবী ঘোরা হয়েছে`
  const continentStats = `${toBn(count)}টি দেশ · ${toBn(continentsTouched)}/${toBn(CONTINENT_ORDER.length)} মহাদেশ`
  const legendVisited = 'ভ্রমণ করা দেশ'
  const legendNotYet = 'এখনো যাওয়া হয়নি'
  const listTitle = 'ভ্রমণ করা দেশগুলো'

  await loadFonts(
    [title, eyebrow, stats, continentStats, legendVisited, legendNotYet, listTitle, ...countries.map((c) => c.nameBn)].join(''),
  )
  // The names are placed after the font is loaded, so that they are measured with it.
  const labels = bestLabelLayout(NAME_ITEMS, measureBangla, { width: WORLD_WIDTH, height: WORLD_HEIGHT }, NAME_SIZES)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * SCALE_UP
  canvas.height = HEIGHT * SCALE_UP
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')
  ctx.scale(SCALE_UP, SCALE_UP)

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Header: eyebrow, then the count on the right and the title on the left.
  ctx.fillStyle = MUTED
  ctx.font = `400 34px ${BANGLA}`
  ctx.fillText(eyebrow, PAD, 116)

  const numberText = toBn(count)
  const totalText = `/${toBn(TOTAL_COUNTRIES)}`
  ctx.font = `700 150px ${BANGLA}`
  const numberWidth = ctx.measureText(numberText).width
  ctx.font = `500 56px ${BANGLA}`
  const totalWidth = ctx.measureText(totalText).width
  const numberX = RIGHT - totalWidth - numberWidth
  ctx.font = `700 150px ${BANGLA}`
  ctx.fillStyle = colour
  ctx.fillText(numberText, numberX, 214)
  ctx.font = `500 56px ${BANGLA}`
  ctx.fillStyle = MUTED
  ctx.fillText(totalText, RIGHT - totalWidth, 214)

  // Shrink the title until it fits beside the count.
  const titleMaxWidth = numberX - PAD - 40
  let titleSize = 92
  ctx.font = `700 ${titleSize}px ${BANGLA}`
  while (ctx.measureText(title).width > titleMaxWidth && titleSize > 44) {
    titleSize -= 4
    ctx.font = `700 ${titleSize}px ${BANGLA}`
  }
  ctx.fillStyle = INK
  ctx.fillText(title, PAD, 214)

  // Map: the ocean as the frame, then every country three times (-360, 0, +360) so that the
  // countries across the antimeridian appear at both edges. Clipped to the frame.
  ctx.save()
  ctx.beginPath()
  ctx.rect(PAD, MAP_TOP, FRAME_WIDTH, FRAME_HEIGHT)
  ctx.clip()
  ctx.fillStyle = OCEAN
  ctx.fillRect(PAD, MAP_TOP, FRAME_WIDTH, FRAME_HEIGHT)
  ctx.lineJoin = 'round'
  for (const country of countries) {
    const shape = new Path2D(country.d)
    const isVisited = visited.has(country.id)
    for (const shift of [-WORLD_WIDTH, 0, WORLD_WIDTH]) {
      ctx.save()
      ctx.translate(PAD, MAP_TOP)
      ctx.scale(SCALE, SCALE)
      ctx.translate(shift, 0)
      ctx.fillStyle = isVisited ? colour : EMPTY
      ctx.fill(shape, 'evenodd')
      ctx.strokeStyle = OCEAN
      ctx.lineWidth = 0.8 / SCALE
      ctx.stroke(shape)
      ctx.restore()
    }
  }

  // A curved arrow from each moved name to its country, drawn under the names. The arrowhead is
  // about 9 design pixels long, however far the map is scaled.
  ctx.save()
  ctx.translate(PAD, MAP_TOP)
  ctx.scale(SCALE, SCALE)
  ctx.strokeStyle = MUTED
  ctx.fillStyle = MUTED
  ctx.lineWidth = 1.5 / SCALE
  ctx.globalAlpha = 0.85
  for (const placed of labels.placed) {
    if (!placed.leader) continue
    const arrow = leaderArrow(placed.leader, 9 / SCALE)
    ctx.stroke(new Path2D(arrow.curve))
    ctx.fill(new Path2D(arrow.head))
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // Every country is named. Visited countries are in ink and bold; the rest are muted.
  const visitedIds = visited
  for (const placed of labels.placed) {
    const isVisited = visitedIds.has(placed.id)
    const size = labels.size * SCALE
    const x = PAD + placed.x * SCALE
    const y = MAP_TOP + placed.y * SCALE
    ctx.font = `${isVisited ? 700 : 500} ${size}px ${BANGLA}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = size * 0.25
    ctx.strokeStyle = OCEAN
    const text = countries.find((c) => c.id === placed.id)?.nameBn ?? ''
    ctx.strokeText(text, x, y)
    ctx.fillStyle = isVisited ? INK : MUTED
    ctx.fillText(text, x, y)
  }
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.restore()

  // The names of the visited countries, in continent order.
  ctx.fillStyle = MUTED
  ctx.font = `400 30px ${BANGLA}`
  ctx.fillText(listTitle, PAD, LIST_TOP - 36)
  const cellWidth = FRAME_WIDTH / LIST_COLUMNS
  const shown = visitedCountries.length > LIST_CELLS ? LIST_CELLS - 1 : visitedCountries.length
  ctx.font = `500 26px ${BANGLA}`
  for (let i = 0; i < shown; i++) {
    const c = visitedCountries[i]!
    const col = i % LIST_COLUMNS
    const row = Math.floor(i / LIST_COLUMNS)
    const x = PAD + col * cellWidth
    const y = LIST_TOP + row * LIST_ROW
    ctx.fillStyle = colour
    ctx.fillRect(x, y - 16, 14, 14)
    ctx.fillStyle = INK
    ctx.fillText(c.nameBn, x + 26, y)
  }
  if (visitedCountries.length > LIST_CELLS - 1 && visitedCountries.length > shown) {
    const remaining = visitedCountries.length - shown
    const i = shown
    const col = i % LIST_COLUMNS
    const row = Math.floor(i / LIST_COLUMNS)
    ctx.fillStyle = MUTED
    ctx.fillText(`আরও ${toBn(remaining)}টি`, PAD + col * cellWidth + 26, LIST_TOP + row * LIST_ROW)
  }

  // Progress bar and totals.
  const barHeight = 18
  ctx.fillStyle = EMPTY
  ctx.fillRect(PAD, BAR_Y, FRAME_WIDTH, barHeight)
  ctx.fillStyle = colour
  ctx.fillRect(PAD, BAR_Y, (FRAME_WIDTH * count) / TOTAL_COUNTRIES, barHeight)

  ctx.fillStyle = INK
  ctx.font = `700 40px ${BANGLA}`
  ctx.fillText(stats, PAD, BAR_Y + 70)
  ctx.fillStyle = MUTED
  ctx.font = `400 30px ${BANGLA}`
  ctx.textAlign = 'right'
  ctx.fillText(continentStats, RIGHT, BAR_Y + 70)
  ctx.textAlign = 'left'

  // Legend.
  const legendY = BAR_Y + 98
  ctx.fillStyle = colour
  ctx.fillRect(PAD, legendY, 34, 34)
  ctx.fillStyle = INK
  ctx.font = `400 28px ${BANGLA}`
  ctx.fillText(legendVisited, PAD + 48, legendY + 27)
  ctx.fillStyle = EMPTY
  ctx.fillRect(PAD + 330, legendY, 34, 34)
  ctx.fillStyle = INK
  ctx.fillText(legendNotYet, PAD + 378, legendY + 27)

  // Footer: the map's source (public domain) and the site address.
  const footerY = legendY + 68
  ctx.fillStyle = RULE
  ctx.fillRect(PAD, footerY, RIGHT - PAD, 2)
  ctx.font = `400 22px ${MONO}`
  ctx.fillStyle = MUTED
  ctx.fillText('Boundaries: Natural Earth (public domain)', PAD, footerY + 54)
  ctx.font = `500 24px ${MONO}`
  ctx.fillStyle = INK
  ctx.textAlign = 'right'
  ctx.fillText(site.url.replace(/^https?:\/\//, ''), RIGHT, footerY + 54)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be encoded'))),
      'image/png',
    )
  })
}
