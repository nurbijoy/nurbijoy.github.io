import { site } from '@/data/site'

export interface GhUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GhRepo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  archived: boolean
  pushed_at: string
  homepage: string | null
}

export interface GhEvent {
  type: string
  created_at: string
}

export interface GithubData {
  user: GhUser
  repos: GhRepo[]
  events: GhEvent[]
  fetchedAt: number
}

const KEY = `gh:v1:${site.github}`
const TTL = 30 * 60 * 1000 // unauthenticated API allows 60 req/h per IP — cache politely

function readCache(): GithubData | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GithubData) : null
  } catch {
    return null
  }
}

function writeCache(data: GithubData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable — fine, we just refetch next time */
  }
}

const TIMEOUT_MS = 8000

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  // A hung request must never leave the section on its skeleton forever.
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const res = await fetch(`https://api.github.com${path}`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  return (await res.json()) as T
}

export interface LoadResult {
  data: GithubData
  /** True when the network failed and an older cached copy is being shown. */
  stale: boolean
}

export async function loadGithub(signal?: AbortSignal): Promise<LoadResult> {
  const cached = readCache()
  if (cached && Date.now() - cached.fetchedAt < TTL) return { data: cached, stale: false }

  const h = site.github
  try {
    const [user, repos, ...eventPages] = await Promise.all([
      get<GhUser>(`/users/${h}`, signal),
      get<GhRepo[]>(`/users/${h}/repos?per_page=100&sort=pushed`, signal),
      // The public events feed holds up to 300 events / 90 days across 3 pages.
      ...[1, 2, 3].map((page) => get<GhEvent[]>(`/users/${h}/events/public?per_page=100&page=${page}`, signal)),
    ])
    const data: GithubData = {
      user,
      repos,
      events: eventPages.flat().map(({ type, created_at }) => ({ type, created_at })),
      fetchedAt: Date.now(),
    }
    writeCache(data)
    return { data, stale: false }
  } catch (err) {
    if (signal?.aborted) throw err
    if (cached) return { data: cached, stale: true }
    throw err
  }
}

/* ───────────────────────────  Heatmap binning  ─────────────────────────── */

export interface HeatCell {
  key: string
  date: Date
  count: number
  col: number // week index, 0 = oldest
  row: number // weekday, 0 = Sunday
  future: boolean
}

export interface Heat {
  weeks: number
  cells: HeatCell[]
  total: number
  max: number
  activeDays: number
  weekly: { label: string; start: Date; count: number }[]
  weekday: { label: string; full: string; count: number }[]
  months: { col: number; label: string }[]
  busiestWeekday: number
}

const DAY_MS = 86_400_000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

export function buildHeat(events: GhEvent[], weeks = 13, now = new Date()): Heat {
  const today = startOfDay(now)
  const start = addDays(today, -today.getDay() - (weeks - 1) * 7) // Sunday of the oldest week

  const counts = new Map<string, number>()
  for (const e of events) {
    const k = dayKey(new Date(e.created_at))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  const cells: HeatCell[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(start, i)
    const key = dayKey(date)
    cells.push({
      key,
      date,
      count: counts.get(key) ?? 0,
      col: Math.floor(i / 7),
      row: i % 7,
      future: date.getTime() > today.getTime() + DAY_MS - 1,
    })
  }

  const live = cells.filter((c) => !c.future)
  const weekly = Array.from({ length: weeks }, (_, w) => {
    const first = cells[w * 7]!
    return {
      label: `${MONTHS[first.date.getMonth()]} ${first.date.getDate()}`,
      start: first.date,
      count: live.filter((c) => c.col === w).reduce((s, c) => s + c.count, 0),
    }
  })
  const weekday = WEEKDAYS.map((label, row) => ({
    label,
    full: WEEKDAYS_FULL[row]!,
    count: live.filter((c) => c.row === row).reduce((s, c) => s + c.count, 0),
  }))

  const months: Heat['months'] = []
  let lastMonth = -1
  for (let w = 0; w < weeks; w++) {
    const m = cells[w * 7]!.date.getMonth()
    if (m !== lastMonth) {
      months.push({ col: w, label: MONTHS[m]! })
      lastMonth = m
    }
  }

  const busiest = weekday.reduce((best, d, i, arr) => (d.count > arr[best]!.count ? i : best), 0)

  return {
    weeks,
    cells,
    total: live.reduce((s, c) => s + c.count, 0),
    max: Math.max(0, ...live.map((c) => c.count)),
    activeDays: live.filter((c) => c.count > 0).length,
    weekly,
    weekday,
    months,
    busiestWeekday: busiest,
  }
}

export function formatDay(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}
