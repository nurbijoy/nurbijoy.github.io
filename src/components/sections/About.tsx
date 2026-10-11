import { useState } from 'react'
import { GraduationCap, MapPin } from 'lucide-react'
import { education, facts, now, site } from '@/data/site'
import { Reveal } from '@/components/ui/Reveal'
import { SampleTag } from '@/components/ui/SampleTag'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { onSpotMove } from '@/lib/spotlight'

function Avatar() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-line-strong bg-surface-2">
      <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-4xl font-bold text-accent-ink">
        {site.initials}
      </span>
      {!failed && (
        <img
          src={`https://github.com/${site.github}.png?size=240`}
          alt={`${site.name}`}
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  )
}

/** Earliest first: a node per degree, joined by a line that runs sideways on wide screens. */
function EducationTimeline() {
  return (
    <div className="card spot p-6 sm:p-8" onPointerMove={onSpotMove}>
      <h3 className="eyebrow">Education</h3>
      <ol className="mt-8 grid gap-10 md:grid-cols-2 md:gap-0">
        {education.map((e, i) => {
          const latest = i === education.length - 1
          const hasNext = i < education.length - 1
          return (
            <li key={e.degree} className="relative">
              {/* vertical connector on narrow screens */}
              {hasNext && <span aria-hidden className="absolute top-12 left-[1.35rem] h-[calc(100%-1.5rem)] w-px bg-line-strong md:hidden" />}
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-xl border',
                    latest ? 'border-accent/50 bg-accent/15 text-accent-ink' : 'border-line-strong bg-surface-2 text-ink-2',
                  )}
                >
                  <GraduationCap size={20} />
                </span>
                {/* horizontal connector on wide screens */}
                {hasNext && <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-line-strong to-accent/60 md:block" />}
              </div>
              <div className="mt-4 pl-[3.75rem] md:pr-10 md:pl-0">
                <p className="font-display text-[clamp(1.3rem,2vw,1.75rem)] leading-snug font-semibold tracking-tight [font-stretch:92%]">
                  {e.degree}
                </p>
                <p className="mt-1.5 text-ink-2">{e.school}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function About() {
  return (
    <section id="about" className="section">
      <div className="container-x">
        <SectionHeading
          index="01"
          label="About"
          title={
            <>
              Engineer first,
              <br />
              <span className="text-accent-ink">researcher next.</span>
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16 xl:gap-24">
          <div className="max-w-3xl space-y-6">
            <Reveal>
              <p className="lede !text-ink">
                I'm Bijoy, a software engineer who gravitates to the unglamorous parts of software: correctness, failure
                modes, and what happens when someone uses a system in a way its authors never imagined.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="lede">
                I treat security as an engineering discipline, not a checklist: <span className="text-ink">threat models before code</span>,
                boring and verifiable designs, and failure modes that are decided on purpose. The goal is to ask sharper
                questions, and to be able to prove the answers.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede">
                This site is the one place I keep it all: things I've built, questions I'm chasing, the technologies I'm
                strongest in, and a live view of my open-source activity.
              </p>
            </Reveal>

          </div>

          <Reveal delay={0.1} className="space-y-5">
            <div className="card spot p-6 sm:p-8" onPointerMove={onSpotMove}>
              <div className="flex items-center gap-5">
                <Avatar />
                <div className="min-w-0">
                  <p className="font-display text-2xl leading-tight font-semibold tracking-tight">{site.name}</p>
                  <p className="mt-1 text-sm text-ink-2">{site.title}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-3">
                    <MapPin size={14} /> {site.location}
                  </p>
                </div>
              </div>
              <dl className="mt-6 divide-y divide-line border-t border-line text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-ink-3">{f.label}</dt>
                    <dd className="text-right text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card spot p-6 sm:p-8" onPointerMove={onSpotMove}>
              <h3 className="eyebrow">Right now</h3>
              <ul className="mt-5 space-y-3">
                {now.map((n) => (
                  <li key={n.text} className="flex items-start gap-3 text-ink-2">
                    <span aria-hidden className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>
                      {n.text} {n.sample && <SampleTag />}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <EducationTimeline />
        </Reveal>
      </div>
    </section>
  )
}
