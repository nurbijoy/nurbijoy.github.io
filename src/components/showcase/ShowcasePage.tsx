import { useState, type ComponentType } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { site } from '@/data/site'
import { showcase, type ShowcaseProject } from '@/data/showcase'
import { toBn } from '@/lib/bangla'
import { useTheme } from '@/hooks/useTheme'
import { TravelMap } from './TravelMap'
import { WorldTour } from './WorldTour'

/** The live demo for each entry in the showcase data, keyed by the entry's id. */
const demos: Record<string, ComponentType> = {
  'bangladesh-travel-map': TravelMap,
  'world-tour': WorldTour,
}

/** The standalone Showcase page: a row of live projects, each running on this page. Written in Bangla. */
export function ShowcasePage() {
  const { theme, toggle } = useTheme()
  const [activeId, setActiveId] = useState(showcase[0]?.id ?? '')
  const project: ShowcaseProject = showcase.find((p) => p.id === activeId) ?? showcase[0]
  const Demo: ComponentType | undefined = demos[project.id]

  return (
    <div className="bn">
      <div className="ambient" aria-hidden />
      <div className="grain" aria-hidden />

      <header className="container-x flex items-center justify-between gap-4 pt-6">
        <a
          href="/"
          aria-label="হোম পেজে ফিরুন"
          className="grid size-9 place-items-center rounded-full bg-accent font-display text-[0.95rem] font-bold tracking-tight text-accent-fg"
        >
          {site.initials}
        </a>
        <div className="flex items-center gap-1">
          <a href="/" className="btn btn-ghost">
            <ArrowLeft size={16} /> হোমে ফিরুন
          </a>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main id="main" className="container-x section">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent-ink">শোকেস</span>
          <span aria-hidden className="h-px w-10 bg-line-strong" />
          <span>চলমান প্রকল্প</span>
        </p>
        <h1 className="display mt-5 text-[clamp(2.4rem,6vw,4.4rem)]">
          চলমান প্রকল্প,
          <br />
          <span className="text-accent-ink">এখানেই চালিয়ে দেখুন।</span>
        </h1>
        <p className="lede mt-6 max-w-2xl">
          নিজের বানানো কাজের টুল, স্ক্রিনশট নয়। প্রতিটি সরাসরি আপনার ব্রাউজারে চলে, কিছু ইনস্টল বা সাইন-আপ লাগে না।
        </p>

        {showcase.length > 1 && (
          <div role="group" aria-label="চলমান প্রকল্প" className="mt-10 flex flex-wrap gap-2">
            {showcase.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                aria-pressed={p.id === project.id}
                onClick={() => setActiveId(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        <article className="card mt-12 p-5 sm:p-8">
          <header className="mb-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag gap-1.5">
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
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3rem)]">{project.title}</h2>
            <p className="lede mt-4">{project.blurb}</p>
          </header>

          {Demo && (
            <ErrorBoundary label={project.title} variant="inline">
              <Demo />
            </ErrorBoundary>
          )}
        </article>
      </main>

      <footer className="container-x flex flex-col gap-3 pt-16 pb-10 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {toBn(new Date().getFullYear())} {site.name}। হাতে তৈরি।
        </p>
        <a href="/" className="link">
          হোমে ফিরুন
        </a>
      </footer>
    </div>
  )
}
