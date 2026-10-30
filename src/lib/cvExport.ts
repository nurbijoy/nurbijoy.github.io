import type { CvData, CvMode, CvSectionVisibility } from '@/data/cvDefaults'

/** Escapes special LaTeX characters to prevent compile errors. */
export function escapeLatex(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, (c) => `\\${c}`)
    .replace(/([%$&#_])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
}

/** Formats a LaTeX section header. */
function latexSection(title: string): string {
  return `\n\\section*{${escapeLatex(title)}}\n\\vspace{-0.5em}\\hrule\\vspace{0.8em}\n`
}

/**
 * Generates an elegant, fully compilable LaTeX document ready for Overleaf or pdflatex.
 */
export function exportToLatex(
  cv: CvData,
  mode: CvMode,
  visibility?: Partial<CvSectionVisibility>,
): string {
  const b = cv.basics
  const isAc = mode === 'academic'

  const contactItems: string[] = []
  if (b.email) contactItems.push(`\\href{mailto:${b.email}}{${escapeLatex(b.email)}}`)
  if (b.phone) contactItems.push(escapeLatex(b.phone))
  if (b.location) contactItems.push(escapeLatex(b.location))
  if (b.website) contactItems.push(`\\href{${b.website}}{Website}`)
  if (b.linkedin) contactItems.push(`\\href{${b.linkedin}}{LinkedIn}`)
  if (b.github) contactItems.push(`\\href{${b.github}}{GitHub}`)

  const contactLine = contactItems.join(' ~$\\cdot$~ ')

  let body = ''

  // Research Interests (Academic)
  if (isAc && visibility?.researchInterests !== false && b.researchInterests.length > 0) {
    body += latexSection('Research Interests')
    body += '\\begin{itemize}[leftmargin=*,noitemsep,topsep=0pt]\n'
    for (const interest of b.researchInterests) {
      body += `  \\item ${escapeLatex(interest)}\n`
    }
    body += '\\end{itemize}\n'
  }

  // Executive Summary (Professional)
  if (!isAc && b.summary) {
    body += latexSection('Professional Summary')
    body += `${escapeLatex(b.summary)}\n`
  }

  // Education
  if (visibility?.education !== false && cv.education.length > 0) {
    body += latexSection('Education')
    for (const edu of cv.education) {
      body += `\\textbf{${escapeLatex(edu.institution)}} \\hfill ${escapeLatex(edu.startDate)} -- ${escapeLatex(edu.endDate)}\\\\\n`
      body += `\\textit{${escapeLatex(edu.degree)}${edu.field ? `, ${escapeLatex(edu.field)}` : ''}}`
      if (edu.location) body += ` \\hfill \\textit{${escapeLatex(edu.location)}}`
      body += '\\\\\n'
      if (edu.gpa) body += `\\textbf{CGPA / Grade:} ${escapeLatex(edu.gpa)}\\\\\n`
      if (edu.details) body += `\\small{${escapeLatex(edu.details)}}\\\\\n`
      body += '\\vspace{0.4em}\n'
    }
  }

  // Publications (Especially Academic)
  if (visibility?.publications !== false && cv.publications.length > 0) {
    body += latexSection('Publications & Preprints')
    body += '\\begin{enumerate}[leftmargin=*,noitemsep,topsep=0pt]\n'
    for (const pub of cv.publications) {
      const auth = escapeLatex(pub.authors).replace(
        new RegExp(escapeLatex(b.name), 'g'),
        `\\textbf{${escapeLatex(b.name)}}`,
      )
      const link = pub.doiOrUrl ? ` [\\href{${pub.doiOrUrl}}{Link}]` : ''
      body += `  \\item ${auth}, \`\`${escapeLatex(pub.title)},'' \\textit{${escapeLatex(pub.venue)}}, ${escapeLatex(pub.year)}.${link}\n`
    }
    body += '\\end{enumerate}\n'
  }

  // Experience
  if (visibility?.experience !== false && cv.experience.length > 0) {
    body += latexSection(isAc ? 'Research & Professional Experience' : 'Work Experience')
    for (const exp of cv.experience) {
      body += `\\textbf{${escapeLatex(exp.role)}} ~$\\cdot$~ \\textit{${escapeLatex(exp.company)}} \\hfill ${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}\\\\\n`
      if (exp.location) body += `\\textit{\\small{${escapeLatex(exp.location)}}}\\\\\n`
      if (exp.bullets.length > 0) {
        body += '\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]\n'
        for (const bItem of exp.bullets) {
          body += `  \\item ${escapeLatex(bItem)}\n`
        }
        body += '\\end{itemize}\n'
      }
      if (exp.technologies.length > 0) {
        body += `\\small{\\textbf{Technologies:} ${escapeLatex(exp.technologies.join(', '))}}\\\\\n`
      }
      body += '\\vspace{0.4em}\n'
    }
  }

  // Teaching (Academic)
  if (isAc && visibility?.teaching !== false && cv.teaching.length > 0) {
    body += latexSection('Teaching & Mentoring')
    for (const t of cv.teaching) {
      body += `\\textbf{${escapeLatex(t.role)}}, \\textit{${escapeLatex(t.institution)}} \\hfill ${escapeLatex(t.period)}\\\\\n`
      body += `Course: ${escapeLatex(t.course)}\\\\\n`
      if (t.details) body += `\\small{${escapeLatex(t.details)}}\\\\\n`
      body += '\\vspace{0.3em}\n'
    }
  }

  // Projects
  if (visibility?.projects !== false && cv.projects.length > 0) {
    body += latexSection('Selected Projects')
    for (const proj of cv.projects) {
      body += `\\textbf{${escapeLatex(proj.name)}}`
      if (proj.role) body += ` ~$\\cdot$~ \\textit{${escapeLatex(proj.role)}}`
      if (proj.year) body += ` \\hfill ${escapeLatex(proj.year)}`
      body += '\\\\\n'
      body += `${escapeLatex(proj.description)}\\\\\n`
      if (proj.bullets.length > 0) {
        body += '\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]\n'
        for (const pb of proj.bullets) {
          body += `  \\item ${escapeLatex(pb)}\n`
        }
        body += '\\end{itemize}\n'
      }
      if (proj.stack.length > 0) {
        body += `\\small{\\textbf{Stack:} ${escapeLatex(proj.stack.join(', '))}}\\\\\n`
      }
      body += '\\vspace{0.4em}\n'
    }
  }

  // Skills
  if (visibility?.skills !== false && cv.skills.length > 0) {
    body += latexSection('Technical Competencies')
    body += '\\begin{description}[leftmargin=!,labelwidth=3.2cm,noitemsep,topsep=0pt]\n'
    for (const cat of cv.skills) {
      body += `  \\item[${escapeLatex(cat.category)}] ${escapeLatex(cat.items.join(', '))}\n`
    }
    body += '\\end{description}\n'
  }

  // Awards & Honors
  if (visibility?.awards !== false && cv.awards.length > 0) {
    body += latexSection('Honors & Awards')
    for (const aw of cv.awards) {
      body += `\\textbf{${escapeLatex(aw.title)}} ~$\\cdot$~ \\textit{${escapeLatex(aw.issuer)}} \\hfill ${escapeLatex(aw.year)}\\\\\n`
      if (aw.description) body += `\\small{${escapeLatex(aw.description)}}\\\\\n`
    }
  }

  // Certifications
  if (visibility?.certifications !== false && cv.certifications.length > 0) {
    body += latexSection('Certifications & Credentials')
    for (const c of cv.certifications) {
      body += `\\textbf{${escapeLatex(c.name)}} ~$\\cdot$~ \\textit{${escapeLatex(c.issuer)}} \\hfill ${escapeLatex(c.year)}\\\\\n`
    }
  }

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1.8cm]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{parskip}

\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue!70!black
}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
    {\\LARGE \\textbf{${escapeLatex(b.name)}}}\\\\[0.3em]
    {\\large \\textit{${escapeLatex(b.headline)}}}\\\\[0.4em]
    \\small{${contactLine}}
\\end{center}
\\vspace{0.5em}

${body}

\\end{document}
`
}

/**
 * Generates clean GitHub-Flavored Markdown for the CV.
 */
export function exportToMarkdown(
  cv: CvData,
  mode: CvMode,
  visibility?: Partial<CvSectionVisibility>,
): string {
  const b = cv.basics
  const isAc = mode === 'academic'
  const lines: string[] = []

  lines.push(`# ${b.name}`)
  if (b.headline) lines.push(`**${b.headline}**\n`)

  const contact: string[] = []
  if (b.email) contact.push(`[${b.email}](mailto:${b.email})`)
  if (b.phone) contact.push(b.phone)
  if (b.location) contact.push(b.location)
  if (b.website) contact.push(`[Website](${b.website})`)
  if (b.linkedin) contact.push(`[LinkedIn](${b.linkedin})`)
  if (b.github) contact.push(`[GitHub](${b.github})`)
  lines.push(contact.join(' • ') + '\n')
  lines.push('---\n')

  if (isAc && visibility?.researchInterests !== false && b.researchInterests.length > 0) {
    lines.push('## Research Interests')
    for (const r of b.researchInterests) lines.push(`- ${r}`)
    lines.push('')
  }

  if (b.summary) {
    lines.push(`## ${isAc ? 'Research Overview' : 'Professional Summary'}`)
    lines.push(b.summary + '\n')
  }

  if (visibility?.education !== false && cv.education.length > 0) {
    lines.push('## Education')
    for (const edu of cv.education) {
      lines.push(`### ${edu.institution}`)
      lines.push(`*${edu.degree}${edu.field ? `, ${edu.field}` : ''}* | ${edu.startDate} – ${edu.endDate}`)
      if (edu.gpa) lines.push(`- **CGPA / Grade:** ${edu.gpa}`)
      if (edu.details) lines.push(`- ${edu.details}`)
      lines.push('')
    }
  }

  if (visibility?.publications !== false && cv.publications.length > 0) {
    lines.push('## Publications & Preprints')
    cv.publications.forEach((pub, idx) => {
      const link = pub.doiOrUrl ? ` [Link](${pub.doiOrUrl})` : ''
      lines.push(`${idx + 1}. ${pub.authors}, "${pub.title}", *${pub.venue}*, ${pub.year}.${link}`)
    })
    lines.push('')
  }

  if (visibility?.experience !== false && cv.experience.length > 0) {
    lines.push(`## ${isAc ? 'Academic & Research Experience' : 'Work Experience'}`)
    for (const exp of cv.experience) {
      lines.push(`### ${exp.role} — ${exp.company}`)
      lines.push(`*${exp.startDate} – ${exp.endDate}${exp.location ? ` | ${exp.location}` : ''}*`)
      for (const bItem of exp.bullets) lines.push(`- ${bItem}`)
      if (exp.technologies.length > 0) lines.push(`*Technologies:* ${exp.technologies.join(', ')}`)
      lines.push('')
    }
  }

  if (isAc && visibility?.teaching !== false && cv.teaching.length > 0) {
    lines.push('## Teaching Experience')
    for (const t of cv.teaching) {
      lines.push(`- **${t.role}**, ${t.course} — *${t.institution}* (${t.period})`)
      if (t.details) lines.push(`  ${t.details}`)
    }
    lines.push('')
  }

  if (visibility?.projects !== false && cv.projects.length > 0) {
    lines.push('## Projects')
    for (const p of cv.projects) {
      const urlText = p.url ? ` ([Link](${p.url}))` : ''
      lines.push(`### ${p.name}${urlText}`)
      if (p.description) lines.push(p.description)
      for (const pb of p.bullets) lines.push(`- ${pb}`)
      if (p.stack.length > 0) lines.push(`*Stack:* ${p.stack.join(', ')}`)
      lines.push('')
    }
  }

  if (visibility?.skills !== false && cv.skills.length > 0) {
    lines.push('## Technical Competencies')
    for (const s of cv.skills) {
      lines.push(`- **${s.category}:** ${s.items.join(', ')}`)
    }
    lines.push('')
  }

  if (visibility?.awards !== false && cv.awards.length > 0) {
    lines.push('## Honors & Awards')
    for (const a of cv.awards) {
      lines.push(`- **${a.title}**, *${a.issuer}* (${a.year})`)
      if (a.description) lines.push(`  ${a.description}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function exportToJson(cv: CvData): string {
  return JSON.stringify(cv, null, 2)
}

/** Triggers a browser download of text content with a given filename and mime type. */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
