import { useEffect, useState } from 'react'

/**
 * Scroll-spy. Looks elements up by id on every frame instead of holding refs, so it
 * keeps working when a lazy-loaded section swaps its placeholder for the real node.
 */
export function useActiveSection(ids: readonly string[]): string {
  // Empty until the first section reaches the reading line, so nothing is highlighted over the hero.
  const [active, setActive] = useState('')

  useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      let next = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) next = id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) next = ids[ids.length - 1] ?? next
      setActive(next)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Lazy sections change the page height after mount (and after scroll restoration),
    // which moves every section without firing a scroll event — recompute when it grows.
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ids])

  return active
}
