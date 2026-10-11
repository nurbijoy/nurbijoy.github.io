import type { PointerEvent } from 'react'

/** Feeds the `.spot` cursor spotlight: writes the pointer position as CSS vars. */
export function onSpotMove(e: PointerEvent<HTMLElement>): void {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
