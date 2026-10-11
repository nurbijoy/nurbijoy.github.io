import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Search, X } from 'lucide-react'
import { nav, site } from '@/data/site'
import { useActiveSection } from '@/hooks/useActiveSection'
import type { Theme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'
import { ThemeToggle } from './ThemeToggle'

const ids = nav.map((n) => n.id)

interface Props {
  theme: Theme
  onToggleTheme: (origin: { x: number; y: number }) => void
  onOpenPalette: () => void
}

export function Nav({ theme, onToggleTheme, onOpenPalette }: Props) {
  const active = useActiveSection(ids)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header data-nav className="fixed inset-x-0 top-0 z-50 flex flex-col items-center px-3 pt-3">
      <nav
        aria-label="Primary"
        className="flex w-full max-w-fit items-center gap-1 rounded-full border border-line-strong bg-surface/70 py-1.5 pr-1.5 pl-2 shadow-[0_18px_50px_-24px_rgb(0_0_0/0.6)] backdrop-blur-xl"
      >
        <a
          href="#top"
          aria-label={`${site.name} — back to top`}
          className="mr-1 grid size-9 shrink-0 place-items-center rounded-full bg-accent font-display text-[0.95rem] font-bold tracking-tight text-accent-fg"
        >
          {site.initials}
        </a>

        <ul className="hidden items-center md:flex">
          {nav.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? 'true' : undefined}
                className={cn(
                  'relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active === item.id ? 'text-ink' : 'text-ink-2 hover:text-ink',
                )}
              >
                {active === item.id && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="absolute inset-0 -z-10 rounded-full bg-surface-2 ring-1 ring-line-strong"
                  />
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <span aria-hidden className="mx-1 hidden h-5 w-px bg-line-strong md:block" />

        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Search size={16} />
          <span className="hidden lg:inline">Search</span>
          <span className="hidden gap-1 lg:flex">
            <kbd className="kbd">Ctrl</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="card mt-2 w-full max-w-sm origin-top p-2 backdrop-blur-xl md:hidden"
          >
            <ul>
              {nav.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 font-display text-2xl font-semibold tracking-tight transition-colors hover:bg-surface-2',
                      active === item.id ? 'text-accent-ink' : 'text-ink',
                    )}
                  >
                    {item.label}
                    <span className="font-mono text-xs text-ink-3">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
