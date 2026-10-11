export const pubTypes = ['Journal', 'Conference', 'Workshop', 'Preprint', 'Thesis', 'Poster', 'Talk'] as const
export type PubType = (typeof pubTypes)[number]

export const pubStatuses = ['Published', 'Preprint', 'Under review', 'In progress'] as const
export type PubStatus = (typeof pubStatuses)[number]

export interface PubLinks {
  pdf?: string
  doi?: string
  arxiv?: string
  code?: string
  slides?: string
  video?: string
  poster?: string
}

export interface Publication {
  id: string
  title: string
  /** Full names, in order. Yours is highlighted automatically (see `highlightAuthors`). */
  authors: string[]
  venue: string
  year: number
  /** 1–12, optional: used for ordering and BibTeX. */
  month?: number
  type: PubType
  status: PubStatus
  abstract?: string
  tags?: string[]
  links?: PubLinks
  /** One featured item gets the large spotlight card at the top. */
  featured?: boolean
  /** Placeholder entry: renders with a "Sample" tag until you replace it. */
  sample?: boolean
}

/** Author names that render highlighted. Add the spelling(s) you publish under. */
export const highlightAuthors = ['Nur Mohammad Bijoy', 'Bijoy, N. M.', 'Your Name']

/**
 * ⚠ SAMPLE CONTENT: three placeholder entries so you can see every state of the
 * showcase. They describe aims, not results, and credit "Your Name" rather than you.
 * Replace them with real work; delete them all (leave `[]`) and the section falls
 * back to a clean empty state.
 *
 * Every field except id, title, authors, venue, year, type and status is optional.
 * Links only render when present, and a BibTeX "Cite" button is generated for you.
 */
export const publications: Publication[] = [
  {
    id: 'reentrancy-taxonomy',
    title: 'Reentrancy by Design: A Taxonomy of Smart-Contract Failure Modes',
    authors: ['Your Name', 'Co-Author One'],
    venue: 'arXiv preprint',
    year: 2026,
    month: 8,
    type: 'Preprint',
    status: 'Preprint',
    featured: true,
    abstract:
      'Smart-contract failures repeat the same few shapes, yet each audit rediscovers them from scratch. This paper proposes a taxonomy of recurring failure modes, relates each to the language and execution features that enable it, and discusses how tooling could target classes of bugs instead of individual ones.',
    tags: ['Blockchain', 'Smart contracts', 'Security'],
    links: { code: 'https://github.com/nurbijoy' },
    sample: true,
  },
  {
    id: 'ids-adversarial-noise',
    title: 'Learning to Spot Intrusions Under Adversarial Noise: A Comparative Study',
    authors: ['Co-Author Two', 'Your Name', 'Co-Author One'],
    venue: 'Conference on Machine Learning for Security (under review)',
    year: 2026,
    month: 6,
    type: 'Conference',
    status: 'Under review',
    abstract:
      'Detection models are usually scored on clean data, then deployed against opponents who adapt. We outline a comparison of anomaly-detection and classifier approaches under controlled adversarial perturbation, and ask which evaluation choices change the ranking.',
    tags: ['Machine learning', 'Intrusion detection', 'Adversarial ML'],
    sample: true,
  },
  {
    id: 'verifiable-provenance',
    title: 'Provenance You Can Verify: Practical Build Attestation for Small Teams',
    authors: ['Your Name'],
    venue: 'Working draft',
    year: 2025,
    month: 11,
    type: 'Journal',
    status: 'In progress',
    abstract:
      'Supply-chain attacks succeed when consumers cannot tell how an artifact was built. This draft describes a lightweight attestation workflow for small teams and the trade-offs between verifiability, tooling cost and developer friction.',
    tags: ['Supply chain', 'Provenance'],
    sample: true,
  },
]
