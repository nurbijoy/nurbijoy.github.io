import { useEffect, useState, type RefObject } from 'react'

/**
 * Display pixels per map unit for an SVG whose viewBox is `viewBoxWidth` units wide. Follows the
 * SVG's size, so that things drawn in map units (an arrowhead, say) keep a fixed size on screen.
 */
export function useUnitPx(ref: RefObject<SVGSVGElement | null>, viewBoxWidth: number): number {
  const [unitPx, setUnitPx] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const width = el.getBoundingClientRect().width
      if (width > 0) setUnitPx(width / viewBoxWidth)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, viewBoxWidth])

  return unitPx
}
