import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark'

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> }
}

const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  const apply = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    const commit = () => {
      document.documentElement.dataset.theme = next
      try {
        localStorage.setItem('theme', next)
      } catch {
        /* private mode — theme just won't persist */
      }
      setTheme(next)
    }

    const doc = document as ViewTransitionDoc
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!doc.startViewTransition || reduce) return commit()

    // Circular reveal that grows from the toggle button.
    const x = origin?.x ?? innerWidth / 2
    const y = origin?.y ?? innerHeight / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = doc.startViewTransition(() => flushSync(commit))
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      .catch(() => {})
  }, [])

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => apply(current() === 'dark' ? 'light' : 'dark', origin),
    [apply],
  )

  return { theme, toggle }
}
