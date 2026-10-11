import { useMemo, useState } from 'react'
import { MIN_LEVEL, domainDepth, levelNames, shownDomains, shownSkills, type Domain } from '@/data/skills'
import { ChartCard } from '@/components/charts/ChartCard'
import { HBars, type HBarItem } from '@/components/charts/HBars'
import { SkillRadar } from '@/components/charts/SkillRadar'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useMedia } from '@/hooks/useMedia'

type Filter = 'All' | Domain
const FILTERS: Filter[] = ['All', ...shownDomains]
const TOP_N = 8
const isSample = shownSkills.some((s) => s.sample)

export default function Skills() {
  const [domain, setDomain] = useState<Filter>('All')
  const narrow = useMedia('(max-width: 640px)')
  const depth = useMemo(() => domainDepth(), [])

  const items = useMemo(() => {
    const scoped = shownSkills
      .filter((s) => domain === 'All' || s.domain === domain)
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
    const shown = domain === 'All' ? scoped.slice(0, TOP_N) : scoped
    return {
      total: scoped.length,
      list: shown.map<HBarItem>((s) => ({ name: s.name, value: s.level, label: levelNames[s.level], note: s.domain })),
    }
  }, [domain])

  const names = useMemo(() => shownSkills.map((s) => s.name), [])
  const rowHeight = narrow ? 54 : 42
  const barsHeight = items.list.length * rowHeight + 34

  return (
    <section id="skills" className="section">
      <div className="container-x">
        <SectionHeading
          index="04"
          label="Skills"
          title={
            <>
              Advanced-level
              <br />
              <span className="text-accent-ink">technologies.</span>
            </>
          }
          lede={`Only technologies at ${levelNames[MIN_LEVEL]} level or above make this list: cybersecurity, cryptography, blockchain, machine learning and data science. The depth map shows where the strength sits; the bars show the detail.`}
        />

        <Reveal className="mb-6">
          <div role="group" aria-label="Scope the skill charts by domain" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={domain === f} onClick={() => setDomain(f)}>
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <ChartCard
              className="h-full"
              title="Depth map"
              sample={isSample}
              subtitle="Advanced technologies per domain. Click an axis label to scope the bars."
              chartHeight={352}
              chart={
                <SkillRadar
                  data={depth.map((d) => ({ domain: d.domain, value: d.count, expert: d.expert }))}
                  selected={domain}
                  onSelect={(d) => setDomain(d as Filter)}
                />
              }
              table={{
                head: ['Domain', 'Advanced technologies', 'At expert level'],
                rows: depth.map((d) => [d.domain, d.count, d.expert]),
              }}
            />
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <ChartCard
              className="h-full"
              title={domain === 'All' ? `Top ${Math.min(TOP_N, items.total)} technologies` : `${domain} technologies`}
              sample={isSample}
              subtitle={
                domain === 'All'
                  ? `Strongest ${TOP_N} of ${shownSkills.length}. Pick a domain to see them all.`
                  : `${items.total} advanced technologies, strongest first.`
              }
              chartHeight={barsHeight}
              chart={
                <HBars
                  key={domain}
                  items={items.list}
                  max={6.4}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  yWidth={narrow ? 128 : 200}
                  rowHeight={rowHeight}
                  seriesName="level"
                  ariaLabel={`Bar chart of technology level for ${domain === 'All' ? 'the strongest technologies' : `${domain} technologies`}`}
                />
              }
              table={{
                head: ['Technology', 'Domain', 'Level'],
                rows: items.list.map((i) => [i.name, i.note ?? '', `${i.value} · ${i.label}`]),
              }}
              footer={
                <span className="flex flex-wrap gap-x-4 gap-y-1">
                  {levelNames.slice(MIN_LEVEL).map((n, i) => (
                    <span key={n}>
                      <span className="font-mono text-ink-2">{MIN_LEVEL + i}</span> {n}
                    </span>
                  ))}
                </span>
              }
            />
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <p className="eyebrow mb-5 text-center">Everything on the bench</p>
          <div className="marquee" aria-hidden>
            <div className="marquee-track">
              {[...names, ...names].map((name, i) => (
                <span key={`${name}-${i}`} className="tag !px-4 !py-2 !text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
