import { ArrowUp } from 'lucide-react'
import { nav, navHref, site } from '@/data/site'
import { SocialIcon } from '@/components/ui/Icons'

const stack = ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Recharts', 'd3-force', 'Motion']

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-16 pb-10">
      {/* Oversized wordmark, clipped by the section edge on purpose. */}
      <p
        aria-hidden
        className="display pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 text-center text-[clamp(5rem,21vw,19rem)] leading-none whitespace-nowrap text-ink/[0.045] select-none"
      >
        {site.shortName}
      </p>

      <div className="container-x relative">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-semibold tracking-tight">{site.name}</p>
            <p className="mt-2 text-sm text-ink-2">{site.title} · secure systems · {site.location}</p>
            <div className="mt-5 flex gap-2">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full border border-line-strong text-ink-2 transition-colors hover:border-accent-ink hover:text-accent-ink"
                >
                  <SocialIcon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {nav.map((n) => (
              <a key={n.id} href={navHref(n)} className="py-1 text-ink-2 transition-colors hover:text-accent-ink">
                {n.label}
              </a>
            ))}
          </nav>

          <a href="#top" className="btn btn-ghost self-start">
            <ArrowUp size={16} /> Back to top
          </a>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Designed and built by hand.
          </p>
          <p className="font-mono">{stack.join(' · ')}</p>
        </div>
      </div>
    </footer>
  )
}
