import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Hourglass,
  Image as ImageIcon,
  LayoutGrid,
  PencilLine,
  Play,
  Presentation,
  Quote,
  Rows3,
  type LucideIcon,
} from 'lucide-react'
import {
  highlightAuthors,
  pubStatuses,
  publications,
  type PubLinks,
  type PubStatus,
  type Publication,
} from '@/data/publications'
import { site } from '@/data/site'
import { CoverArt } from '@/components/ui/CoverArt'
import { GithubIcon } from '@/components/ui/Icons'
import { SampleTag } from '@/components/ui/SampleTag'
import { toBibtex } from '@/lib/bibtex'
import { cn } from '@/lib/cn'
import { plural } from '@/lib/format'
import { onSpotMove } from '@/lib/spotlight'

const STATUS_ICON: Record<PubStatus, LucideIcon> = {
  Published: BadgeCheck,
  Preprint: FileText,
  'Under review': Hourglass,
  'In progress': PencilLine,
}

const LINKS: { key: keyof PubLinks; label: string; icon: LucideIcon | 'github' }[] = [
  { key: 'pdf', label: 'PDF', icon: FileText },
  { key: 'arxiv', label: 'arXiv', icon: ExternalLink },
  { key: 'doi', label: 'DOI', icon: ExternalLink },
  { key: 'code', label: 'Code', icon: 'github' },
  { key: 'slides', label: 'Slides', icon: Presentation },
  { key: 'video', label: 'Video', icon: Play },
  { key: 'poster', label: 'Poster', icon: ImageIcon },
]

/* ───────────────────────────────  Pieces  ─────────────────────────────── */

function StatusBadge({ status }: { status: PubStatus }) {
  const Icon = STATUS_ICON[status]
  return (
    <span className="tag gap-1.5">
      <Icon size={12} /> {status}
    </span>
  )
}

function Authors({ authors }: { authors: string[] }) {
  return (
    <p className="text-[0.95rem] text-ink-2">
      {authors.map((a, i) => (
        <span key={`${a}-${i}`}>
          {highlightAuthors.includes(a) ? (
            <strong className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">{a}</strong>
          ) : (
            a
          )}
          {i < authors.length - 1 && ', '}
        </span>
      ))}
    </p>
  )
}

function CiteButton({ pub }: { pub: Publication }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toBibtex(pub))
      setState('copied')
    } catch {
      setState('failed') // clipboard needs a secure context + user gesture
    }
    window.setTimeout(() => setState('idle'), 1800)
  }
  return (
    <button type="button" className="chip" onClick={copy} aria-live="polite" title="Copy a BibTeX entry">
      {state === 'copied' ? <Check size={13} /> : <Quote size={13} />}
      {state === 'copied' ? 'BibTeX copied' : state === 'failed' ? 'Copy failed' : 'Cite'}
    </button>
  )
}

function Actions({ pub }: { pub: Publication }) {
  const present = LINKS.filter((l) => pub.links?.[l.key])
  return (
    <div className="flex flex-wrap items-center gap-2">
      {present.map(({ key, label, icon }) => {
        const Icon = icon === 'github' ? null : icon
        return (
          <a key={key} className="chip" href={pub.links![key]} target="_blank" rel="noopener noreferrer">
            {Icon ? <Icon size={13} /> : <GithubIcon size={13} />}
            {label}
          </a>
        )
      })}
      <CiteButton pub={pub} />
    </div>
  )
}

function Abstract({ text, lines = 3 }: { text: string; lines?: 2 | 3 }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 170
  return (
    <div>
      <p className={cn('text-sm leading-relaxed text-ink-2', !open && (lines === 2 ? 'line-clamp-2' : 'line-clamp-3'))}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 font-mono text-xs text-accent-ink hover:underline"
        >
          {open ? 'Hide abstract' : 'Read abstract'}
          <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}

const dateLine = (p: Publication) => `${p.venue} · ${p.year}`

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
        </span>
      ))}
    </div>
  )
}

/* ───────────────────────────────  Cards  ─────────────────────────────── */

function FeaturedCard({ pub }: { pub: Publication }) {
  return (
    <motion.article
      layout
      onPointerMove={onSpotMove}
      className="card spot grid md:grid-cols-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative min-h-56 border-b border-line md:col-span-2 md:border-r md:border-b-0">
        <div className="absolute inset-0">
          <CoverArt seed={pub.id} />
        </div>
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-surface/85 via-transparent to-transparent p-5">
          <div className="flex items-center gap-2">
            <StatusBadge status={pub.status} />
            {pub.sample && <SampleTag />}
          </div>
          <p className="display text-[clamp(3.5rem,8vw,5.5rem)] leading-none text-ink">{pub.year}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 sm:p-8 md:col-span-3">
        <p className="eyebrow flex items-center gap-2 !text-accent-ink">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" /> Featured{pub.type !== pub.status && ` · ${pub.type}`}
        </p>
        <h4 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] font-semibold tracking-tight [font-stretch:88%]">
          {pub.title}
        </h4>
        <Authors authors={pub.authors} />
        <p className="font-mono text-xs text-ink-3">{dateLine(pub)}</p>
        {pub.abstract && <Abstract text={pub.abstract} />}
        <Tags tags={pub.tags} />
        <div className="mt-auto pt-2">
          <Actions pub={pub} />
        </div>
      </div>
    </motion.article>
  )
}

