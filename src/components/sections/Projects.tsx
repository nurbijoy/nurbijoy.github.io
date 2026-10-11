import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, BookOpenText, GitFork, Globe, Play, Star, type LucideIcon } from 'lucide-react'
import { projectCategories, projects, type Project, type ProjectStatus } from '@/data/projects'
import { site } from '@/data/site'
import { CoverArt } from '@/components/ui/CoverArt'
import { GithubIcon } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { Reveal } from '@/components/ui/Reveal'
import { SampleTag } from '@/components/ui/SampleTag'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useGithub } from '@/hooks/useGithub'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { onSpotMove } from '@/lib/spotlight'

/** A screenshot when one is set (and loads), otherwise generative art seeded by the id. */
function Cover({ project }: { project: Project }) {
  const [broken, setBroken] = useState(false)
  if (project.image && !broken) {
    return (
      <img
        src={project.image}
        alt={`${project.title} screenshot`}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
        className="size-full object-cover"
      />
    )
  }
  return <CoverArt seed={project.id} />
}

function StatusChip({ status }: { status: ProjectStatus }) {
  return (
    <span className="tag gap-1.5">
      {status === 'Live' ? (
        <span className="pulse-dot !size-1.5" aria-hidden />
      ) : (
        <span aria-hidden className="size-1.5 rounded-full border border-ink-3" />
      )}
      {status}
    </span>
  )
}

interface LinkSpec {
  href: string
  label: string
  icon: LucideIcon | 'github'
}

function linksOf(p: Project): LinkSpec[] {
  const list: LinkSpec[] = []
  if (p.repo) list.push({ href: `https://github.com/${site.github}/${p.repo}`, label: 'Source on GitHub', icon: 'github' })
  if (p.live) list.push({ href: p.live, label: 'Live site', icon: Globe })
  if (p.demo) list.push({ href: p.demo, label: 'Demo', icon: ArrowUpRight })
  if (p.video) list.push({ href: p.video, label: 'Video walkthrough', icon: Play })
  if (p.writeup) list.push({ href: p.writeup, label: 'Write-up', icon: BookOpenText })
  return list
}

