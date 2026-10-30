import { describe, expect, it } from 'vitest'
import {
  cvFileName,
  cvSections,
  escapeLatex,
  exportToLatex,
  exportToMarkdown,
  type CvExportOptions,
} from './cvExport'
import {
  academicSamplePreset,
  DEFAULT_SECTION_VISIBILITY,
  professionalSamplePreset,
  type CvData,
} from '@/data/cvDefaults'

const academic: CvExportOptions = {
  mode: 'academic',
  visibility: DEFAULT_SECTION_VISIBILITY.academic,
  style: 'academic-latex',
  density: 'normal',
  accent: '#d95926',
}
const professional: CvExportOptions = {
  mode: 'professional',
  visibility: DEFAULT_SECTION_VISIBILITY.professional,
  style: 'modern-sans',
  density: 'compact',
  accent: '#1d4ed8',
}

describe('cvSections', () => {
  it('lists the sections the preview shows, in its order', () => {
    expect(cvSections(academicSamplePreset, 'academic', academic.visibility).map((s) => s.title)).toEqual([
      'Research Interests',
      'Education',
      'Publications & Preprints',
      'Research & Academic Experience',
      'Selected Projects',
      'Technical Competencies',
      'Honors & Awards',
    ])
  })

  it('shows the summary instead of research interests when those are hidden or empty', () => {
    const titles = cvSections(academicSamplePreset, 'academic', { ...academic.visibility, researchInterests: false }).map(
      (s) => s.title,
    )
    expect(titles[0]).toBe('Research Overview')
    expect(cvSections(professionalSamplePreset, 'professional', professional.visibility)[0]?.title).toBe('Executive Summary')
  })

  it('skips hidden and empty sections', () => {
    const cv: CvData = { ...academicSamplePreset, awards: [] }
    const keys = cvSections(cv, 'academic', { ...academic.visibility, education: false }).map((s) => s.key)
    expect(keys).not.toContain('education')
    expect(keys).not.toContain('awards')
  })
})

describe('escapeLatex', () => {
  it('escapes special characters in a single pass', () => {
    expect(escapeLatex('100% secure & fast')).toBe('100\\% secure \\& fast')
    expect(escapeLatex('Cost: $50_000')).toBe('Cost: \\$50\\_000')
    expect(escapeLatex('{curly}')).toBe('\\{curly\\}')
    // A backslash must not have its own replacement's braces escaped again.
    expect(escapeLatex('a\\b')).toBe('a\\textbackslash{}b')
    expect(escapeLatex('x → y ≥ 2')).toBe('x $\\rightarrow$ y $\\geq$ 2')
  })
})

describe('exportToLatex', () => {
  it('builds a complete document that follows the preview', () => {
    const tex = exportToLatex(academicSamplePreset, academic)
    expect(tex).toMatch(/^% Dr\. Jane A\. Doe/)
    expect(tex).toContain('\\documentclass[11pt,a4paper]{article}')
    expect(tex).toContain('\\definecolor{accent}{HTML}{D95926}')
    expect(tex).toContain('\\cvsection{RESEARCH INTERESTS}')
    expect(tex).toContain('\\cvsection{PUBLICATIONS \\& PREPRINTS}')
    expect(tex).not.toContain('\\familydefault') // serif for the LaTeX Academic style
    expect(tex).not.toMatch(/teaching/i) // not in the preview, so not in the export
    expect(tex.trim().endsWith('\\end{document}')).toBe(true)
    // Braces balance, so the file at least parses as TeX groups.
    const opens = (tex.match(/(?<!\\)\{/g) ?? []).length
    const closes = (tex.match(/(?<!\\)\}/g) ?? []).length
    expect(opens).toBe(closes)
  })

  it('bolds the CV owner (ignoring a title such as "Dr.") in author lists and links publications', () => {
    const tex = exportToLatex(academicSamplePreset, academic)
    expect(tex).toContain('\\item \\textbf{Jane A. Doe}, Alex Rivera')
    expect(tex).toMatch(/\\href\{https:\/\/doi\.org\/[^}]+\}\{Link\}/)
  })

  it('uses a sans face, the accent rule and smaller type for a compact modern CV', () => {
    const tex = exportToLatex(professionalSamplePreset, professional)
    expect(tex).toContain('\\documentclass[10pt,a4paper]{article}')
    expect(tex).toContain('\\renewcommand{\\familydefault}{\\sfdefault}')
    expect(tex).toContain('{\\color{accent}\\hrule height 1.2pt}')
    expect(tex).toContain('\\cvsection{Work Experience}')
    expect(tex).toContain('Alex Mercer')
  })

  it('escapes URLs for hyperref and leaves no separators for missing fields', () => {
    const cv: CvData = {
      ...professionalSamplePreset,
      basics: { ...professionalSamplePreset.basics, email: '', website: 'https://example.com/a%20b#top' },
      awards: [{ id: 'a', title: 'Prize', issuer: '', year: '' }],
    }
    const tex = exportToLatex(cv, { ...professional, visibility: { ...professional.visibility, awards: true } })
    expect(tex).toContain('\\href{https://example.com/a\\%20b\\#top}{Portfolio}')
    expect(tex).toContain('\\textbf{Prize} \\hfill \\par')
    expect(tex).not.toContain('mailto:')
  })
})

describe('exportToMarkdown', () => {
  it('writes the preview sections as GitHub-flavoured Markdown', () => {
    const md = exportToMarkdown(academicSamplePreset, academic)
    expect(md.startsWith('# Dr\\. Jane A\\. Doe') || md.startsWith('# Dr. Jane A. Doe')).toBe(true)
    expect(md).toContain('## Research Interests')
    expect(md).toContain('## Publications & Preprints')
    expect(md).toContain('## Research & Academic Experience')
    expect(md).toContain('[LinkedIn](<https://www.linkedin.com/in/example/>)')
    expect(md).not.toMatch(/teaching/i)
    expect(md).not.toMatch(/\n{3,}/)
  })

  it('includes certifications in professional mode and escapes Markdown syntax', () => {
    const cv: CvData = {
      ...professionalSamplePreset,
      basics: { ...professionalSamplePreset.basics, summary: 'Ships *fast* code_paths' },
    }
    const md = exportToMarkdown(cv, professional)
    expect(md).toContain('## Executive Summary')
    expect(md).toContain('Ships \\*fast\\* code\\_paths')
    if (professionalSamplePreset.certifications.length > 0) expect(md).toContain('## Certifications')
  })
})

describe('cvFileName', () => {
  it('turns the name into a safe file name', () => {
    expect(cvFileName('Dr. Jane A. Doe')).toBe('Dr-Jane-A-Doe-CV')
    expect(cvFileName('নুর মোহাম্মদ')).toBe('নুর-মোহাম্মদ-CV')
    expect(cvFileName('  ')).toBe('CV')
  })
})
