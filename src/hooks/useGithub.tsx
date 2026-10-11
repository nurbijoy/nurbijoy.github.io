import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadGithub, type GithubData } from '@/lib/github'

type GithubState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: GithubData; stale: boolean }

const GithubContext = createContext<GithubState>({ status: 'loading' })

/** Loads the public GitHub profile once and shares it with every section. */
export function GithubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GithubState>({ status: 'loading' })

  useEffect(() => {
    const ctrl = new AbortController()
    loadGithub(ctrl.signal)
      .then(({ data, stale }) => setState({ status: 'ready', data, stale }))
      .catch(() => {
        if (!ctrl.signal.aborted) setState({ status: 'error' })
      })
    return () => ctrl.abort()
  }, [])

  const value = useMemo(() => state, [state])
  return <GithubContext.Provider value={value}>{children}</GithubContext.Provider>
}

export function useGithub(): GithubState {
  return useContext(GithubContext)
}
