/**
 * Live projects shown on the Showcase page (/showcase/). Each one needs a demo component
 * in the `demos` map of ShowcasePage, keyed by the same `id`.
 * Tour-related projects are in Bangla, while other tools are in English.
 */
export interface ShowcaseProject {
  id: string
  title: string
  blurb: string
  /** Shown as a tag, e.g. "Tool" or "টুল". */
  category: string
  /** Shown as a status chip, e.g. "New", "Live" or "লাইভ". */
  status: string
  /** Technology names stay in English. */
  stack: string[]
  /** Icon identifier for showcase project selector cards. */
  icon?: 'file-text' | 'map' | 'globe'
  /** Whether the project content is in Bangla (for tour-related projects). */
  isBangla?: boolean
}

export const showcase: ShowcaseProject[] = [
  {
    id: 'linkedin-cv-builder',
    title: 'Academic & Professional CV Builder',
    blurb:
      'Fill in a form and watch a high-impact academic CV or professional resume take shape on a live A4 preview, then export it as PDF, Word, LaTeX or Markdown.',
    category: 'Tool',
    status: 'New',
    stack: ['React', 'TypeScript', 'Word (.docx)', 'LaTeX'],
    icon: 'file-text',
    isBangla: false,
  },
  {
    id: 'bangladesh-travel-map',
    title: 'বাংলাদেশ ভ্রমণ মানচিত্র',
    blurb:
      'যেসব জেলায় গিয়েছেন সেগুলোয় রং করুন। রং বাছুন, ভ্রমণ করা জেলায় ক্লিক করুন, তারপর পূর্ণ মানচিত্রটি PNG ছবি হিসেবে নামিয়ে নিন।',
    category: 'টুল',
    status: 'লাইভ',
    stack: ['React', 'SVG', 'Canvas 2D'],
    icon: 'map',
    isBangla: true,
  },
  {
    id: 'world-tour',
    title: 'বিশ্ব ভ্রমণ',
    blurb:
      'পৃথিবীর যেসব দেশে গিয়েছেন সেগুলোয় রং করুন। রং বেছে নিন, দেশে ক্লিক করুন বা নাম খুঁজে যোগ করুন, তারপর মানচিত্রটি PNG ছবি হিসেবে নামিয়ে নিন।',
    category: 'টুল',
    status: 'লাইভ',
    stack: ['React', 'SVG', 'Canvas 2D'],
    icon: 'globe',
    isBangla: true,
  },
  {
    id: 'buet-campus-map',
    title: 'BUET Campus Explorer',
    blurb:
      'Explore a true 3D campus model built from mapped footprints. Orbit or walk through the grounds, switch between daylight and evening, search landmarks, and take a virtual tour.',
    category: 'Campus Map',
    status: 'New',
    stack: ['React', 'Three.js', 'OpenStreetMap'],
    icon: 'map',
    isBangla: false,
  },
]
