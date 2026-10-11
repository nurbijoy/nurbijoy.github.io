/**
 * Core profile + navigation.
 *
 * Everything the visitor sees about *you* lives in src/data. Entries marked
 * `sample: true` are placeholder content: they render with a small "Sample"
 * tag so nothing invented can pass as real. Replace the entry (and drop the
 * flag) to make it yours.
 */

export const site = {
  name: 'Nur Mohammad Bijoy',
  shortName: 'Bijoy',
  initials: 'NB',
  handle: 'nurbijoy',
  url: 'https://nurbijoy.github.io',
  title: 'Software Engineer',
  location: 'Bangladesh',
  tagline: 'I build software that holds up under pressure.',
  intro:
    'Software engineer with a security mindset. I secure systems end to end, study blockchain and machine learning, and turn raw data into decisions you can defend.',

  /** Rotating one-liners in the hero ("I …"). */
  roles: [
    'secure systems end to end',
    'audit smart contracts',
    'train models to spot attacks',
    'turn data into decisions',
  ],

  github: 'nurbijoy',

  /** Add an address to show a "Say hello" mail button in the hero + contact section. */
  email: '',

  socials: [{ label: 'GitHub', href: 'https://github.com/nurbijoy', icon: 'github' as const }],
}

export interface EducationEntry {
  degree: string
  school: string
}

/**
 * Education, earliest first (the About section draws it as a timeline).
 *
 * The graduate programme is named ONLY here: it stays out of the hero, bio, footer and
 * metadata (a test enforces this). No enrolment-status wording on purpose.
 */
export const education: EducationEntry[] = [
  {
    degree: 'B.Sc. in Computer Science and Engineering (CSE)',
    school: 'Port City International University (PCIU)',
  },
  {
    degree: 'M.Sc. Engg in Information Security (InfoSec)',
    school: 'Bangladesh University of Engineering and Technology (BUET)',
  },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'interests', label: 'Interests' },
  { id: 'activity', label: 'Activity' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof nav)[number]['id']

/** The "now" list in the About section. */
export const now: { text: string; sample?: boolean }[] = [
  { text: 'Designing and building this site, from design tokens to live charts' },
  { text: 'Reading up on applied cryptography and protocol design', sample: true },
  { text: 'Hardening a side project with threat-model-first design', sample: true },
]

/** Quick facts: hero strip + About card. */
export const facts: { label: string; value: string }[] = [
  { label: 'Name', value: site.name },
  { label: 'Based in', value: site.location },
  { label: 'Focus', value: 'Cybersecurity · Blockchain · Machine learning' },
]
