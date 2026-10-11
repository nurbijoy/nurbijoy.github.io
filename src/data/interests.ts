import type { LucideIcon } from 'lucide-react'
import { Blocks, Brain, Eye, GraduationCap, KeyRound, Network, Palette, ShieldCheck } from 'lucide-react'

export interface Interest {
  id: string
  title: string
  blurb: string
  icon: LucideIcon
  /** Bento layout: how many columns this tile spans on large screens. */
  span: 1 | 2
  sample?: boolean
}

/**
 * ⚠ SAMPLE CONTENT — technical interests inferred from the InfoSec direction.
 * Replace with what you actually care about (hobbies are welcome here too).
 */
export const interests: Interest[] = [
  {
    id: 'crypto',
    title: 'Applied cryptography',
    blurb: 'How clever maths turns into protocols, and exactly where the seams show.',
    icon: KeyRound,
    span: 2,
    sample: true,
  },
  {
    id: 'secure-design',
    title: 'Secure-by-design systems',
    blurb: 'Making the safe path the easy path.',
    icon: ShieldCheck,
    span: 1,
    sample: true,
  },
  {
    id: 'ml-defence',
    title: 'Machine learning for defence',
    blurb: "Teaching models to notice what humans miss, and checking they can't be fooled.",
    icon: Brain,
    span: 1,
    sample: true,
  },
  {
    id: 'systems',
    title: 'Systems thinking',
    blurb: 'Following a request through every layer it touches.',
    icon: Network,
    span: 1,
    sample: true,
  },
  {
    id: 'dataviz',
    title: 'Data visualisation',
    blurb: 'Charts that tell the truth quietly, with thin marks and honest axes.',
    icon: Eye,
    span: 2,
    sample: true,
  },
  {
    id: 'interface',
    title: 'Interface & typography',
    blurb: 'Craft in the details people feel but rarely name.',
    icon: Palette,
    span: 1,
    sample: true,
  },
  {
    id: 'blockchain',
    title: 'Blockchain & decentralised trust',
    blurb: 'Consensus, smart contracts, and what it takes for strangers to agree on the truth.',
    icon: Blocks,
    span: 2,
    sample: true,
  },
  {
    id: 'learning',
    title: 'Learning in public',
    blurb: 'Notes, experiments and the occasional honest post-mortem.',
    icon: GraduationCap,
    span: 2,
    sample: true,
  },
]
