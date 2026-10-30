import { inflateRawSync } from 'node:zlib'
import { Packer } from 'docx'
import { describe, expect, it } from 'vitest'
import { buildCvDocx } from './cvDocx'
import type { CvExportOptions } from './cvExport'
import { academicSamplePreset, DEFAULT_SECTION_VISIBILITY, professionalSamplePreset } from '@/data/cvDefaults'

/** Reads one file out of a ZIP via its central directory. */
function unzip(zip: Buffer, name: string): string {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let ptr = zip.readUInt32LE(eocd + 16)
  for (let n = zip.readUInt16LE(eocd + 10); n > 0; n--) {
    const method = zip.readUInt16LE(ptr + 10)
    const size = zip.readUInt32LE(ptr + 20)
    const nameLen = zip.readUInt16LE(ptr + 28)
    const local = zip.readUInt32LE(ptr + 42)
    const entry = zip.toString('utf8', ptr + 46, ptr + 46 + nameLen)
    ptr += 46 + nameLen + zip.readUInt16LE(ptr + 30) + zip.readUInt16LE(ptr + 32)
    if (entry !== name) continue
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28)
    const raw = zip.subarray(start, start + size)
    return (method === 8 ? inflateRawSync(raw) : raw).toString('utf8')
  }
  throw new Error(`${name} not in archive`)
}

const academic: CvExportOptions = {
  mode: 'academic',
  visibility: DEFAULT_SECTION_VISIBILITY.academic,
  style: 'academic-latex',
  density: 'normal',
  accent: '#d95926',
}

describe('buildCvDocx', () => {
  it('writes an A4 Word document with the preview sections, links and bullets', async () => {
    const zip = await Packer.toBuffer(buildCvDocx(academicSamplePreset, academic))
    const doc = unzip(zip, 'word/document.xml')
    const text = doc.replace(/<[^>]+>/g, '')

    expect(text).toContain('Dr. Jane A. Doe')
    for (const heading of ['RESEARCH INTERESTS', 'EDUCATION', 'PUBLICATIONS & PREPRINTS', 'HONORS & AWARDS']) {
      expect(text).toContain(heading.replace('&', '&amp;'))
    }
    expect(text).not.toMatch(/teaching/i)
    expect(doc).toContain('w:w="11906"') // A4 width
    expect(doc).toContain('w:val="right"') // right-aligned date tab stop
    expect(doc).toContain('<w:numPr>') // real bullet lists
    expect(doc).toContain('D95926') // accent colour
    expect(unzip(zip, 'word/styles.xml')).toContain('w:ascii="Cambria"') // document default font

    const rels = unzip(zip, 'word/_rels/document.xml.rels')
    expect(rels).toContain('https://www.linkedin.com/in/example/')
    expect(rels).toContain('TargetMode="External"')
    expect(unzip(zip, 'docProps/core.xml')).toContain('Dr. Jane A. Doe — CV')
  })

  it('switches font and headings for the modern style', async () => {
    const zip = await Packer.toBuffer(
      buildCvDocx(professionalSamplePreset, {
        mode: 'professional',
        visibility: DEFAULT_SECTION_VISIBILITY.professional,
        style: 'modern-sans',
        density: 'compact',
        accent: '#1d4ed8',
      }),
    )
    const doc = unzip(zip, 'word/document.xml')
    expect(unzip(zip, 'word/styles.xml')).toContain('w:ascii="Calibri"')
    expect(doc.replace(/<[^>]+>/g, '')).toContain('Work Experience')
    expect(doc).toContain('1D4ED8')
  })
})
