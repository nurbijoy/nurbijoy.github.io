import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { ArrowLeft, Check, FileText, Globe, Map, Share2, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { site } from '@/data/site'
import { showcase, type ShowcaseProject } from '@/data/showcase'
import { useTheme } from '@/hooks/useTheme'
import { TravelMap } from './TravelMap'
import { WorldTour } from './WorldTour'
import { CvBuilder } from './CvBuilder'

const BuetCampusMap = lazy(() => import('./BuetCampusMap').then((module) => ({ default: module.BuetCampusMap })))

/** The live demo for each entry in the showcase data, keyed by the entry's id. */
const demos: Record<string, ComponentType> = {
  'linkedin-cv-builder': CvBuilder,
  'bangladesh-travel-map': TravelMap,
  'world-tour': WorldTour,
  'buet-campus-map': BuetCampusMap,
}

const PROJECT_ICONS = {
  'file-text': FileText,
  map: Map,
  globe: Globe,
} as const

/**
 * The standalone Showcase page: interactive live projects running directly in the browser.
 * Tour-related projects (Bangladesh Travel Map, World Tour) are in Bangla;
 * other tools (such as the CV Builder) and page navigation are in English.
 */
export function ShowcasePage() {
  const { theme, toggle } = useTheme()

  // Read initial hash if present and matching a project id
  // A project hash may carry a deep link after a slash, e.g. #buet-campus-map/library.
  const getInitialId = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '').split('/')[0].trim()
      if (hash && showcase.some((p) => p.id === hash)) {
        return hash
      }
    }
    return showcase[0]?.id ?? ''
  }

  const [activeId, setActiveId] = useState(getInitialId)
  const [copiedLink, setCopiedLink] = useState(false)

  // Sync hash changes (browser back/forward or external link)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '').split('/')[0].trim()
      if (hash && showcase.some((p) => p.id === hash)) {
        setActiveId(hash)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const project: ShowcaseProject = showcase.find((p) => p.id === activeId) ?? showcase[0]
  const Demo: ComponentType | undefined = demos[project.id]

  const selectProject = (id: string) => {
    setActiveId(id)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  // Update document title for active project
  useEffect(() => {
    if (typeof document !== 'undefined' && project) {
      document.title = `${project.title} — Showcase · ${site.name}`
    }
  }, [project])

  const copyProjectLink = () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}#${project.id}`
    void navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  return (
    <div>
      <div className="ambient" aria-hidden />
      <div className="grain" aria-hidden />

      <header className="container-x flex items-center justify-between gap-4 pt-6">
        <a
          href="/"
          aria-label="Back to home page"
          className="grid size-9 place-items-center rounded-full bg-accent font-display text-[0.95rem] font-bold tracking-tight text-accent-fg"
        >
          {site.initials}
        </a>
        <div className="flex items-center gap-1">
          <a href="/" className="btn btn-ghost">
            <ArrowLeft size={16} /> Back to Home
          </a>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main id="main" className="container-x pt-8 pb-12 sm:pt-10">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent-ink">Showcase</span>
          <span aria-hidden className="h-px w-10 bg-line-strong" />
          <span>Live Projects ({showcase.length} tools)</span>
        </p>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="display text-[clamp(2.4rem,6vw,4.4rem)]">
            Live Projects,
            <br />
            <span className="text-accent-ink">running in your browser.</span>
          </h1>
        </div>

        {/* ────────────────── Reorganized Project Selector Cards ────────────────── */}
        <section aria-label="Project selection" className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-3">Select a project:</span>
            <span className="text-xs text-ink-3">Click any tool to launch live</span>
          </div>

          <div role="tablist" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {showcase.map((p) => {
              const IconComp = (p.icon && PROJECT_ICONS[p.icon]) || Sparkles
              const isSelected = p.id === project.id

              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => selectProject(p.id)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${isSelected
                      ? 'border-accent bg-surface-2 shadow-md ring-2 ring-accent/30'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`grid size-9 place-items-center rounded-lg transition-colors ${isSelected
                            ? 'bg-accent text-accent-fg'
                            : 'bg-surface-2 text-ink-2 group-hover:text-ink'
                          }`}
                      >
                        <IconComp size={18} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="tag !text-[0.68rem] !py-0.5">{p.category}</span>
                        <span className="tag !text-[0.68rem] !py-0.5 gap-1 font-semibold text-accent-ink">
                          <span className="pulse-dot !size-1.5" aria-hidden />
                          {p.status}
                        </span>
                      </div>
                    </div>

                    <div className={p.isBangla ? 'bn' : ''}>
                      <h2 className="font-display mt-3 text-base font-bold tracking-tight text-ink">
                        {p.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-2 leading-relaxed">{p.blurb}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1 border-t border-line/60 pt-2.5">
                    {p.stack.slice(0, 3).map((tech) => (
                      <span key={tech} className="font-mono text-[0.65rem] text-ink-3">
                        #{tech}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ────────────────── Active Project Display ────────────────── */}
        <article className="card mt-8 p-5 sm:p-8">
          <header
            className={`mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-start md:justify-between ${project.isBangla ? 'bn' : ''
              }`}
          >
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag gap-1.5 font-semibold text-accent-ink">
                  <span className="pulse-dot !size-1.5" aria-hidden />
                  {project.status}
                </span>
                <span className="tag">{project.category}</span>
                {project.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </div>
              <h2 className="display mt-4 text-[clamp(2rem,4vw,3rem)]">{project.title}</h2>
              <p className="lede mt-3">{project.blurb}</p>
            </div>

            <button
              type="button"
              onClick={copyProjectLink}
              className="btn btn-ghost self-start gap-1.5 border border-line-strong text-xs font-semibold shrink-0"
              title="Copy direct link to this project"
            >
              {copiedLink ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
              {copiedLink ? 'Link copied!' : 'Share Link'}
            </button>
          </header>

          {Demo && (
            <ErrorBoundary label={project.title} variant="inline">
              <Suspense fallback={<div role="status" className="grid min-h-72 place-items-center text-sm text-ink-2">Loading project…</div>}>
                <Demo />
              </Suspense>
            </ErrorBoundary>
          )}
        </article>
      </main>

      <footer className="container-x flex flex-col gap-3 pt-10 pb-8 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Handcrafted.
        </p>
        <a href="/" className="link">
          Back to Home
        </a>
      </footer>
    </div>
  )
}
