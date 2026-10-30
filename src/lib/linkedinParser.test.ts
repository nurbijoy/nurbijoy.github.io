import { describe, expect, it } from 'vitest'
import { extractLinkedInHandle, parseLinkedInInput } from './linkedinParser'
import { blankPreset } from '@/data/cvDefaults'

describe('linkedinParser', () => {
  it('extracts handle from various URL formats', () => {
    expect(extractLinkedInHandle('https://www.linkedin.com/in/john-doe/')).toBe('john-doe')
    expect(extractLinkedInHandle('https://linkedin.com/in/jane_doe')).toBe('jane_doe')
    expect(extractLinkedInHandle('http://www.linkedin.com/in/dev123/')).toBe('dev123')
    expect(extractLinkedInHandle('www.linkedin.com/in/alice-smith')).toBe('alice-smith')
    expect(extractLinkedInHandle('alexmercer')).toBe('alexmercer')
    expect(extractLinkedInHandle('invalid url without handle')).toBe(null)
  })

  it('populates sample profile with Stanford and MIT when LinkedIn URL is provided', () => {
    const res = parseLinkedInInput('https://www.linkedin.com/in/alex-mercer/', blankPreset)
    expect(res.detectedSource).toBe('url-only')
    expect(res.data.basics?.name).toBe('Alex Mercer')
    expect(res.data.basics?.linkedin).toBe('https://www.linkedin.com/in/alex-mercer/')
    expect(res.data.education?.[0]?.institution).toBe('Stanford University')
    expect(res.data.education?.[0]?.gpa).toContain('3.92')
    expect(res.data.experience?.[0]?.company).toBe('MIT CSAIL')
  })

  it('parses free-form pasted LinkedIn text with education, CGPA, and experience', () => {
    const rawText = `Jane Tech Lead
Senior Distributed Systems Architect
San Francisco, CA

About
Building resilient distributed storage systems.

Experience
Staff Engineer at Cloud Corp
2022 - Present
• Designed fault-tolerant message pipeline
• Reduced latency by 40%

Education
University of California, Berkeley
Bachelor of Science
2016 - 2020
Grade: CGPA 3.90 / 4.00

Skills
Go, Kubernetes, Distributed Systems, Python`

    const res = parseLinkedInInput(rawText, blankPreset)
    expect(res.detectedSource).toBe('text-dump')
    expect(res.data.basics?.name).toBe('Jane Tech Lead')
    expect(res.data.basics?.headline).toBe('Senior Distributed Systems Architect')
    expect(res.data.education?.[0]?.institution).toContain('Berkeley')
    expect(res.data.education?.[0]?.gpa).toContain('3.90')
    expect(res.data.experience?.[0]?.role).toBe('Staff Engineer')
    expect(res.data.experience?.[0]?.company).toBe('Cloud Corp')
    expect(res.data.experience?.[0]?.bullets.length).toBe(2)
  })

  it('parses valid JSON data', () => {
    const jsonStr = JSON.stringify({
      basics: {
        name: 'Ada Lovelace',
        headline: 'First Computer Programmer',
        email: 'ada@example.com',
      },
    })
    const res = parseLinkedInInput(jsonStr, blankPreset)
    expect(res.detectedSource).toBe('json')
    expect(res.data.basics?.name).toBe('Ada Lovelace')
    expect(res.data.basics?.headline).toBe('First Computer Programmer')
  })

  it('handles empty input gracefully', () => {
    const res = parseLinkedInInput('   ', blankPreset)
    expect(res.detectedSource).toBe('unknown')
  })
})
