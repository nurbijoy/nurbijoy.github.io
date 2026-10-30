import type {
  CvAward,
  CvCertification,
  CvData,
  CvEducation,
  CvExperience,
  CvSkillCategory,
} from '@/data/cvDefaults'

export interface ParseResult {
  data: Partial<CvData>
  detectedSource: 'json' | 'text-dump' | 'url-only' | 'unknown'
  message: string
}

/**
 * Extracts a LinkedIn profile handle from a URL or raw string.
 * Example: "https://www.linkedin.com/in/username/" -> "username"
 */
export function extractLinkedInHandle(input: string): string | null {
  const trimmed = input.trim()
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i)
  if (match?.[1]) {
    return match[1].toLowerCase()
  }
  if (/^[a-zA-Z0-9_-]{3,60}$/.test(trimmed) && !trimmed.includes(' ') && !trimmed.includes('\n')) {
    return trimmed.toLowerCase()
  }
  return null
}

/**
 * Parses raw user input: LinkedIn URL, raw pasted text, or exported JSON.
 */
export function parseLinkedInInput(raw: string, current: CvData): ParseResult {
  const text = raw.trim()
  if (!text) {
    return {
      data: {},
      detectedSource: 'unknown',
      message: 'No input provided. Please enter a LinkedIn URL or paste profile text.',
    }
  }

  // 1. Check if user pasted JSON
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text) as Partial<CvData>
      if (parsed.basics || parsed.experience || parsed.education || parsed.skills) {
        return {
          data: {
            basics: { ...current.basics, ...parsed.basics },
            education: parsed.education ?? current.education,
            experience: parsed.experience ?? current.experience,
            publications: parsed.publications ?? current.publications,
            projects: parsed.projects ?? current.projects,
            skills: parsed.skills ?? current.skills,
            awards: parsed.awards ?? current.awards,
            certifications: parsed.certifications ?? current.certifications,
            teaching: parsed.teaching ?? current.teaching,
          },
          detectedSource: 'json',
          message: 'Profile data imported successfully from JSON.',
        }
      }
    } catch {
      // Not valid JSON, proceed to other checks
    }
  }

  // 2. Check if user passed a LinkedIn URL or handle
  const handle = extractLinkedInHandle(text)
  if (handle) {
    const formattedName = handle
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    const fullLinkedInUrl = `https://www.linkedin.com/in/${handle}/`

    return {
      data: {
        basics: {
          name: formattedName,
          headline: 'Software Engineer & Systems Researcher',
          email: `${handle.replace(/[-_]/g, '.')}@example.edu`,
          phone: '',
          location: 'Stanford, CA, USA',
          website: '',
          linkedin: fullLinkedInUrl,
          github: `https://github.com/${handle}`,
          summary: `Software engineer and researcher specializing in distributed protocols, high-assurance systems, and cloud infrastructure. You can edit fields below or paste copied profile text.`,
          researchInterests: [
            'Distributed Systems & Consensus Protocols',
            'Systems Security & Formal Verification',
            'High-Performance Cloud Infrastructure',
          ],
        },
        education: [
          {
            id: `edu-${Date.now()}-1`,
            institution: 'Stanford University',
            degree: 'B.S. in Computer Science',
            field: 'Systems & Security',
            location: 'Stanford, CA',
            startDate: '2020',
            endDate: '2024',
            gpa: 'GPA 3.92 / 4.0',
            details: 'Honors thesis on consensus safety and high-assurance network protocols.',
          },
        ],
        experience: [
          {
            id: `exp-${Date.now()}-1`,
            company: 'MIT CSAIL',
            role: 'Research & Software Engineer',
            location: 'Cambridge, MA',
            startDate: '2024',
            endDate: 'Present',
            bullets: [
              'Engineered high-throughput distributed protocols with formal safety verification.',
              'Architected client-side cryptographic attestation modules for secure cloud systems.',
            ],
            technologies: ['TypeScript', 'Rust', 'Go', 'Python', 'Docker'],
          },
        ],
        publications: [],
        projects: [
          {
            id: `proj-${Date.now()}-1`,
            name: 'VeriSync',
            role: 'Creator',
            year: '2024',
            description: 'Open-source distributed state machine verification harness with simulated partition testing.',
            bullets: ['Exhaustively verified safety invariants under adversarial network drops.'],
            stack: ['Rust', 'Go', 'Docker'],
            url: `https://github.com/${handle}`,
          },
        ],
        skills: [
          {
            id: `skill-${Date.now()}-1`,
            category: 'Core Competencies',
            items: ['Distributed Systems', 'Go', 'Rust', 'TypeScript', 'Docker', 'Linux Internals'],
          },
        ],
        awards: [
          {
            id: `award-${Date.now()}-1`,
            title: 'Undergraduate Research Excellence Award',
            issuer: 'Stanford University',
            year: '2024',
          },
        ],
        certifications: [],
        teaching: [],
      },
      detectedSource: 'url-only',
      message: `LinkedIn profile detected for "${formattedName}". Sample profile initialized! You can customize fields below or paste copied text to import full details.`,
    }
  }

  // 3. Fallback: Parse pasted free-form profile text (from LinkedIn copy or PDF copy)
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length >= 2) {
    const partial: Partial<CvData> = {
      basics: {
        name: '',
        headline: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        summary: '',
        researchInterests: [],
      },
      education: [],
      experience: [],
      skills: [],
      awards: [],
      certifications: [],
      publications: [],
      projects: [],
      teaching: [],
    }

    type SectionType = 'none' | 'about' | 'experience' | 'education' | 'skills' | 'certifications' | 'awards'
    let section: SectionType = 'none'

    const expList: CvExperience[] = []
    const eduList: CvEducation[] = []
    const skillsList: string[] = []
    const certList: CvCertification[] = []
    const awardList: CvAward[] = []
    const aboutParagraphs: string[] = []

    let i = 0

    // Infer name from first line if not a section header
    if (lines[0] && !/^(about|experience|education|skills|certifications|awards|summary)/i.test(lines[0])) {
      partial.basics!.name = lines[0]
      i++
    }
    // Infer headline from second line if not a section header
    if (lines[i] && !/^(about|experience|education|skills|certifications|awards|summary)/i.test(lines[i])) {
      partial.basics!.headline = lines[i]
      i++
    }

    for (; i < lines.length; i++) {
      const line = lines[i]!
      const lower = line.toLowerCase()

      // Section header detection
      if (/^(about|summary|professional summary|executive summary|about me)$/i.test(lower)) {
        section = 'about'
        continue
      }
      if (/^(experience|work experience|employment history)$/i.test(lower)) {
        section = 'experience'
        continue
      }
      if (/^(education|academic background|qualifications)$/i.test(lower)) {
        section = 'education'
        continue
      }
      if (/^(skills|technical skills|competencies|top skills)$/i.test(lower)) {
        section = 'skills'
        continue
      }
      if (/^(licenses & certifications|certifications|certificates)$/i.test(lower)) {
        section = 'certifications'
        continue
      }
      if (/^(honors & awards|honors|awards)$/i.test(lower)) {
        section = 'awards'
        continue
      }

      // Check contact links in text
      if (lower.includes('linkedin.com/in/')) {
        const linkMatch = line.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s]+)/i)
        if (linkMatch?.[1]) partial.basics!.linkedin = linkMatch[1]
        continue
      }
      if (lower.includes('github.com/')) {
        const ghMatch = line.match(/(https?:\/\/(?:www\.)?github\.com\/[^\s]+)/i)
        if (ghMatch?.[1]) partial.basics!.github = ghMatch[1]
        continue
      }
      if (line.includes('@') && !line.includes(' ')) {
        partial.basics!.email = line
        continue
      }

      // Section body parsing
      if (section === 'about') {
        aboutParagraphs.push(line)
      } else if (section === 'experience') {
        // Look for year range / date lines like "2023 - Present" or "Jan 2022 - Dec 2023"
        const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\b.*?[-–—].*?(?:Present|[0-9]{4}))/i)

        if (dateMatch && expList.length > 0) {
          const parts = dateMatch[1]?.split(/[-–—]/)
          if (parts?.[0]) expList[expList.length - 1]!.startDate = parts[0].trim()
          if (parts?.[1]) expList[expList.length - 1]!.endDate = parts[1].replace(/·.*$/, '').trim()
        } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          const bullet = line.replace(/^[•\-*]\s*/, '')
          if (expList.length > 0) {
            expList[expList.length - 1]!.bullets.push(bullet)
          }
        } else if (line.includes(' at ') || line.includes(' · ') || line.includes(' - ')) {
          const parts = line.split(/ at | · | - /)
          expList.push({
            id: `exp-${Date.now()}-${expList.length}`,
            role: parts[0]?.trim() ?? 'Software Engineer',
            company: parts[1]?.trim() ?? 'Organization',
            startDate: '2023',
            endDate: 'Present',
            bullets: [],
            technologies: [],
          })
        } else if (expList.length === 0 || expList[expList.length - 1]!.bullets.length > 0) {
          // New role entry
          expList.push({
            id: `exp-${Date.now()}-${expList.length}`,
            role: line,
            company: 'Organization',
            startDate: '2023',
            endDate: 'Present',
            bullets: [],
            technologies: [],
          })
        } else if (expList[expList.length - 1]!.company === 'Organization') {
          // Next line is likely company name
          expList[expList.length - 1]!.company = line.replace(/·.*$/, '').trim()
        }
      } else if (section === 'education') {
        // Look for GPA / Grade
        const gpaMatch = line.match(/(?:CGPA|GPA|Grade)[:\s]+([0-9.]+(?:\s*\/\s*[0-9.]+)?(?:[^\n]*))/i)
        const dateMatch = line.match(/([0-9]{4})\s*[-–—]\s*([0-9]{4}|Present)/)

        if (gpaMatch && eduList.length > 0) {
          eduList[eduList.length - 1]!.gpa = gpaMatch[0].trim()
        } else if (dateMatch && eduList.length > 0) {
          eduList[eduList.length - 1]!.startDate = dateMatch[1] ?? '2020'
          eduList[eduList.length - 1]!.endDate = dateMatch[2] ?? '2024'
        } else if (
          line.includes('University') ||
          line.includes('College') ||
          line.includes('Institute') ||
          line.includes('School')
        ) {
          eduList.push({
            id: `edu-${Date.now()}-${eduList.length}`,
            institution: line,
            degree: 'Bachelor of Science (B.Sc.)',
            field: 'Computer Science',
            startDate: '2020',
            endDate: '2024',
          })
        } else if (eduList.length > 0 && /Bachelor|Master|Doctor|Ph\.D\.|B\.Sc|M\.Sc|Degree/i.test(line)) {
          eduList[eduList.length - 1]!.degree = line
        }
      } else if (section === 'skills') {
        const split = line.split(/[,•·|]/).map((s) => s.trim()).filter(Boolean)
        skillsList.push(...split)
      } else if (section === 'certifications') {
        certList.push({
          id: `cert-${Date.now()}-${certList.length}`,
          name: line,
          issuer: 'Authorized Organization',
          year: new Date().getFullYear().toString(),
        })
      } else if (section === 'awards') {
        awardList.push({
          id: `award-${Date.now()}-${awardList.length}`,
          title: line,
          issuer: 'Awarding Body',
          year: new Date().getFullYear().toString(),
        })
      }
    }

    if (aboutParagraphs.length > 0) {
      partial.basics!.summary = aboutParagraphs.join(' ')
    }
    if (expList.length > 0) {
      partial.experience = expList
    }
    if (eduList.length > 0) {
      partial.education = eduList
    }
    if (skillsList.length > 0) {
      const newCategory: CvSkillCategory = {
        id: `skill-imported`,
        category: 'Imported Skills',
        items: Array.from(new Set(skillsList)),
      }
      partial.skills = [newCategory]
    }
    if (certList.length > 0) {
      partial.certifications = certList
    }
    if (awardList.length > 0) {
      partial.awards = awardList
    }

    return {
      data: partial,
      detectedSource: 'text-dump',
      message: 'Detected profile sections from pasted text and populated the form.',
    }
  }

  return {
    data: {},
    detectedSource: 'unknown',
    message: 'Could not extract fields from input. Please check the LinkedIn URL or format.',
  }
}

