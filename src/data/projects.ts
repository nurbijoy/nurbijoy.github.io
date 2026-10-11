export type ProjectCategory = 'Security' | 'Blockchain' | 'Machine Learning' | 'Tools' | 'Education'
export type ProjectStatus = 'Live' | 'In development' | 'Research prototype' | 'Archived'

/** Optional write-up shown in the project's "Case study" dialog. */
export interface CaseStudy {
  problem: string
  approach: string
  learned?: string
}

export interface Project {
  id: string
  title: string
  blurb: string
  category: ProjectCategory
  year: number
  stack: string[]
  /** Short bullets on the card (keep to 2–3). */
  highlights?: string[]
  status?: ProjectStatus
  role?: string
  /** e.g. "2025 – present". Falls back to `year`. */
  period?: string
  /**
   * Screenshot path under /public, e.g. "/projects/vaultline.png" (16:9 looks best).
   * Without one, a generative cover is painted from the project id.
   */
  image?: string
  /** GitHub repo name under your account: adds live stars and last-push time to the card. */
  repo?: string
  live?: string
  demo?: string
  video?: string
  writeup?: string
  case?: CaseStudy
  /** The first featured project gets a wide spotlight card. */
  featured?: boolean
  /** Placeholder entry: renders with a "Sample" tag until you replace it. */
  sample?: boolean
}

/**
 * ⚠ SAMPLE CONTENT: replace with your real projects. Every field beyond
 * id/title/blurb/category/year/stack is optional, and each one only renders when set.
 */
export const projects: Project[] = [
  {
    id: 'vaultline',
    title: 'Vaultline',
    blurb:
      'A zero-knowledge secrets vault prototype: everything is encrypted in the browser before it ever leaves the device.',
    category: 'Security',
    year: 2026,
    period: '2026',
    status: 'Research prototype',
    role: 'Design & build',
    stack: ['TypeScript', 'WebCrypto', 'Argon2'],
    highlights: ['Client-side envelope encryption', 'Per-item keys with rotation'],
    featured: true,
    case: {
      problem:
        'Password managers ask you to trust a server with your secrets. I wanted to see how far a vault could go while the server learns nothing about its contents.',
      approach:
        'Keys are derived in the browser from a passphrase with a memory-hard KDF. Each item is encrypted under its own key, wrapped by a master key that can be rotated without re-encrypting every item.',
      learned:
        'Rotation and recovery are where the real design effort goes: far more than the encryption call itself.',
    },
    sample: true,
  },
  {
    id: 'ledger-lens',
    title: 'Ledger Lens',
    blurb: 'A block explorer and visualiser for private chains: follow a transaction from mempool to finality as it happens.',
    category: 'Blockchain',
    year: 2026,
    status: 'In development',
    role: 'Design & build',
    stack: ['Solidity', 'TypeScript', 'ethers.js'],
    highlights: ['Live block and transaction stream', 'Contract-event decoding'],
    case: {
      problem: 'Explorers for public chains are everywhere, but a private test network has nothing that explains what its nodes are doing.',
      approach: 'Subscribe to node events, decode contract logs against their ABIs, and draw blocks, forks and finality as one timeline.',
      learned: 'Showing a reorg clearly is harder than showing a block: the interesting part is what disappears.',
    },
    sample: true,
  },
  {
    id: 'packet-lens',
    title: 'Packet Lens',
    blurb: 'A small CLI that summarises packet captures into a one-page, human-readable narrative of what happened.',
    category: 'Tools',
    year: 2025,
    status: 'In development',
    role: 'Author',
    stack: ['Python', 'Scapy', 'CLI'],
    highlights: ['Flow and protocol breakdown', 'Anomaly hints'],
    case: {
      problem: 'A raw capture is thousands of packets. The question is usually just "what happened here?".',
      approach: 'Group packets into flows, classify protocols, and write the result as a short narrative with the oddities called out.',
    },
    sample: true,
  },
  {
    id: 'cipher-lab',
    title: 'Cipher Lab',
    blurb: 'An interactive playground for classical and modern ciphers: tweak a key and watch the ciphertext change.',
    category: 'Education',
    year: 2025,
    status: 'Live',
    stack: ['React', 'TypeScript', 'SVG'],
    highlights: ['Step-by-step visual traces', 'Runs fully in the browser'],
    sample: true,
  },
  {
    id: 'sentinel-ml',
    title: 'Sentinel-ML',
    blurb: 'A network intrusion-detection pipeline that tests its own models against adversarial traffic before it trusts them.',
    category: 'Machine Learning',
    year: 2025,
    status: 'Research prototype',
    stack: ['Python', 'PyTorch', 'scikit-learn'],
    highlights: ['Anomaly and classifier baselines', 'Adversarial robustness checks'],
    sample: true,
  },
  {
    id: 'trace-atlas',
    title: 'Trace Atlas',
    blurb: 'Visualises network paths and latency as an explorable map, so slow hops stand out at a glance.',
    category: 'Tools',
    year: 2024,
    status: 'Archived',
    stack: ['D3', 'TypeScript', 'Canvas'],
    highlights: ['Force-directed topology', 'Latency heat overlay'],
    sample: true,
  },
]

export const projectCategories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))] as const
