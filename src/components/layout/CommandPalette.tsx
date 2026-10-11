import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUp,
  Check,
  Compass,
  Copy,
  CornerDownLeft,
  FlaskConical,
  FolderGit2,
  LayoutGrid,
  Mail,
  Moon,
  Search,
  Sparkles,
  Sun,
  Telescope,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { nav, site } from '@/data/site'
import type { Theme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

interface Command {
  id: string
  group: 'Jump to' | 'Actions'
  label: string
  keywords?: string
  icon: LucideIcon
  run: () => void
}

const SECTION_ICON: Record<string, LucideIcon> = {
  about: User,
  projects: FolderGit2,
  research: FlaskConical,
  skills: Wrench,
  interests: Sparkles,
  activity: LayoutGrid,
  contact: Mail,
}

interface Props {
  open: boolean
  onClose: () => void
  theme: Theme
  onToggleTheme: (origin?: { x: number; y: number }) => void
}

export function CommandPalette({ open, onClose, theme, onToggleTheme }: Props) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    const list: Command[] = nav.map((n) => ({
      id: `go-${n.id}`,
      group: 'Jump to',
      label: n.label,
      icon: SECTION_ICON[n.id] ?? Compass,
      run: go(n.id),
    }))
    list.push(
      { id: 'top', group: 'Actions', label: 'Back to top', icon: ArrowUp, run: go('top') },
      {
        id: 'theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        keywords: 'dark light mode appearance',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => onToggleTheme(),
      },
      {
        id: 'github',
        group: 'Actions',
        label: 'Open GitHub profile',
        keywords: 'code repositories',
        icon: FolderGit2,
        run: () => window.open(`https://github.com/${site.github}`, '_blank', 'noopener'),
      },
      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy link to this site',
        keywords: 'share url',
        icon: Copy,
        run: () => {
          void navigator.clipboard?.writeText(site.url).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1800)
          })
        },
      },
    )
    if (site.email) {
      list.push({
        id: 'mail',
        group: 'Actions',
        label: 'Send an email',
        keywords: 'contact hello',
        icon: Mail,
        run: () => (window.location.href = `mailto:${site.email}`),
      })
    }
    return list
  }, [theme, onToggleTheme])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      setQuery('')
      setIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      returnFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => setIndex(0), [query])

  const runAt = (i: number) => {
    const cmd = results[i]
    if (!cmd) return
    cmd.run()
    if (cmd.id !== 'copy') onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runAt(index)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      e.preventDefault() // keep focus inside the dialog
    }
  }

  useEffect(() => {
    document.getElementById(`cmd-${results[index]?.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [index, results])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="card w-full max-w-xl overflow-hidden"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="shrink-0 text-ink-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section or run an action…"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-activedescendant={results[index] ? `cmd-${results[index]!.id}` : undefined}
                aria-label="Search commands"
                className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="kbd shrink-0">Esc</kbd>
            </div>

            <ul id="cmd-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-3">No matches for “{query}”.</li>}
              {results.map((cmd, i) => {
                const Icon = cmd.id === 'copy' && copied ? Check : cmd.icon
                const showGroup = i === 0 || results[i - 1]!.group !== cmd.group
                return (
                  <li key={cmd.id} role="presentation">
                    {showGroup && <p className="eyebrow px-3 pt-3 pb-1.5">{cmd.group}</p>}
                    <div
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={i === index}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => runAt(i)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem]',
                        i === index ? 'bg-surface-2 text-ink' : 'text-ink-2',
                      )}
                    >
                      <Icon size={17} className={i === index ? 'text-accent-ink' : 'text-ink-3'} />
                      <span className="flex-1">{cmd.id === 'copy' && copied ? 'Link copied' : cmd.label}</span>
                      {i === index && <CornerDownLeft size={14} className="text-ink-3" />}
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-ink-3">
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">↑</kbd>
                <kbd className="kbd">↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">↵</kbd> select
              </span>
              <span className="ml-auto hidden items-center gap-1.5 sm:flex">
                <Telescope size={13} /> {site.shortName}'s site
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
