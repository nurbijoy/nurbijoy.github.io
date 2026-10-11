import { interests } from '@/data/interests'
import { Reveal } from '@/components/ui/Reveal'
import { SampleTag } from '@/components/ui/SampleTag'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { onSpotMove } from '@/lib/spotlight'

export function Interests() {
  return (
    <section id="interests" className="section">
      <div className="container-x">
        <SectionHeading
          index="05"
          label="Interests"
          title={
            <>
              What pulls me
              <br />
              <span className="text-accent-ink">down rabbit holes.</span>
            </>
          }
          lede="The topics I read about for fun, and keep circling back to in my work."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {interests.map((it, i) => {
            const Icon = it.icon
            return (
              <Reveal key={it.id} delay={(i % 4) * 0.06} className={cn(it.span === 2 && 'lg:col-span-2')}>
                <article
                  className="card spot group relative flex h-full min-h-48 flex-col justify-between p-6"
                  onPointerMove={onSpotMove}
                >
                  {/* oversized watermark icon */}
                  <Icon
                    aria-hidden
                    strokeWidth={1}
                    className="pointer-events-none absolute -right-6 -bottom-8 size-40 text-ink/[0.04] transition-all duration-700 group-hover:-translate-y-2 group-hover:rotate-6 group-hover:text-accent/[0.12]"
                  />
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-fg">
                      <Icon size={22} />
                    </span>
                    <span className="flex items-center gap-2 font-mono text-xs text-ink-3">
                      {it.sample && <SampleTag />}
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="relative mt-10">
                    <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight [font-stretch:88%]">{it.title}</h3>
                    <p className="mt-2 max-w-sm text-[0.95rem] text-ink-2">{it.blurb}</p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
