import { describe, expect, it } from 'vitest'
import { escapeLatex, exportToLatex, exportToMarkdown, exportToJson } from './cvExport'
import { academicSamplePreset, professionalSamplePreset } from '@/data/cvDefaults'

describe('cvExport', () => {
  it('escapes latex special characters properly', () => {
    expect(escapeLatex('100% secure & fast')).toBe('100\\% secure \\& fast')
    expect(escapeLatex('Cost: $50_000')).toBe('Cost: \\$50\\_000')
    expect(escapeLatex('{curly}')).toBe('\\{curly\\}')
  })

  it('generates compilable latex structure with academic mode', () => {
    const latex = exportToLatex(academicSamplePreset, 'academic')
    expect(latex).toContain('\\documentclass')
    expect(latex).toContain('Jane A. Doe')
    expect(latex).toContain('Research Interests')
    expect(latex).toContain('Publications \\& Preprints')
    expect(latex).toContain('\\end{document}')
  })

  it('generates latex with professional mode', () => {
    const latex = exportToLatex(professionalSamplePreset, 'professional')
    expect(latex).toContain('Work Experience')
    expect(latex).toContain('Professional Summary')
    expect(latex).toContain('Alex Mercer')
  })

  it('generates valid markdown document', () => {
    const md = exportToMarkdown(academicSamplePreset, 'academic')
    expect(md).toContain('# Dr. Jane A. Doe')
    expect(md).toContain('## Research Interests')
    expect(md).toContain('## Publications & Preprints')
  })

  it('exports valid json roundtrip', () => {
    const json = exportToJson(professionalSamplePreset)
    const parsed = JSON.parse(json)
    expect(parsed.basics.name).toBe('Alex Mercer')
  })
})
