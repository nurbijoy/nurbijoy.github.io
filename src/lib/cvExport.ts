import type { CvBasics, CvData, CvDensity, CvMode, CvSectionVisibility, CvStyle } from '@/data/cvDefaults'

export interface CvExportOptions {
  mode: CvMode
  visibility: CvSectionVisibility
  style: CvStyle
  density: CvDensity
  /** Accent colour as "#rrggbb". */
  accent: string
}

export type CvSectionKey =
  | 'researchInterests'
  | 'summary'
  | 'education'
  | 'publications'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'awards'
  | 'certifications'

export interface CvSection {
  key: CvSectionKey
  title: string
}

/**
 * The sections the live preview shows, in its order and with its headings. The preview and
 * every export read this list, so a downloaded file always matches what is on screen.
 */
export function cvSections(cv: CvData, mode: CvMode, visibility: CvSectionVisibility): CvSection[] {
  const ac = mode === 'academic'
  const interests = ac && visibility.researchInterests && cv.basics.researchInterests.length > 0
  const all: [CvSectionKey, string, boolean][] = [
    ['researchInterests', 'Research Interests', interests],
    // With research interests on show, the academic CV leads with those instead of the summary.
    ['summary', ac ? 'Research Overview' : 'Executive Summary', !!cv.basics.summary && !interests],
    ['education', 'Education', visibility.education && cv.education.length > 0],
    ['publications', 'Publications & Preprints', visibility.publications && cv.publications.length > 0],
    [
      'experience',
      ac ? 'Research & Academic Experience' : 'Work Experience',
      visibility.experience && cv.experience.length > 0,
    ],
    ['projects', 'Selected Projects', visibility.projects && cv.projects.length > 0],
    ['skills', 'Technical Competencies', visibility.skills && cv.skills.length > 0],
    ['awards', 'Honors & Awards', visibility.awards && cv.awards.length > 0],
    ['certifications', 'Certifications', visibility.certifications && cv.certifications.length > 0],
  ]
  return all.filter(([, , show]) => show).map(([key, title]) => ({ key, title }))
}

/** Joins the non-empty parts, so missing dates or issuers leave no dangling separator. */
export function joinSome(sep: string, ...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(sep)
}

export const dateRange = (start?: string, end?: string) => joinSome(' – ', start, end)

export interface ContactItem {
  text: string
  href?: string
}

/** The header's contact line, in the preview's order. */
export function contactItems(b: CvBasics): ContactItem[] {
  const items: (ContactItem | false)[] = [
    !!b.email && { text: b.email, href: `mailto:${b.email}` },
    !!b.phone && { text: b.phone },
    !!b.location && { text: b.location },
    !!b.website && { text: 'Portfolio', href: b.website },
    !!b.linkedin && { text: 'LinkedIn', href: b.linkedin },
    !!b.github && { text: 'GitHub', href: b.github },
  ]
  return items.filter((i): i is ContactItem => !!i)
}

/** "Dr. Jane A. Doe" → "Dr-Jane-A-Doe-CV", for download file names. */
export function cvFileName(name: string): string {
  // \p{M} keeps combining marks, e.g. the vowel signs of Bangla script.
  const base = name.trim().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
  return base ? `${base}-CV` : 'CV'
}

// ────────────────────────────── LaTeX ──────────────────────────────

const LATEX_ESCAPES: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '%': '\\%',
  $: '\\$',
  '&': '\\&',
  '#': '\\#',
  _: '\\_',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
  // Symbols pdflatex's utf8 input has no text glyph for.
  '→': '$\\rightarrow$',
  '←': '$\\leftarrow$',
  '≤': '$\\leq$',
  '≥': '$\\geq$',
  '≈': '$\\approx$',
}

