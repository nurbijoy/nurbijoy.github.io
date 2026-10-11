import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. Safe for re-renders; `false` on the server / first paint. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}
