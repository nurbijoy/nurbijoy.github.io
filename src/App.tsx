import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/Nav'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/components/hero/Hero'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Interests } from '@/components/sections/Interests'
import { Projects } from '@/components/sections/Projects'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GithubProvider } from '@/hooks/useGithub'
import { useTheme } from '@/hooks/useTheme'

// Chart-heavy sections are split into their own chunks (Recharts, d3-force).
const loadResearch = () => import('@/components/sections/Research')
const loadSkills = () => import('@/components/sections/Skills')
const loadActivity = () => import('@/components/sections/GithubPulse')
const Research = lazy(loadResearch)
const Skills = lazy(loadSkills)
const GithubPulse = lazy(loadActivity)

/** Keeps the anchor (and scroll-spy target) alive while a chunk is loading. */
function Placeholder({ id }: { id: string }) {
  return <section id={id} className="section min-h-[70vh]" aria-hidden />
}

/** A lazy section that can fail (bad chunk, render error) without taking the page with it. */
function LazySection({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <ErrorBoundary id={id} label={label}>
      <Suspense fallback={<Placeholder id={id} />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // Warm the lazy chunks once the reader shows intent (scroll, key, touch) or after a long
  // idle, so evaluating Recharts / d3 never competes with first paint.
  useEffect(() => {
    let done = false
    const warm = () => {
      if (done) return
      done = true
      void Promise.all([loadResearch(), loadSkills(), loadActivity()])
      cleanup()
    }
    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'] as const
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, warm))
      window.clearTimeout(timer)
    }
    events.forEach((e) => window.addEventListener(e, warm, { passive: true, once: true }))
    const timer = window.setTimeout(warm, 6000)
    return cleanup
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <GithubProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="ambient" aria-hidden />
      <div className="grain" aria-hidden />
      <ScrollProgress />
      <Nav theme={theme} onToggleTheme={toggle} onOpenPalette={() => setPaletteOpen(true)} />

      <main id="main">
        <Hero />
        <About />
        <Projects />
        <LazySection id="research" label="Research">
          <Research />
        </LazySection>
        <LazySection id="skills" label="Skills">
          <Skills />
        </LazySection>
        <Interests />
        <LazySection id="activity" label="Activity">
          <GithubPulse />
        </LazySection>
        <Contact />
      </main>

      <Footer />
      <CommandPalette open={paletteOpen} onClose={closePalette} theme={theme} onToggleTheme={toggle} />
    </GithubProvider>
  )
}
