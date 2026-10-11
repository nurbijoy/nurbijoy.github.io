import type { Publication } from '@/data/publications'

const ESCAPES: Record<string, string> = { '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', _: '\\_' }
const escapeTex = (s: string) => s.replace(/[&%$#_]/g, (c) => ESCAPES[c]!)

/** `lastname + year + first meaningful title word`, ASCII-only, e.g. `author2026provenance`. */
export function bibKey(p: Pick<Publication, 'authors' | 'year' | 'title'>): string {
  const last = (p.authors[0] ?? 'anon').trim().split(/\s+/).pop() ?? 'anon'
  const word = p.title.split(/\s+/).find((w) => /^[A-Za-z]{4,}$/.test(w)) ?? 'paper'
  return `${last}${p.year}${word}`.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function entryType(p: Publication): string {
  switch (p.type) {
    case 'Journal':
      return 'article'
    case 'Conference':
    case 'Workshop':
      return 'inproceedings'
    case 'Thesis':
      return 'mastersthesis'
    default:
      return 'misc'
  }
}

/** A ready-to-paste BibTeX record for the "Cite" button. */
export function toBibtex(p: Publication): string {
  const fields: [string, string | number | undefined][] = [
    ['author', p.authors.map(escapeTex).join(' and ')],
    ['title', `{${escapeTex(p.title)}}`],
    [p.type === 'Journal' ? 'journal' : p.type === 'Conference' || p.type === 'Workshop' ? 'booktitle' : 'howpublished', escapeTex(p.venue)],
    ['year', p.year],
    ['month', p.month],
    ['doi', p.links?.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')],
    ['url', p.links?.pdf ?? p.links?.arxiv],
  ]
  const body = fields
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n')
  return `@${entryType(p)}{${bibKey(p)},\n${body}\n}`
}
