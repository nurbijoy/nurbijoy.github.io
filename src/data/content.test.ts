import { describe, expect, it } from 'vitest'
import { interests } from './interests'
import { projects } from './projects'
import { publications } from './publications'
import { directions, graphLinks, graphNodes } from './research'
import { domains, MIN_LEVEL, shownDomains, shownSkills, skills } from './skills'
import { education, nav } from './site'

const unique = (xs: readonly string[]) => new Set(xs).size === xs.length

describe('content integrity', () => {
  it('projects have unique ids and plausible years', () => {
    expect(unique(projects.map((p) => p.id))).toBe(true)
    for (const p of projects) {
      expect(p.title.length).toBeGreaterThan(0)
      expect(p.year).toBeGreaterThan(2000)
      expect(p.stack.length).toBeGreaterThan(0)
    }
  })

  it('publication ids are unique and every entry credits authors', () => {
    expect(unique(publications.map((p) => p.id))).toBe(true)
    for (const p of publications) expect(p.authors.length).toBeGreaterThan(0)
  })

  it('has at most one featured publication and one featured project', () => {
    expect(publications.filter((p) => p.featured).length).toBeLessThanOrEqual(1)
    expect(projects.filter((p) => p.featured).length).toBeLessThanOrEqual(1)
  })

  it('research graph: ids unique, edges reference real nodes, no self-loops, no duplicates, no orphans', () => {
    const ids = graphNodes.map((n) => n.id)
    expect(unique(ids)).toBe(true)
    const known = new Set(ids)
    const seen = new Set<string>()
    const connected = new Set<string>()
    for (const [a, b] of graphLinks) {
      expect(known.has(a), `unknown node ${a}`).toBe(true)
      expect(known.has(b), `unknown node ${b}`).toBe(true)
      expect(a).not.toBe(b)
      const key = [a, b].sort().join('|')
      expect(seen.has(key), `duplicate edge ${key}`).toBe(false)
      seen.add(key)
      connected.add(a)
      connected.add(b)
    }
    expect(ids.filter((id) => !connected.has(id))).toEqual([])
  })

  it('research directions and interests have unique ids', () => {
    expect(unique(directions.map((d) => d.id))).toBe(true)
    expect(unique(interests.map((i) => i.id))).toBe(true)
  })

  it('every skill uses a known domain and a 1–5 level', () => {
    for (const s of skills) {
      expect(domains).toContain(s.domain)
      expect(s.level).toBeGreaterThanOrEqual(1)
      expect(s.level).toBeLessThanOrEqual(5)
    }
  })

  it('only advanced skills are shown, and the radar has enough axes to draw', () => {
    expect(shownSkills.every((s) => s.level >= MIN_LEVEL)).toBe(true)
    expect(shownSkills.length).toBeLessThan(skills.length + 1)
    expect(shownDomains.length).toBeGreaterThanOrEqual(3)
  })

  it('depth-map domains are the security / data-science set (no Frontend, Backend or generic Data)', () => {
    expect([...domains]).toEqual(['Security', 'Cryptography', 'Blockchain', 'Machine Learning', 'Data Science', 'Infrastructure'])
    for (const banned of ['Frontend', 'Backend', 'Data']) expect(shownDomains as string[]).not.toContain(banned)
  })

  it('education lists the B.Sc. and the M.Sc., earliest first', () => {
    expect(education).toHaveLength(2)
    expect(education[0]!.degree).toMatch(/^B\.Sc\. in Computer Science and Engineering/)
    expect(education[0]!.school).toBe('Port City International University (PCIU)')
    expect(education[1]!.degree).toMatch(/^M\.Sc\. Engg in Information Security/)
  })

  it('navigation ids are unique', () => {
    expect(unique(nav.map((n) => n.id))).toBe(true)
  })
})

describe('content rules', () => {
  const files = import.meta.glob(['/src/**/*.{ts,tsx,css}', '/index.html'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  it('mentions the graduate programme only in the education record (src/data/site.ts)', () => {
    const offenders = Object.entries(files)
      .filter(([path]) => !path.endsWith('/src/data/site.ts') && !path.endsWith('.test.ts'))
      .filter(([, text]) => /\bBUET\b|Bangladesh University of Engineering/i.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('never uses enrolment-status wording ("admitted" / "pursuing") anywhere in the source', () => {
    const offenders = Object.entries(files)
      .filter(([path]) => !path.endsWith('.test.ts'))
      .filter(([, text]) => /\b(admitted|pursuing)\b/i.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('contains no stray control characters (a backspace once slipped into a regex and silently disabled a test)', () => {
    const offenders = Object.entries(files)
      // eslint-disable-next-line no-control-regex
      .filter(([, text]) => /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('has no visitor-facing developer hints (file paths) in rendered copy', () => {
    const offenders = Object.entries(files)
      .filter(([path]) => path.includes('/src/components/'))
      .filter(([, text]) => /(?:>|=\s*["'`])[^<>{}\n]*src\/data\/[^<>{}\n]*(?:<|["'`])/.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })
})
