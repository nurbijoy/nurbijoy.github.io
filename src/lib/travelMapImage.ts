import { DIVISIONS, districts, MAP_HEIGHT, MAP_WIDTH, type District } from '@/data/bangladeshDistricts'
import { site } from '@/data/site'
import { toBn } from './bangla'
import { divisionProgress, TOTAL_DISTRICTS } from './travelMap'

const WIDTH = 1200
const HEIGHT = 1800
const PAD = 96
const RIGHT = WIDTH - PAD

const MAP_TOP = 280
const MAP_DRAWN_HEIGHT = 1200
const MAP_SCALE = MAP_DRAWN_HEIGHT / MAP_HEIGHT
const MAP_LEFT = (WIDTH - MAP_WIDTH * MAP_SCALE) / 2

const LABEL_SIZE = 30
const LABEL_HEIGHT = 38
const PIN_RADIUS = 8

/** Unit directions a label can sit in from its pin: right, left, up, down, then the diagonals. */
const LABEL_DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
  [0.7, -0.7],
  [-0.7, -0.7],
  [0.7, 0.7],
  [-0.7, 0.7],
]
/** How far a label sits from its pin, nearest first. Both stay close enough to read as belonging to the pin. */
const LABEL_GAPS = [12, 24]

// Fixed colours: the image looks the same whatever theme the page is in.
const BG = '#f6f1e6'
const INK = '#1d1b16'
const MUTED = '#6f695c'
const EMPTY = '#e2dac8'
const RULE = '#d8d0bd'

const BANGLA = '"Hind Siliguri", sans-serif'
const MONO = '"Geist Mono Variable", ui-monospace, monospace'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const overlaps = (a: Box, b: Box, gap = 4) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap

/**
 * Tries positions around a pin, nearest first, and keeps the first one that is on the canvas and
 * clear of the other pins and labels. If every position collides, it takes the one with fewest
 * collisions.
 */
function pickLabelBox(px: number, py: number, w: number, occupied: readonly Box[]): Box {
  const h = LABEL_HEIGHT
  const onCanvas = (b: Box) => b.x >= 16 && b.x + b.w <= WIDTH - 16 && b.y >= 16 && b.y + b.h <= HEIGHT - 16
  let best: { box: Box; hits: number } | null = null
  for (const gap of LABEL_GAPS) {
    for (const [dx, dy] of LABEL_DIRECTIONS) {
      const cx = px + dx * gap + Math.sign(dx) * (w / 2)
      const cy = py + dy * gap + Math.sign(dy) * (h / 2)
      const box = { x: cx - w / 2, y: cy - h / 2, w, h }
      if (!onCanvas(box)) continue
      const hits = occupied.filter((o) => overlaps(box, o)).length
      if (hits === 0) return box
      if (!best || hits < best.hits) best = { box, hits }
    }
  }
  return best?.box ?? { x: px + 14, y: py - h / 2, w, h }
}

interface Placed {
  district: District
  x: number
  y: number
}

async function loadFonts(sample: string): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all([
      document.fonts.load(`400 28px ${BANGLA}`, sample),
      document.fonts.load(`700 28px ${BANGLA}`, sample),
      document.fonts.load(`400 22px ${MONO}`, 'Boundaries geoBoundaries CC BY 3.0 IGO nurbijoy.github.io'),
    ])
  } catch {
    // Not fatal: the generic families in the font stacks take over.
  }
}

export interface TravelMapImageInput {
  visited: ReadonlySet<string>
  colour: string
  /** Shown in the title as "<name>-এর বাংলাদেশ". Empty falls back to "আমার বাংলাদেশ". */
  name: string
}