/** Escapes special LaTeX characters to prevent compile errors. */
export function escapeLatex(text: string): string {
  if (!text) return ''
  return text.replace(/[\\{}%$&#_~^→←≤≥≈]/g, (c) => LATEX_ESCAPES[c]!)
}

/** hyperref reads URLs nearly verbatim; only % and # need escaping, and stray braces are dropped. */
function latexUrl(url: string): string {
  return url.replace(/[{}\\]/g, '').replace(/[%#]/g, (c) => `\\${c}`)
}

const latexHref = (url: string, label: string) => `\\href{${latexUrl(url)}}{${escapeLatex(label)}}`

/** Lines of one entry: line breaks between them, a paragraph break after. */
const latexLines = (...lines: string[]) => `${lines.filter(Boolean).join('\\\\\n')}\\par\n`

function latexList(items: string[]): string {
  if (items.length === 0) return ''
  return `\\begin{itemize}[leftmargin=1.3em,noitemsep,topsep=2pt]\n${items.map((i) => `  \\item ${escapeLatex(i)}\n`).join('')}\\end{itemize}\n`
}

/**
 * Generates a compilable LaTeX document (pdflatex or Overleaf) that follows the preview:
 * same sections, serif or sans-serif face per layout style, and the chosen accent colour.
 */
export function exportToLatex(cv: CvData, opts: CvExportOptions): string {
  const b = cv.basics
  const compact = opts.density === 'compact'
  const upper = opts.style !== 'modern-sans'
  const hex = opts.accent.replace('#', '').toUpperCase()
  const titleColor = opts.style === 'swiss-clean' ? 'accent' : 'ink'
  const ruleColor = opts.style === 'modern-sans' ? 'accent' : opts.style === 'swiss-clean' ? 'rule' : 'ink'
  const sep = ' ~$\\cdot$~ '

  const contact = contactItems(b)
    .map((c) => (c.href ? latexHref(c.href, c.text) : escapeLatex(c.text)))
    .join(sep)

  let body = ''
  for (const { key, title } of cvSections(cv, opts.mode, opts.visibility)) {
    body += `\\cvsection{${escapeLatex(upper ? title.toUpperCase() : title)}}\n`
    switch (key) {
      case 'researchInterests':
        body += `${escapeLatex(b.researchInterests.join(', '))}\\par\n`
        break
      case 'summary':
        body += `${escapeLatex(b.summary)}\\par\n`
        break
      case 'education':
        for (const edu of cv.education) {
          body += latexLines(
            `\\textbf{${escapeLatex(edu.institution)}} \\hfill ${escapeLatex(dateRange(edu.startDate, edu.endDate))}`,
            joinSome(
              ' \\hfill ',
              joinSome(', ', edu.degree, edu.field) && `\\textit{${escapeLatex(joinSome(', ', edu.degree, edu.field))}}`,
              edu.location && `\\textit{${escapeLatex(edu.location)}}`,
            ),
            edu.gpa ? `\\textbf{CGPA / Grade:} \\textcolor{accent}{${escapeLatex(edu.gpa)}}` : '',
            edu.details ? `{\\small ${escapeLatex(edu.details)}}` : '',
          )
          body += '\\vspace{0.35em}\n'
        }
        break
      case 'publications':
        body += '\\begin{enumerate}[leftmargin=1.6em,noitemsep,topsep=0pt]\n'
        for (const pub of cv.publications) {
          // Academic convention: the CV owner's name in bold within the author list.
          const owner = escapeLatex(b.name.replace(/^(?:(?:dr|prof|mr|mrs|ms|mx)\.?\s+)+/i, ''))
          const authors = owner
            ? escapeLatex(pub.authors).split(owner).join(`\\textbf{${owner}}`)
            : escapeLatex(pub.authors)
          const link = pub.doiOrUrl ? ` [${latexHref(pub.doiOrUrl, 'Link')}]` : ''
          const parts = joinSome(
            ', ',
            authors,
            `\`\`${escapeLatex(pub.title)}''`,
            pub.venue && `\\textit{${escapeLatex(pub.venue)}}`,
            escapeLatex(pub.year),
          )
          body += `  \\item ${parts}.${link}\n`
        }
        body += '\\end{enumerate}\n'
        break
      case 'experience':
        for (const exp of cv.experience) {
          const heading = joinSome(
            sep,
            exp.role && `\\textbf{${escapeLatex(exp.role)}}`,
            exp.company && `\\textit{${escapeLatex(exp.company)}}`,
          )
          body += latexLines(
            `${heading} \\hfill ${escapeLatex(dateRange(exp.startDate, exp.endDate))}`,
            exp.location ? `{\\small\\textit{${escapeLatex(exp.location)}}}` : '',
          )
          body += latexList(exp.bullets)
          if (exp.technologies.length > 0) {
            body += `{\\small \\textbf{Technologies:} ${escapeLatex(exp.technologies.join(', '))}}\\par\n`
          }
          body += '\\vspace{0.35em}\n'
        }
        break
      case 'projects':
        for (const proj of cv.projects) {
          const name = proj.url ? latexHref(proj.url, proj.name) : escapeLatex(proj.name)
          const heading = joinSome(sep, `\\textbf{${name}}`, proj.role && `\\textit{${escapeLatex(proj.role)}}`)
          body += latexLines(`${heading} \\hfill ${escapeLatex(proj.year ?? '')}`, escapeLatex(proj.description))
          body += latexList(proj.bullets)
          if (proj.stack.length > 0) {
            body += `{\\small \\textbf{Stack:} ${escapeLatex(proj.stack.join(', '))}}\\par\n`
          }
          body += '\\vspace{0.35em}\n'
        }
        break
      case 'skills':
        for (const cat of cv.skills) {
          body += `\\textbf{${escapeLatex(cat.category)}:} ${escapeLatex(cat.items.join(', '))}\\par\n`
        }
        break
      case 'awards':
        for (const aw of cv.awards) {
          body += latexLines(
            `${joinSome(sep, `\\textbf{${escapeLatex(aw.title)}}`, aw.issuer && escapeLatex(aw.issuer))} \\hfill ${escapeLatex(aw.year)}`,
            aw.description ? `{\\small ${escapeLatex(aw.description)}}` : '',
          )
        }
        break
      case 'certifications':
        for (const c of cv.certifications) {
          const name = c.url ? latexHref(c.url, c.name) : escapeLatex(c.name)
          body += latexLines(`${joinSome(sep, `\\textbf{${name}}`, c.issuer && escapeLatex(c.issuer))} \\hfill ${escapeLatex(c.year)}`)
        }
        break
    }
  }

  return `% ${b.name || 'Curriculum Vitae'} — generated by the CV Builder at nurbijoy.github.io/showcase
% Compiles with pdflatex (Overleaf's default). Use XeLaTeX or LuaLaTeX for non-Latin scripts.
\\documentclass[${compact ? '10pt' : '11pt'},a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${compact ? '1.4cm' : '1.8cm'}]{geometry}
\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage{parskip}
\\usepackage{hyperref}
${opts.style === 'academic-latex' ? '' : '\\renewcommand{\\familydefault}{\\sfdefault}\n'}
\\definecolor{accent}{HTML}{${hex}}
\\definecolor{ink}{HTML}{0F172A}
\\definecolor{rule}{HTML}{E2E8F0}
\\hypersetup{colorlinks=true, urlcolor=accent, linkcolor=ink}
\\setlength{\\parskip}{${compact ? '0.15em' : '0.3em'}}
\\pagestyle{empty}

\\newcommand{\\cvsection}[1]{%
  \\vspace{${compact ? '0.5em' : '0.9em'}}%
  {\\large\\bfseries\\color{${titleColor}}#1}\\par\\nopagebreak\\vspace{0.1em}%
  {\\color{${ruleColor}}\\hrule height ${opts.style === 'modern-sans' ? '1.2pt' : '0.6pt'}}\\nopagebreak\\vspace{0.45em}%
}

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries ${escapeLatex(b.name)}}\\par
${b.headline ? `  \\vspace{0.25em}{\\large\\itshape ${escapeLatex(b.headline)}}\\par\n` : ''}${contact ? `  \\vspace{0.35em}{\\small ${contact}}\\par\n` : ''}\\end{center}

${body}
\\end{document}
`
}

// ────────────────────────────── Markdown ──────────────────────────────

/** Escapes characters Markdown would treat as formatting. */
function md(text: string): string {
  return text.replace(/([\\`*_[\]<>|])/g, '\\$1')
}

const mdLink = (label: string, url: string) => `[${md(label)}](<${url}>)`

/** GitHub-flavoured Markdown with the preview's sections and headings. */
export function exportToMarkdown(cv: CvData, opts: CvExportOptions): string {
  const b = cv.basics
  const out: string[] = [`# ${md(b.name || 'Curriculum Vitae')}`, '']
  if (b.headline) out.push(`*${md(b.headline)}*`, '')
  const contact = contactItems(b).map((c) => (c.href ? mdLink(c.text, c.href) : md(c.text)))
  if (contact.length > 0) out.push(contact.join(' · '), '')

  // Two trailing spaces force a line break inside a paragraph.
  const block = (...lines: string[]) => {
    const kept = lines.filter(Boolean)
    if (kept.length > 0) out.push(kept.join('  \n'), '')
  }
  const bullets = (items: string[]) => {
    if (items.length > 0) out.push(...items.map((i) => `- ${md(i)}`), '')
  }

  for (const { key, title } of cvSections(cv, opts.mode, opts.visibility)) {
    out.push(`## ${title}`, '')
    switch (key) {
      case 'researchInterests':
        block(md(b.researchInterests.join(', ')))
        break
      case 'summary':
        block(md(b.summary))
        break
      case 'education':
        for (const edu of cv.education) {
          const degree = joinSome(', ', edu.degree, edu.field)
          block(
            joinSome(' — ', `**${md(edu.institution)}**`, dateRange(edu.startDate, edu.endDate)),
            joinSome(' · ', degree && `*${md(degree)}*`, edu.location && md(edu.location)),
            edu.gpa ? `**CGPA / Grade:** ${md(edu.gpa)}` : '',
            edu.details ? md(edu.details) : '',
          )
        }
        break
      case 'publications':
        cv.publications.forEach((pub, i) => {
          const link = pub.doiOrUrl ? ` ${mdLink('Link', pub.doiOrUrl)}` : ''
          const text = joinSome(', ', md(pub.authors), `"${md(pub.title)}"`, pub.venue && `*${md(pub.venue)}*`, md(pub.year))
          out.push(`${i + 1}. ${text}.${link}`)
        })
        out.push('')
        break
      case 'experience':
        for (const exp of cv.experience) {
          out.push(`### ${md(joinSome(' · ', exp.role, exp.company))}`, '')
          block(joinSome(' · ', dateRange(exp.startDate, exp.endDate) && `*${dateRange(exp.startDate, exp.endDate)}*`, exp.location && md(exp.location)))
          bullets(exp.bullets)
          if (exp.technologies.length > 0) block(`**Technologies:** ${md(exp.technologies.join(', '))}`)
        }
        break
      case 'projects':
        for (const proj of cv.projects) {
          const name = proj.url ? mdLink(proj.name, proj.url) : md(proj.name)
          out.push(`### ${joinSome(' · ', name, proj.role && md(proj.role))}`, '')
          block(proj.year ? `*${md(proj.year)}*` : '', md(proj.description))
          bullets(proj.bullets)
          if (proj.stack.length > 0) block(`**Stack:** ${md(proj.stack.join(', '))}`)
        }
        break
      case 'skills':
        out.push(...cv.skills.map((s) => `- **${md(s.category)}:** ${md(s.items.join(', '))}`), '')
        break
      case 'awards':
        for (const aw of cv.awards) {
          out.push(`- ${joinSome(' · ', `**${md(aw.title)}**`, aw.issuer && md(aw.issuer), aw.year && md(aw.year))}`)
          if (aw.description) out.push(`  ${md(aw.description)}`)
        }
        out.push('')
        break
      case 'certifications':
        for (const c of cv.certifications) {
          const name = c.url ? mdLink(c.name, c.url) : md(c.name)
          out.push(`- ${joinSome(' · ', `**${name}**`, c.issuer && md(c.issuer), c.year && md(c.year))}`)
        }
        out.push('')
        break
    }
  }

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
}

/** Triggers a browser download of a Blob or text with the given file name. */
export function downloadFile(content: Blob | string, filename: string, mimeType?: string): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
