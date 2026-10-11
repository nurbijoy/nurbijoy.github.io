import { useEffect, useRef } from 'react'

const SPACING = 30
const REACH = 190
const BUCKETS = 6
const TAU = Math.PI * 2
/** ~50 fps is plenty for slow packets and a soft glow, and saves a fifth of the work of 60. */
const FRAME_MS = 20

interface Packet {
  vertical: boolean
  /** Grid line index the packet travels along. */
  line: number
  /** Position of the head along that line, in px. */
  pos: number
  speed: number
  len: number
  /** 0 accent · 1 blue · 2 aqua */
  hue: 0 | 1 | 2
}

/**
 * The hero's network backdrop: a dot grid that lights up around the pointer, is swept by a
 * periodic "scan", and carries data packets along its lines.
 *
 * Cheap by design: the ~1,500 static dots are painted once into a cached bitmap, so every
 * frame only draws what actually moves (a few hundred dots near the pointer or scan line,
 * plus the packets). Pauses when scrolled away or the tab is hidden; one static frame
 * under prefers-reduced-motion.
 */
export function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let lastDraw = 0
    let visible = true
    let grid: HTMLCanvasElement | null = null
    let packets: Packet[] = []
    const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999 }
    const colors = { dot: '#8f8d87', accent: '#d95926', blue: '#3987e5', aqua: '#199e70' }

    const readColors = () => {
      const s = getComputedStyle(document.documentElement)
      const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback
      colors.dot = get('--ink-3', colors.dot)
      colors.accent = get('--accent', colors.accent)
      colors.blue = get('--c2', colors.blue)
      colors.aqua = get('--c3', colors.aqua)
    }

    /** Paint the whole static grid once; re-run only on resize or theme change. */
    const buildGrid = () => {
      const dpr = canvas.width / Math.max(w, 1)
      const c = document.createElement('canvas')
      c.width = canvas.width
      c.height = canvas.height
      const g = c.getContext('2d')
      if (!g) return
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const path = new Path2D()
      for (let x = 0; x <= w + SPACING; x += SPACING) {
        for (let y = 0; y <= h + SPACING; y += SPACING) {
          path.moveTo(x + 1.3, y)
          path.arc(x, y, 1.3, 0, TAU)
        }
      }
      g.globalAlpha = 0.3
      g.fillStyle = colors.dot
      g.fill(path)
      grid = c
    }

    const spawn = (replacing?: Packet): Packet => {
      const vertical = Math.random() < 0.4
      const lines = Math.ceil((vertical ? w : h) / SPACING)
      const extent = vertical ? h : w
      const len = 50 + Math.random() * 90
      return {
        vertical,
        line: Math.floor(Math.random() * Math.max(lines, 1)),
        // first spawn scatters across the screen; respawns enter from the start of a line
        pos: replacing ? -len : Math.random() * extent,
        speed: 70 + Math.random() * 130,
        len,
        hue: (Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : 2) as 0 | 1 | 2,
      }
    }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
      const count = reduce ? 0 : Math.round(Math.min(22, (w * h) / 90000))
      packets = Array.from({ length: count }, () => spawn())
    }

    const drawPackets = (dt: number) => {
      const cols = [colors.accent, colors.blue, colors.aqua]
      ctx.lineCap = 'round'
      ctx.lineWidth = 1.6
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i]!
        p.pos += p.speed * dt
        const extent = p.vertical ? h : w
        if (p.pos - p.len > extent) {
          packets[i] = spawn(p)
          continue
        }
        const at = p.line * SPACING
        const x0 = p.vertical ? at : p.pos - p.len
        const y0 = p.vertical ? p.pos - p.len : at
        const x1 = p.vertical ? at : p.pos
        const y1 = p.vertical ? p.pos : at
        const color = cols[p.hue]!
        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        g.addColorStop(0, 'transparent')
        g.addColorStop(1, color)
        ctx.globalAlpha = 0.85
        ctx.strokeStyle = g
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x1, y1, 2.2, 0, TAU)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    /** Draw only the dots inside [x0,x1]×[y0,y1], brightness from `strength(x, y)` (0 skips it). */
    const lightDots = (
      color: string,
      x0: number,
      x1: number,
      y0: number,
      y1: number,
      strength: (x: number, y: number) => number,
    ) => {
      const buckets = Array.from({ length: BUCKETS }, () => new Path2D())
      const i0 = Math.max(0, Math.floor(x0 / SPACING))
      const i1 = Math.ceil(x1 / SPACING)
      const j0 = Math.max(0, Math.floor(y0 / SPACING))
      const j1 = Math.ceil(y1 / SPACING)
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const x = i * SPACING
          const y = j * SPACING
          const s = strength(x, y)
          if (s <= 0.03) continue
          const r = 1.3 + s * s * 2.8
          const b = buckets[Math.min(BUCKETS - 1, Math.floor(s * BUCKETS))]!
          b.moveTo(x + r, y)
          b.arc(x, y, r, 0, TAU)
        }
      }
      ctx.fillStyle = color
      for (let k = 0; k < BUCKETS; k++) {
        ctx.globalAlpha = 0.25 + ((k + 1) / BUCKETS) * 0.75
        ctx.fill(buckets[k]!)
      }
      ctx.globalAlpha = 1
    }

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h)
      if (grid) ctx.drawImage(grid, 0, 0, w, h)

      // Ease the lit region toward the real pointer so it trails smoothly.
      pointer.sx += (pointer.x - pointer.sx) * 0.14
      pointer.sy += (pointer.y - pointer.sy) * 0.14

      if (pointer.sx > -5000) {
        lightDots(colors.accent, pointer.sx - REACH, pointer.sx + REACH, pointer.sy - REACH, pointer.sy + REACH, (x, y) =>
          Math.max(0, 1 - Math.hypot(x - pointer.sx, y - pointer.sy) / REACH),
        )
      }

      if (!reduce) {
        // A soft horizontal sweep that crosses the field every ~11s.
        const scanY = (((t * 0.00009) % 1.5) - 0.25) * h
        lightDots(colors.blue, 0, w, scanY - 70, scanY + 70, (_x, y) => Math.max(0, 1 - Math.abs(y - scanY) / 70) * 0.8)
        drawPackets(dt)
      }
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden || t - lastDraw < FRAME_MS) return
      // Clamp dt so a throttled or backgrounded tab doesn't teleport the packets.
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      lastDraw = t
      draw(t, dt)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    readColors()
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) draw(0, 0)
    })
    ro.observe(canvas)

    const themeObserver = new MutationObserver(() => {
      readColors()
      buildGrid()
      if (reduce) draw(0, 0)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })
    io.observe(canvas)

    if (reduce) {
      draw(0, 0)
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_90%_80%_at_50%_35%,#000_30%,transparent_85%)]"
    />
  )
}
