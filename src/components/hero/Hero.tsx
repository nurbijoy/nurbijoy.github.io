import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { facts, site } from '@/data/site'
import { cn } from '@/lib/cn'
import { GithubIcon } from '@/components/ui/Icons'
import { DecryptText } from './DecryptText'
import { FieldCanvas } from './FieldCanvas'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Decorative block-hash ticker. Purely cosmetic strings (leading zeros like a mined block),
 * generated once by a tiny PRNG. The scrolling is a CSS transform, so it costs no JavaScript.
 */
const HASHES = (() => {
  let seed = 0x9e3779b1
  const hex = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return (seed >>> 8).toString(16).padStart(6, '0')
  }
  return Array.from({ length: 12 }, () => `0000${hex()}${hex()}${hex()}`)
})()

function HashTicker() {
  const items = [...HASHES, ...HASHES]
  return (
    <div className="marquee mt-10" aria-hidden>
      <div className="marquee-track font-mono text-xs text-ink-3" style={{ animationDuration: '90s' }}>
        {items.map((h, i) => (
          <span key={i} className="pr-10 whitespace-nowrap">
            <span className="text-accent-ink">{h.slice(0, 4)}</span>
            {h.slice(4)}
          </span>
        ))}
      </div>
    </div>
  )
}

function RoleCycler() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setI((x) => (x + 1) % site.roles.length), 3600)
    return () => window.clearInterval(id)
  }, [reduce])

  // Every role sits in the same grid cell; only the active one is visible. The cell is
  // therefore always as big as the longest role, so cycling (and the scramble frames)
  // can never change the line's size or wrap: zero layout shift.
  return (
    <span className="inline-grid text-accent-ink">
      {site.roles.map((role, idx) => (
        <span key={role} aria-hidden={idx !== i} className={cn('col-start-1 row-start-1', idx === i ? 'caret' : 'invisible')}>
          {idx === i ? <DecryptText key={i} text={role} /> : role}
        </span>
      ))}
    </span>
  )
}

/** Each word rises out of a clipped line: a quick, confident entrance for the name. */
function Word({ children, delay }: { children: string; delay: number }) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: '108%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function Rise({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-8">
      <FieldCanvas />

      <div className="container-x relative">
        {/* Type big enough to own the full width: scales with the viewport up to 16rem. */}
        <h1 className="display text-[clamp(3.3rem,12.4vw,16rem)] leading-[0.9]">
          <Word delay={0.1}>Nur Mohammad</Word>
          <Word delay={0.22}>Bijoy</Word>
        </h1>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <Rise delay={0.3} className="lg:col-span-6">
            <p className="flex flex-wrap items-baseline gap-x-3 font-display text-[clamp(1.5rem,3.6vw,2.7rem)] leading-tight font-semibold tracking-tight [font-stretch:88%] 2xl:text-[3.4rem]">
              <span className="text-ink-3">I</span>
              <RoleCycler />
            </p>
          </Rise>

          <div className="lg:col-span-5 lg:col-start-8">
            {/* Static (no entrance animation): it is the largest text, so it must paint immediately. */}
            <p className="lede max-w-xl">{site.intro}</p>
            <Rise delay={0.4} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="btn btn-primary">
                See the work <ArrowUpRight size={18} className="arrow" />
              </a>
              <a href="#research" className="btn btn-ghost">
                Research
              </a>
              {site.email && (
                <a href={`mailto:${site.email}`} className="btn btn-ghost">
                  <Mail size={17} /> Say hello
                </a>
              )}
              <a
                href={`https://github.com/${site.github}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="btn btn-ghost !px-3.5"
              >
                <GithubIcon size={19} />
              </a>
            </Rise>
          </div>
        </div>

        <Rise delay={0.5} className="mt-14 md:mt-20">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-1.5 text-sm text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Rise>

        <HashTicker />
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute right-6 bottom-12 hidden items-center gap-2 font-mono text-xs tracking-widest text-ink-3 uppercase transition-colors hover:text-accent-ink 2xl:flex"
      >
        Scroll <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  )
}
