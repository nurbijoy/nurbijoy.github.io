import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Height reserved while waiting, so nothing shifts when the content mounts. */
  minHeight: number
}

/**
 * Mounts children the first time they are ~15% visible, and keeps them mounted after.
 * Heavy things (charts) cost nothing until scrolled to, and their entry animations
 * play when the reader can actually see them instead of off-screen at page load.
 */
export function LazyMount({ children, minHeight }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <div ref={ref}>
      {shown ? children : <div className="skeleton" style={{ height: minHeight }} aria-hidden />}
    </div>
  )
}
