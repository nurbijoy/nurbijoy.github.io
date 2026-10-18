import { countries, WORLD_HEIGHT, WORLD_WIDTH } from '@/data/worldCountries'
import { site } from '@/data/site'
import { toBn } from './bangla'
import { CONTINENT_ORDER, continentProgress, TOTAL_COUNTRIES } from './worldTour'

const WIDTH = 1200
const HEIGHT = 1640
const PAD = 96
const RIGHT = WIDTH - PAD

const FRAME_WIDTH = RIGHT - PAD
/** Pixels per map unit: the frame fills the width, so the whole world fits. */
const SCALE = FRAME_WIDTH / WORLD_WIDTH
const FRAME_HEIGHT = WORLD_HEIGHT * SCALE
const MAP_TOP = 280

const LIST_TOP = MAP_TOP + FRAME_HEIGHT + 90
const LIST_ROW = 40
const LIST_COLUMNS = 3
const LIST_ROWS = 11
const LIST_CELLS = LIST_COLUMNS * LIST_ROWS

const BAR_Y = LIST_TOP + LIST_ROWS * LIST_ROW + 30

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

/** Draws the world map as a shareable PNG: the visited countries, the names of those countries, and the totals. */
export async function renderWorldTourPng({ visited, colour, name }: WorldTourImageInput): Promise<Blob> {
  const count = visited.size
  const percent = Math.round((count / TOTAL_COUNTRIES) * 100)
  const continentsTouched = continentProgress(visited).filter((p) => p.visited > 0).length
  const visitedCountries = countries
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
    [title, eyebrow, stats, continentStats, legendVisited, legendNotYet, listTitle, ...visitedCountries.map((c) => c.nameBn)].join(''),
  )

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')

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

  // A pin on each visited country, so the smallest islands can still be seen.
  for (const country of visitedCountries) {
    const x = PAD + country.label[0] * SCALE
    const y = MAP_TOP + country.label[1] * SCALE
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fillStyle = INK
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = BG
    ctx.stroke()
  }
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
