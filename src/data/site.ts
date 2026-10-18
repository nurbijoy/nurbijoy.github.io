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

export interface NavItem {
  id: string
  label: string
  /** Set when the item opens its own page. Otherwise it scrolls to the section with this id. */
  href?: string
}

export const nav: readonly NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'showcase', label: 'Showcase', href: '/showcase/' },
  { id: 'research', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'interests', label: 'Interests' },
  { id: 'activity', label: 'Activity' },
  { id: 'contact', label: 'Contact' },
]

/** Where a nav item points: its own page, or the section on this page. */
export const navHref = (item: NavItem) => item.href ?? `#${item.id}`

/** Quick facts: hero strip + About card. */
export const facts: { label: string; value: string }[] = [
  { label: 'Name', value: site.name },
  { label: 'Based in', value: site.location },
  { label: 'Focus', value: 'Cybersecurity · Blockchain · Machine learning' },
]
