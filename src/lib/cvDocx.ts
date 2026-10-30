import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
  type IParagraphOptions,
  type IRunOptions,
  type ParagraphChild,
} from 'docx'
import type { CvData, CvStyle } from '@/data/cvDefaults'
import { contactItems, cvSections, dateRange, joinSome, type CvExportOptions } from './cvExport'

/** Office fonts that read like the preview's three layout styles. */
const FONTS: Record<CvStyle, string> = {
  'academic-latex': 'Cambria',
  'modern-sans': 'Calibri',
  'swiss-clean': 'Arial',
}

// A4, in twentieths of a point.
const PAGE_WIDTH = 11906
const PAGE_HEIGHT = 16838

const INK = '0F172A'
const TEXT = '1E293B'
const SUBTLE = '334155'
const MUTED = '64748B'
const RULE = 'E2E8F0'

/**
 * Builds an editable Word document laid out like the live preview: same sections and order,
 * right-aligned dates on a tab stop, real bullet lists, clickable links, accent colour.
 */
export function buildCvDocx(cv: CvData, opts: CvExportOptions): Document {
  const b = cv.basics
  const accent = opts.accent.replace('#', '').toUpperCase()
  const compact = opts.density === 'compact'
  const margin = compact ? 850 : 1020 // 15 mm / 18 mm
  const rightTab = PAGE_WIDTH - 2 * margin
  const size = compact ? 19 : 21 // half-points: 9.5 pt / 10.5 pt
  const small = size - 2
  const entryGap = compact ? 60 : 120

  const run = (text: string, o: IRunOptions = {}) => new TextRun({ text, ...o })
  const link = (text: string, url: string, o: IRunOptions = {}) =>
    new ExternalHyperlink({ link: url, children: [new TextRun({ text, color: accent, underline: {}, ...o })] })
  const para = (children: ParagraphChild[], o: IParagraphOptions = {}) =>
    new Paragraph({ children, tabStops: [{ type: TabStopType.RIGHT, position: rightTab }], ...o })
  /** A line whose date sits flush right, like the preview's justify-between rows. */
  const dated = (left: ParagraphChild[], date: string | undefined, o: IParagraphOptions = {}) =>
    para(date ? [...left, run(`\t${date}`, { color: MUTED, size: small })] : left, o)
  const bullet = (text: string) => new Paragraph({ children: [run(text)], bullet: { level: 0 } })
  const label = (name: string, value: string) =>
    para([run(`${name}: `, { bold: true, color: INK, size: small }), run(value, { color: '475569', size: small })])

  const children: Paragraph[] = []

  // ── Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [run(b.name || 'Your Full Name', { bold: true, size: compact ? 40 : 46, color: INK })],
    }),
  )
  if (b.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [run(b.headline, { italics: true, size: size + 3, color: SUBTLE })],
      }),
    )
  }
  const contact = contactItems(b).flatMap((c, i) => {
    const sep = i > 0 ? [run('  ·  ', { color: MUTED, size: small })] : []
    return [...sep, c.href ? link(c.text, c.href, { size: small }) : run(c.text, { color: '475569', size: small })]
  })
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 6 } },
      children: contact,
    }),
  )

  // ── Sections
  const heading = (title: string) => {
    const style = opts.style
    const text = style === 'modern-sans' ? title : title.toUpperCase()
    return new Paragraph({
      keepNext: true,
      spacing: { before: compact ? 160 : 240, after: compact ? 60 : 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: style === 'modern-sans' ? 12 : style === 'academic-latex' ? 8 : 6,
          color: style === 'modern-sans' ? accent : style === 'academic-latex' ? INK : RULE,
          space: 2,
        },
      },
      children: [
        run(text, {
          bold: true,
          size: size + (style === 'swiss-clean' ? 0 : 2),
          color: style === 'swiss-clean' ? accent : INK,
          characterSpacing: style === 'modern-sans' ? 0 : 20,
        }),
      ],
    })
  }
  const first = (i: number): IParagraphOptions => ({ keepNext: true, keepLines: true, spacing: { before: i === 0 ? 0 : entryGap } })

  for (const { key, title } of cvSections(cv, opts.mode, opts.visibility)) {
    children.push(heading(title))
    switch (key) {
      case 'researchInterests':
        children.push(para([run(b.researchInterests.join(', '))]))
        break
      case 'summary':
        children.push(para([run(b.summary)]))
        break
      case 'education':
        cv.education.forEach((edu, i) => {
          children.push(dated([run(edu.institution, { bold: true, color: INK })], dateRange(edu.startDate, edu.endDate), first(i)))
          const degree = joinSome(', ', edu.degree, edu.field)
          if (degree || edu.location) {
            children.push(
              dated(degree ? [run(degree, { italics: true, color: TEXT })] : [], edu.location, {
                keepNext: !!(edu.gpa || edu.details),
              }),
            )
          }
          if (edu.gpa) {
            children.push(para([run('CGPA / Grade: ', { bold: true, color: INK, size: small }), run(edu.gpa, { bold: true, color: accent, size: small })]))
          }
          if (edu.details) children.push(para([run(edu.details, { color: '475569', size: small })]))
        })
        break
      case 'publications':
        cv.publications.forEach((pub, i) => {
          const runs: ParagraphChild[] = [run(`${i + 1}.\t`, { bold: true, color: INK })]
          if (pub.authors) runs.push(run(`${pub.authors}, `, { bold: true, color: INK }))
          runs.push(run(`“${pub.title},” `, { italics: true, color: INK }))
          if (pub.venue) runs.push(run(`${pub.venue}, `, { color: SUBTLE }))
          if (pub.year) runs.push(run(`${pub.year}.`, { color: MUTED }))
          if (pub.doiOrUrl) runs.push(run(' '), link('[Link]', pub.doiOrUrl))
          children.push(
            new Paragraph({
              children: runs,
              indent: { left: 360, hanging: 360 },
              tabStops: [{ type: TabStopType.LEFT, position: 360 }],
              spacing: { before: i === 0 ? 0 : compact ? 40 : 80 },
            }),
          )
        })
        break
      case 'experience':
        cv.experience.forEach((exp, i) => {
          const left: ParagraphChild[] = []
          if (exp.role) left.push(run(exp.role, { bold: true, color: INK }))
          if (exp.role && exp.company) left.push(run(' · ', { color: INK }))
          if (exp.company) left.push(run(exp.company, { italics: true, color: SUBTLE }))
          children.push(dated(left, dateRange(exp.startDate, exp.endDate), first(i)))
          if (exp.location) {
            children.push(para([run(exp.location, { italics: true, color: MUTED, size: small })], { keepNext: true }))
          }
          children.push(...exp.bullets.map(bullet))
          if (exp.technologies.length > 0) children.push(label('Technologies', exp.technologies.join(', ')))
        })
        break
      case 'projects':
        cv.projects.forEach((proj, i) => {
          const left: ParagraphChild[] = [
            proj.url ? link(proj.name, proj.url, { bold: true }) : run(proj.name, { bold: true, color: INK }),
          ]
          if (proj.role) left.push(run(` · ${proj.role}`, { bold: true, color: INK }))
          children.push(dated(left, proj.year, first(i)))
          if (proj.description) children.push(para([run(proj.description)]))
          children.push(...proj.bullets.map(bullet))
          if (proj.stack.length > 0) children.push(label('Stack', proj.stack.join(', ')))
        })
        break
      case 'skills':
        cv.skills.forEach((cat, i) => {
          children.push(
            para([run(`${cat.category}: `, { bold: true, color: INK }), run(cat.items.join(', '))], {
              spacing: { before: i === 0 ? 0 : 40 },
            }),
          )
        })
        break
      case 'awards':
        cv.awards.forEach((aw, i) => {
          const left: ParagraphChild[] = [run(aw.title, { bold: true, color: INK })]
          if (aw.issuer) left.push(run(` · ${aw.issuer}`, { color: SUBTLE }))
          children.push(dated(left, aw.year, { spacing: { before: i === 0 ? 0 : compact ? 40 : 80 }, keepNext: !!aw.description }))
          if (aw.description) children.push(para([run(aw.description, { color: MUTED, size: small })]))
        })
        break
      case 'certifications':
        cv.certifications.forEach((c, i) => {
          const left: ParagraphChild[] = [c.url ? link(c.name, c.url, { bold: true }) : run(c.name, { bold: true, color: INK })]
          if (c.issuer) left.push(run(` · ${c.issuer}`, { color: SUBTLE }))
          children.push(dated(left, c.year, { spacing: { before: i === 0 ? 0 : compact ? 40 : 80 } }))
        })
        break
    }
  }

  return new Document({
    creator: b.name || 'CV Builder',
    title: b.name ? `${b.name} — CV` : 'Curriculum Vitae',
    styles: {
      default: {
        document: {
          run: { font: FONTS[opts.style], size, color: TEXT },
          paragraph: { spacing: { line: compact ? 250 : 264 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        children,
      },
    ],
  })
}

export function cvToDocx(cv: CvData, opts: CvExportOptions): Promise<Blob> {
  return Packer.toBlob(buildCvDocx(cv, opts))
}
