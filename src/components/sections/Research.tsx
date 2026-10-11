import { BookOpen, CalendarClock, Compass, type LucideIcon } from 'lucide-react'
import { directions, type ResearchStatus } from '@/data/research'
import { Constellation, constellationTable } from '@/components/charts/Constellation'
import { ChartCard } from '@/components/charts/ChartCard'
import { PublicationShowcase } from '@/components/research/PublicationShowcase'
import { Reveal } from '@/components/ui/Reveal'
import { SampleTag } from '@/components/ui/SampleTag'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { onSpotMove } from '@/lib/spotlight'

const STATUS_ICON: Record<ResearchStatus, LucideIcon> = {
  Reading: BookOpen,
  Exploring: Compass,
  Planned: CalendarClock,
}

export default function Research() {
  return (
    <section id="research" className="section">
      <div className="container-x">
        <SectionHeading
          index="03"
          label="Research"
          title={
            <>
              Questions I'm
              <br />
              <span className="text-accent-ink">chasing.</span>
            </>
          }
          lede="A map of directions rather than a list of results. Each one starts as a question I can't yet answer, and the work below is how I go looking."
        />

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            {directions.map((d, i) => {
              const Icon = STATUS_ICON[d.status]
              return (
                <Reveal key={d.id} delay={i * 0.06}>
                  <article className="card spot p-6" onPointerMove={onSpotMove}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="tag gap-1.5">
                        <Icon size={12} /> {d.status}
                      </span>
                      {d.sample && <SampleTag />}
                    </div>
                    <h3 className="mt-4 font-display text-[1.45rem] leading-tight font-semibold tracking-tight [font-stretch:90%]">
                      {d.title}
                    </h3>
                    <p className="mt-2 font-display text-lg leading-snug text-accent-ink italic [font-stretch:95%]">
                      {d.question}
                    </p>
                    <p className="mt-3 text-[0.95rem] text-ink-2">{d.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {d.tags.map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:col-span-7">
            <ChartCard
              title="How the ideas connect"
              subtitle="Research directions at the centre, the concepts they lean on, and the skills that carry them."
              sample
              chartHeight={560}
              chart={<Constellation />}
              table={constellationTable}
              footer="Illustrative map of how these topics relate. Drag nodes to explore; the table view lists every connection."
            />
          </Reveal>
        </div>

        <Reveal className="mt-10">
          <PublicationShowcase />
        </Reveal>
      </div>
    </section>
  )
}