/** Draws the map as a shareable 1200 × 1800 PNG: Bangla labels, the visitor's name and the totals. */
export async function renderTravelMapPng({ visited, colour, name }: TravelMapImageInput): Promise<Blob> {
  const count = visited.size
  const percent = Math.round((count / TOTAL_DISTRICTS) * 100)
  const divisionsTouched = divisionProgress(visited).filter((p) => p.visited > 0).length
  const visitedDistricts = districts.filter((d) => visited.has(d.id))

  const title = name ? `${name}-এর বাংলাদেশ` : 'আমার বাংলাদেশ'
  const eyebrow = 'বাংলাদেশ ভ্রমণ মানচিত্র'
  const stats = `${toBn(percent)}% বাংলাদেশ ঘোরা হয়েছে`
  const divisionStats = `${toBn(count)}টি জেলা · ${toBn(divisionsTouched)}/${toBn(DIVISIONS.length)} বিভাগ`
  const legendVisited = 'ভ্রমণ করা জেলা'
  const legendNotYet = 'এখনো যাওয়া হয়নি'

  await loadFonts([title, eyebrow, stats, divisionStats, legendVisited, legendNotYet, ...visitedDistricts.map((d) => d.nameBn)].join(''))

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Header: eyebrow, then the visited count on the right and the title on the left.
  ctx.fillStyle = MUTED
  ctx.font = `400 34px ${BANGLA}`
  ctx.fillText(eyebrow, PAD, 116)

  const numberText = toBn(count)
  const totalText = `/${toBn(TOTAL_DISTRICTS)}`
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

  // Map: unvisited districts in the neutral tone, visited ones in the chosen colour.
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1.6
  ctx.strokeStyle = BG
  for (const district of districts) {
    const shape = new Path2D(district.d)
    ctx.save()
    ctx.translate(MAP_LEFT, MAP_TOP)
    ctx.scale(MAP_SCALE, MAP_SCALE)
    ctx.fillStyle = visited.has(district.id) ? colour : EMPTY
    ctx.fill(shape, 'evenodd')
    ctx.stroke(shape)
    ctx.restore()
  }

  // Pins first, then labels, so a label never sits on another district's pin.
  const placed: Placed[] = visitedDistricts.map((district) => ({
    district,
    x: MAP_LEFT + district.label[0] * MAP_SCALE,
    y: MAP_TOP + district.label[1] * MAP_SCALE,
  }))
  const occupied: Box[] = placed.map((p) => ({ x: p.x - PIN_RADIUS, y: p.y - PIN_RADIUS, w: PIN_RADIUS * 2, h: PIN_RADIUS * 2 }))
  for (const p of placed) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, PIN_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = INK
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = BG
    ctx.stroke()
  }

  ctx.font = `700 ${LABEL_SIZE}px ${BANGLA}`
  for (const p of placed) {
    const text = p.district.nameBn
    const box = pickLabelBox(p.x, p.y, ctx.measureText(text).width, occupied)
    occupied.push(box)
    const baseline = box.y + LABEL_HEIGHT - 9
    // A cream halo keeps the label readable over any fill colour.
    ctx.lineWidth = 7
    ctx.strokeStyle = BG
    ctx.strokeText(text, box.x, baseline)
    ctx.fillStyle = INK
    ctx.fillText(text, box.x, baseline)
  }

  // Progress bar and totals, below the map.
  const barY = MAP_TOP + MAP_DRAWN_HEIGHT + 50
  const barHeight = 18
  ctx.fillStyle = EMPTY
  ctx.fillRect(PAD, barY, RIGHT - PAD, barHeight)
  ctx.fillStyle = colour
  ctx.fillRect(PAD, barY, ((RIGHT - PAD) * count) / TOTAL_DISTRICTS, barHeight)

  ctx.fillStyle = INK
  ctx.font = `700 40px ${BANGLA}`
  ctx.fillText(stats, PAD, barY + 70)
  ctx.fillStyle = MUTED
  ctx.font = `400 30px ${BANGLA}`
  ctx.textAlign = 'right'
  ctx.fillText(divisionStats, RIGHT, barY + 70)
  ctx.textAlign = 'left'

  // Legend.
  const legendY = barY + 98
  ctx.fillStyle = colour
  ctx.fillRect(PAD, legendY, 34, 34)
  ctx.fillStyle = INK
  ctx.font = `400 28px ${BANGLA}`
  ctx.fillText(legendVisited, PAD + 48, legendY + 27)
  ctx.fillStyle = EMPTY
  ctx.fillRect(PAD + 330, legendY, 34, 34)
  ctx.fillStyle = INK
  ctx.fillText(legendNotYet, PAD + 378, legendY + 27)

  // Footer: boundary credit (CC BY 3.0 IGO) and the site address.
  const footerY = legendY + 68
  ctx.fillStyle = RULE
  ctx.fillRect(PAD, footerY, RIGHT - PAD, 2)
  ctx.font = `400 22px ${MONO}`
  ctx.fillStyle = MUTED
  ctx.fillText('Boundaries: geoBoundaries (CC BY 3.0 IGO)', PAD, footerY + 54)
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
