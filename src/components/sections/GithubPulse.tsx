import { useMemo, type ReactNode } from 'react'
import { ArrowUpRight, CircleAlert, GitFork } from 'lucide-react'
import { site } from '@/data/site'
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap'
import { WeekdayColumns, WeeklyArea } from '@/components/charts/ActivityCharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { Sparkline } from '@/components/charts/Sparkline'
import { Counter } from '@/components/ui/Counter'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useGithub } from '@/hooks/useGithub'
import { plural, relativeTime } from '@/lib/format'
import { buildHeat, type GithubData } from '@/lib/github'

function StatTile({ label, children, caption, spark }: { label: string; children: ReactNode; caption: string; spark?: ReactNode }) {
  return (
    <div className="card flex flex-col justify-between gap-4 p-5">
      <p className="eyebrow">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[2.6rem] leading-none font-semibold tracking-tight">{children}</p>
          <p className="mt-2 text-sm text-ink-2">{caption}</p>
        </div>
        {spark}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading GitHub activity">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="skeleton h-80 lg:col-span-7" />
        <div className="skeleton h-80 lg:col-span-5" />
      </div>
    </div>
  )
}

function Loaded({ data, stale }: { data: GithubData; stale: boolean }) {
  const heat = useMemo(() => buildHeat(data.events), [data.events])
  const since = new Date(data.user.created_at).getFullYear()
  const years = Math.max(1, new Date().getFullYear() - since)
  const repos = useMemo(
    () => [...data.repos].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at)),
    [data.repos],
  )
  const busiest = heat.weekday[heat.busiestWeekday]

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Public repos" caption="on GitHub">
            <Counter value={data.user.public_repos} />
          </StatTile>
          <StatTile label="Followers" caption={`following ${data.user.following}`}>
            <Counter value={data.user.followers} />
          </StatTile>
          <StatTile
            label="Events · 13 wks"
            caption={`${heat.activeDays} active days`}
            spark={<Sparkline width={92} values={heat.weekly.map((w) => w.count)} label="Weekly public events, last 13 weeks" />}
          >
            <Counter value={heat.total} />
          </StatTile>
          <StatTile label="On GitHub since" caption={`${plural(years, 'year')} in the open`}>
            {since}
          </StatTile>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <ChartCard
            className="h-full"
            title="Daily activity"
            subtitle="Public events per day, last 13 weeks"
            chartHeight={290}
            chart={<ActivityHeatmap heat={heat} />}
            table={{
              head: ['Date', 'Events'],
              rows: heat.cells
                .filter((c) => c.count > 0)
                .sort((a, b) => +b.date - +a.date)
                .map((c) => [c.date.toDateString(), c.count])
                .concat(heat.activeDays === 0 ? [['No public activity in this window', 0]] : []),
            }}
          />
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-5">
          <ChartCard
            className="h-full"
            title="Weekly rhythm"
            subtitle={busiest && busiest.count > 0 ? `Busiest on ${busiest.full}s` : 'No activity yet'}
            chartHeight={256}
            chart={<WeekdayColumns heat={heat} />}
            table={{ head: ['Weekday', 'Events'], rows: heat.weekday.map((d) => [d.label, d.count]) }}
          />
        </Reveal>
        <Reveal className="lg:col-span-7">
          <ChartCard
            className="h-full"
            title="Weekly pushes"
            subtitle="Public events per week"
            chartHeight={256}
            chart={<WeeklyArea heat={heat} />}
            table={{ head: ['Week of', 'Events'], rows: heat.weekly.map((w) => [w.label, w.count]) }}
          />
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="card h-full p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold tracking-tight [font-stretch:90%]">Repositories</h3>
            <p className="mt-1 text-sm text-ink-2">Most recently pushed first</p>
            <ul className="mt-4 divide-y divide-line">
              {repos.map((r) => (
                <li key={r.name}>
                  <a
                    href={r.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-medium text-ink group-hover:text-accent-ink">
                        <span className="truncate">{r.name}</span>
                        {r.fork && (
                          <span className="tag gap-1">
                            <GitFork size={11} /> fork
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-ink-3">
                        {r.language ?? 'No language detected'} · pushed {relativeTime(r.pushed_at)}
                      </span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-ink" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <p className="text-xs text-ink-3">
        Live from the public GitHub API, cached for 30 minutes. Events cover the last 90 days (a GitHub limit).
        {stale && ' The network request failed, so this is the last saved copy.'}
      </p>
    </div>
  )
}

export default function GithubPulse() {
  const gh = useGithub()

  return (
    <section id="activity" className="section">
      <div className="container-x">
        <SectionHeading
          index="06"
          label="Activity"
          title={
            <>
              Open-source pulse,
              <br />
              <span className="text-accent-ink">live from GitHub.</span>
            </>
          }
          lede="Real numbers, fetched in your browser from the public GitHub API: no screenshots, nothing hand-edited."
        />

        {gh.status === 'loading' && <Skeleton />}
        {gh.status === 'ready' && <Loaded data={gh.data} stale={gh.stale} />}
        {gh.status === 'error' && (
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
            <CircleAlert className="shrink-0 text-ink-3" size={28} />
            <div className="flex-1">
              <p className="font-medium">Couldn't reach the GitHub API just now.</p>
              <p className="mt-1 text-sm text-ink-2">
                Anonymous requests are rate-limited per network, so this can happen on a busy connection. Everything else
                on the page works as normal.
              </p>
            </div>
            <a className="btn btn-ghost" href={`https://github.com/${site.github}`} target="_blank" rel="noopener noreferrer">
              Open profile <ArrowUpRight size={16} className="arrow" />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
