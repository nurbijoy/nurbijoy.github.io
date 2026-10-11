import { describe, expect, it } from 'vitest'
import type { Publication } from '@/data/publications'
import { bibKey, toBibtex } from './bibtex'

const base: Publication = {
  id: 'p',
  title: 'Provenance & Trust: 100% Verifiable Builds',
  authors: ['Ada Lovelace', 'Alan Turing'],
  venue: 'Journal of Tests',
  year: 2026,
  month: 8,
  type: 'Journal',
  status: 'Published',
  links: { doi: 'https://doi.org/10.1000/xyz123', pdf: 'https://example.org/p.pdf' },
}

describe('bibKey', () => {
  it('is lastname + year + first meaningful word, ASCII-only', () => {
    expect(bibKey(base)).toBe('lovelace2026provenance')
  })
  it('survives missing authors and odd titles', () => {
    expect(bibKey({ authors: [], year: 2025, title: '1 2 3' })).toBe('anon2025paper')
  })
})

describe('toBibtex', () => {
  const out = toBibtex(base)

  it('picks the right entry type', () => {
    expect(out.startsWith('@article{lovelace2026provenance,')).toBe(true)
    expect(toBibtex({ ...base, type: 'Conference' })).toContain('@inproceedings{')
    expect(toBibtex({ ...base, type: 'Preprint' })).toContain('@misc{')
    expect(toBibtex({ ...base, type: 'Thesis' })).toContain('@mastersthesis{')
  })

  it('joins authors with "and" and escapes TeX specials', () => {
    expect(out).toContain('author = {Ada Lovelace and Alan Turing}')
    expect(out).toContain('title = {{Provenance \\& Trust: 100\\% Verifiable Builds}}')
  })

  it('strips the DOI resolver prefix and falls back to the pdf URL', () => {
    expect(out).toContain('doi = {10.1000/xyz123}')
    expect(out).toContain('url = {https://example.org/p.pdf}')
  })

  it('omits empty fields and is well-formed', () => {
    const bare = toBibtex({ ...base, month: undefined, links: undefined })
    expect(bare).not.toContain('month')
    expect(bare).not.toContain('doi')
    expect(bare.trimEnd().endsWith('}')).toBe(true)
  })
})
