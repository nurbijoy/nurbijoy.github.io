/**
 * Live projects shown on the Showcase page (/showcase/). Each one needs a demo component
 * in the `demos` map of ShowcasePage, keyed by the same `id`. The page is in Bangla, so the
 * text here is too.
 */
export interface ShowcaseProject {
  id: string
  title: string
  blurb: string
  /** Shown as a tag, e.g. "টুল". */
  category: string
  /** Shown as a status chip, e.g. "লাইভ". */
  status: string
  /** Technology names stay in English. */
  stack: string[]
}

export const showcase: ShowcaseProject[] = [
  {
    id: 'bangladesh-travel-map',
    title: 'বাংলাদেশ ভ্রমণ মানচিত্র',
    blurb:
      'যেসব জেলায় গিয়েছেন সেগুলোয় রং করুন। রং বাছুন, ভ্রমণ করা জেলায় ক্লিক করুন, তারপর পূর্ণ মানচিত্রটি PNG ছবি হিসেবে নামিয়ে নিন।',
    category: 'টুল',
    status: 'লাইভ',
    stack: ['React', 'SVG', 'Canvas 2D'],
  },
  {
    id: 'world-tour',
    title: 'বিশ্ব ভ্রমণ',
    blurb:
      'পৃথিবীর যেসব দেশে গিয়েছেন সেগুলোয় রং করুন। রং বেছে নিন, দেশে ক্লিক করুন বা নাম খুঁজে যোগ করুন, তারপর মানচিত্রটি PNG ছবি হিসেবে নামিয়ে নিন।',
    category: 'টুল',
    status: 'লাইভ',
    stack: ['React', 'SVG', 'Canvas 2D'],
  },
]
