import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const GLYPHS = '▓▒░<>/\\|{}[]#$%&*+=-_01'

interface Props {
  text: string
  duration?: number
  className?: string
}

/** Resolves `text` out of random glyphs, left to right, like a cipher being broken. */
export function DecryptText({ text, duration = 650, className }: Props) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (reduce) {
      setOut(text)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const resolved = Math.floor(p * text.length)
      setOut(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < resolved ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [text, duration, reduce])

  // The real text stays in flow (invisible) so it alone decides the box's width and where
  // the caret sits; the scrambled frames are an absolutely-positioned overlay. Scrambled
  // glyphs have different widths, and if they were in flow every frame would shift layout.
  // Screen readers get the real text; the overlay is decoration.
  return (
    <span className={className}>
      {!reduce && <span className="sr-only">{text}</span>}
      <span className="relative inline-block" aria-hidden={reduce ? undefined : true}>
        <span className={reduce ? undefined : 'invisible'}>{text}</span>
        {!reduce && <span className="absolute top-0 left-0 whitespace-nowrap">{out}</span>}
      </span>
    </span>
  )
}