function PubCard({ pub }: { pub: Publication }) {
  return (
    <motion.article
      layout
      onPointerMove={onSpotMove}
      className="card spot flex flex-col gap-4 p-6"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={pub.status} />
          {pub.type !== pub.status && <span className="tag">{pub.type}</span>}
        </div>
        <span className="flex items-center gap-2 font-mono text-xs text-ink-3">
          {pub.sample && <SampleTag />}
          {pub.year}
        </span>
      </div>
      <h4 className="font-display text-[1.45rem] leading-tight font-semibold tracking-tight [font-stretch:90%]">{pub.title}</h4>
      <Authors authors={pub.authors} />
      <p className="font-mono text-xs text-ink-3">{pub.venue}</p>
      {pub.abstract && <Abstract text={pub.abstract} />}
      <Tags tags={pub.tags} />
      <div className="mt-auto pt-2">
        <Actions pub={pub} />
      </div>
    </motion.article>
  )
}

function Timeline({ items }: { items: Publication[] }) {
  const groups = useMemo(() => {
    const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a)
    return years.map((year) => ({ year, items: items.filter((p) => p.year === year) }))
  }, [items])

  return (
    <ol className="relative ml-2 space-y-12 border-l border-line-strong pl-6 sm:pl-10">
      {groups.map((g) => (
        <li key={g.year} className="relative">
          <span
            aria-hidden
            className="absolute top-2 -left-[calc(1.5rem+0.5rem+1px)] grid size-4 place-items-center rounded-full bg-bg ring-2 ring-accent sm:-left-[calc(2.5rem+0.5rem+1px)]"
          >
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
          <h4 className="display text-4xl text-ink">{g.year}</h4>
          <ul className="mt-5 space-y-4">
            {g.items.map((p) => (
              <li key={p.id}>
                <motion.article layout onPointerMove={onSpotMove} className="card spot flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    {p.type !== p.status && <span className="tag">{p.type}</span>}
                    {p.sample && <SampleTag />}
                  </div>
                  <h5 className="font-display text-xl leading-snug font-semibold tracking-tight [font-stretch:92%]">{p.title}</h5>
                  <Authors authors={p.authors} />
                  <p className="font-mono text-xs text-ink-3">{dateLine(p)}</p>
                  {p.abstract && <Abstract text={p.abstract} lines={2} />}
                  <Actions pub={p} />
                </motion.article>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}

/* ───────────────────────────────  Showcase  ─────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border border-dashed border-line-strong p-6 sm:flex-row sm:items-center">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface-2 text-ink-3">
        <FileText size={26} />
      </span>
      <div>
        <p className="font-medium text-ink">Nothing published yet.</p>
        <p className="mt-1 text-sm text-ink-2">
          Papers, preprints, theses and talks will be showcased here as they exist. In the meantime, the code behind my
          experiments is on{' '}
          <a className="link" href={`https://github.com/${site.github}`} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  )
}

const byDateDesc = (a: Publication, b: Publication) => b.year - a.year || (b.month ?? 0) - (a.month ?? 0)

export function PublicationShowcase(): ReactNode {
  const [status, setStatus] = useState<'All' | PubStatus>('All')
  const [view, setView] = useState<'cards' | 'timeline'>('cards')

  const sorted = useMemo(() => [...publications].sort(byDateDesc), [])
  const filtered = useMemo(() => sorted.filter((p) => status === 'All' || p.status === status), [sorted, status])
  const featured = view === 'cards' ? filtered.find((p) => p.featured) : undefined
  const rest = featured ? filtered.filter((p) => p !== featured) : filtered

  const present = pubStatuses.filter((s) => publications.some((p) => p.status === s))
  const years = new Set(publications.map((p) => p.year)).size
  const count = (s: 'All' | PubStatus) => (s === 'All' ? publications.length : publications.filter((p) => p.status === s).length)

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight [font-stretch:90%] sm:text-3xl">Publications & talks</h3>
          <p className="mt-1 text-sm text-ink-2">
            {publications.length === 0
              ? 'Showcase ready for papers, preprints, theses and talks.'
              : `${plural(publications.length, 'work')} across ${plural(years, 'year')}. Cite any of them in one click.`}
          </p>
        </div>

        {publications.length > 0 && (
          <div className="seg" role="group" aria-label="Publication layout">
            <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')} className="inline-flex items-center gap-1.5">
              <LayoutGrid size={13} /> Cards
            </button>
            <button type="button" aria-pressed={view === 'timeline'} onClick={() => setView('timeline')} className="inline-flex items-center gap-1.5">
              <Rows3 size={13} /> Timeline
            </button>
          </div>
        )}
      </div>

      {publications.length === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <>
          {present.length > 1 && (
            <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
              {(['All', ...present] as const).map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
                  {s}
                  <span className="opacity-60">{count(s)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {view === 'timeline' ? (
              <Timeline items={filtered} />
            ) : (
              <>
                <AnimatePresence mode="popLayout">{featured && <FeaturedCard key={featured.id} pub={featured} />}</AnimatePresence>
                <div className="grid gap-5 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {rest.map((p) => (
                      <PubCard key={p.id} pub={p} />
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-ink-3">Nothing with that status yet.</p>}
          </div>
        </>
      )}
    </div>
  )
}