function IconLinks({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-1">
      {linksOf(project).map(({ href, label, icon }) => {
        const Icon = icon === 'github' ? null : icon
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title}: ${label}`}
            title={label}
            className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent-ink"
          >
            {Icon ? <Icon size={18} /> : <GithubIcon size={18} />}
          </a>
        )
      })}
    </div>
  )
}

function ProjectCard({ project: p, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  const gh = useGithub()
  const repo =
    p.repo && gh.status === 'ready' ? gh.data.repos.find((r) => r.name.toLowerCase() === p.repo!.toLowerCase()) : undefined
  const wide = p.featured

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={onSpotMove}
      className={cn('card spot group flex flex-col', wide && 'md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-2')}
    >
      <div className={cn('relative overflow-hidden border-b border-line', wide ? 'aspect-[16/9] lg:aspect-auto lg:min-h-72 lg:border-r lg:border-b-0' : 'aspect-[16/9]')}>
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <Cover project={p} />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="tag bg-surface/80 backdrop-blur">{p.category}</span>
          {p.sample && <SampleTag />}
        </div>
        <span className="tag absolute top-3 right-3 bg-surface/80 backdrop-blur">{p.period ?? p.year}</span>
        {wide && (
          <span className="tag absolute bottom-3 left-3 !border-accent/60 bg-surface/80 !text-accent-ink backdrop-blur">Featured</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {(p.status || p.role) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {p.status && <StatusChip status={p.status} />}
            {p.role && <span className="font-mono text-xs text-ink-3">{p.role}</span>}
          </div>
        )}
        <h3 className={cn('font-display leading-tight font-semibold tracking-tight [font-stretch:88%]', wide ? 'text-[clamp(1.9rem,3vw,2.4rem)]' : 'text-[1.7rem]')}>
          {p.title}
        </h3>
        <p className="mt-2 text-[0.95rem] text-ink-2">{p.blurb}</p>

        {p.highlights && (
          <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            {p.case && (
              <button type="button" className="chip" onClick={() => onOpen(p)} aria-haspopup="dialog">
                Case study <ArrowUpRight size={13} />
              </button>
            )}
            {repo && (
              <p className="flex items-center gap-3 font-mono text-xs text-ink-3">
                <span className="flex items-center gap-1">
                  <Star size={13} /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={13} /> {repo.forks_count}
                </span>
                <span>pushed {relativeTime(repo.pushed_at)}</span>
              </p>
            )}
          </div>
          <IconLinks project={p} />
        </div>
      </div>
    </motion.article>
  )
}

function CaseSection({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <section className="grid gap-x-6 gap-y-1 sm:grid-cols-[6.5rem_1fr]">
      <h4 className="flex items-baseline gap-2 font-mono text-xs tracking-widest text-ink-3 uppercase">
        <span className="text-accent-ink">{n}</span> {title}
      </h4>
      <p className="text-[0.98rem] leading-relaxed text-ink-2">{children}</p>
    </section>
  )
}

function ProjectDetail({ project: p }: { project: Project }) {
  const links = linksOf(p)
  return (
    <>
      <div className="relative aspect-[21/9] overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <Cover project={p} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <div className="space-y-8 p-6 sm:p-10">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag">{p.category}</span>
            {p.status && <StatusChip status={p.status} />}
            {p.sample && <SampleTag />}
          </div>
          <h3 id="project-dialog-title" className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)]">
            {p.title}
          </h3>
          <p className="lede mt-4">{p.blurb}</p>
        </header>

        <dl className="grid grid-cols-2 gap-5 border-y border-line py-5 text-sm sm:grid-cols-3">
          {p.role && (
            <div>
              <dt className="eyebrow">Role</dt>
              <dd className="mt-1 text-ink">{p.role}</dd>
            </div>
          )}
          <div>
            <dt className="eyebrow">Period</dt>
            <dd className="mt-1 text-ink">{p.period ?? p.year}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="eyebrow">Stack</dt>
            <dd className="mt-1 text-ink">{p.stack.join(' · ')}</dd>
          </div>
        </dl>

        {p.case && (
          <div className="space-y-6">
            <CaseSection n="01" title="Problem">
              {p.case.problem}
            </CaseSection>
            <CaseSection n="02" title="Approach">
              {p.case.approach}
            </CaseSection>
            {p.case.learned && (
              <CaseSection n="03" title="Learned">
                {p.case.learned}
              </CaseSection>
            )}
          </div>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {links.map(({ href, label, icon }, i) => {
              const Icon = icon === 'github' ? null : icon
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('btn', i === 0 ? 'btn-primary' : 'btn-ghost')}
                >
                  {Icon ? <Icon size={17} /> : <GithubIcon size={17} />} {label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

/** Closes the grid: a cell, not a banner, so it never leaves a hole in the last row. */
function GithubCell() {
  return (
    <a
      href={`https://github.com/${site.github}?tab=repositories`}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onSpotMove}
      className="card spot group flex min-h-64 flex-col justify-between p-6 sm:p-8"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-ink">
        <GithubIcon size={24} />
      </span>
      <span>
        <span className="block font-display text-2xl leading-tight font-semibold tracking-tight">Everything else lives on GitHub</span>
        <span className="mt-2 block text-sm text-ink-2">Experiments, forks and work in progress, unfiltered.</span>
        <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-accent-ink">
          github.com/{site.github}
          <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </a>
  )
}

export function Projects() {
  const [category, setCategory] = useState<(typeof projectCategories)[number]>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const close = useCallback(() => setOpenId(null), [])
  const open = useCallback((p: Project) => setOpenId(p.id), [])

  const visible = useMemo(() => {
    const list = projects.filter((p) => category === 'All' || p.category === category)
    // Only the first featured project gets the wide card, and it always leads.
    const first = list.find((p) => p.featured)
    return list
      .map((p) => (p.featured && p !== first ? { ...p, featured: false } : p))
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  }, [category])

  const count = (c: string) => (c === 'All' ? projects.length : projects.filter((p) => p.category === c).length)
  const active = projects.find((p) => p.id === openId)

  return (
    <section id="projects" className="section">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Projects"
          title={
            <>
              Things I've built,
              <br />
              <span className="text-accent-ink">and why.</span>
            </>
          }
          lede="A selection of work across security, blockchain, machine learning and tooling. Open a case study for the problem, the approach and what it taught me."
        />

        <Reveal className="mb-8">
          <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
            {projectCategories.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
                <span className="opacity-60">{count(c)}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={open} />
            ))}
          </AnimatePresence>
          <GithubCell />
        </motion.div>

      </div>

      <Modal open={!!active} onClose={close} labelledBy="project-dialog-title">
        {active && <ProjectDetail project={active} />}
      </Modal>
    </section>
  )
}
