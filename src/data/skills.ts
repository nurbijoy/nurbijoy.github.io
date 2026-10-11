export const domains = [
  'Security',
  'Cryptography',
  'Blockchain',
  'Machine Learning',
  'Data Science',
  'Infrastructure',
] as const
export type Domain = (typeof domains)[number]

export const levelNames = ['', 'Familiar', 'Working', 'Proficient', 'Advanced', 'Expert'] as const

/**
 * Only technologies at this level or above are ever shown on the site. Basics and
 * working knowledge can live in the list below without cluttering the page: raise
 * or lower this to change the bar.
 */
export const MIN_LEVEL = 4

export interface Skill {
  name: string
  domain: Domain
  /** 1 Familiar · 2 Working · 3 Proficient · 4 Advanced · 5 Expert */
  level: 1 | 2 | 3 | 4 | 5
  sample?: boolean
}

/**
 * ⚠ SAMPLE CONTENT: a plausible advanced-technology profile, not a record of your
 * actual experience. Set names and levels honestly; the depth map, bars and marquee
 * all update from this list. Anything below MIN_LEVEL is automatically hidden.
 */
export const skills: Skill[] = [
  { name: 'Threat modelling (STRIDE, attack trees)', domain: 'Security', level: 4, sample: true },
  { name: 'Burp Suite & OWASP ZAP', domain: 'Security', level: 4, sample: true },
  { name: 'Wireshark & Zeek traffic analysis', domain: 'Security', level: 4, sample: true },
  { name: 'Semgrep & CodeQL static analysis', domain: 'Security', level: 4, sample: true },
  { name: 'Secure code review', domain: 'Security', level: 5, sample: true },

  { name: 'TLS 1.3 & PKI', domain: 'Cryptography', level: 4, sample: true },
  { name: 'libsodium & WebCrypto', domain: 'Cryptography', level: 4, sample: true },
  { name: 'Zero-knowledge proofs (zk-SNARKs)', domain: 'Cryptography', level: 4, sample: true },
  { name: 'Post-quantum schemes (Kyber, Dilithium)', domain: 'Cryptography', level: 4, sample: true },

  { name: 'Solidity & EVM internals', domain: 'Blockchain', level: 5, sample: true },
  { name: 'Smart-contract auditing (Slither, Foundry)', domain: 'Blockchain', level: 4, sample: true },
  { name: 'Hyperledger Fabric', domain: 'Blockchain', level: 4, sample: true },
  { name: 'Consensus protocols (PoW, PoS, BFT)', domain: 'Blockchain', level: 4, sample: true },
  { name: 'Layer-2 & rollup design', domain: 'Blockchain', level: 4, sample: true },

  { name: 'PyTorch', domain: 'Machine Learning', level: 4, sample: true },
  { name: 'TensorFlow & Keras', domain: 'Machine Learning', level: 4, sample: true },
  { name: 'Adversarial ML & robustness', domain: 'Machine Learning', level: 4, sample: true },
  { name: 'Intrusion & anomaly detection', domain: 'Machine Learning', level: 4, sample: true },

  { name: 'pandas & NumPy', domain: 'Data Science', level: 4, sample: true },
  { name: 'Statistical modelling & time series', domain: 'Data Science', level: 4, sample: true },
  { name: 'Apache Spark', domain: 'Data Science', level: 4, sample: true },

  { name: 'Docker & Kubernetes', domain: 'Infrastructure', level: 4, sample: true },
  { name: 'CI/CD pipeline security', domain: 'Infrastructure', level: 4, sample: true },

  // Below the bar: kept for completeness, never rendered.
  { name: 'Git', domain: 'Infrastructure', level: 3, sample: true },
  { name: 'Excel & basic reporting', domain: 'Data Science', level: 2, sample: true },
]

/** What the site actually shows. */
export const shownSkills: Skill[] = skills.filter((s) => s.level >= MIN_LEVEL)

/** Domains that have at least one shown skill, in canonical order. */
export const shownDomains: Domain[] = domains.filter((d) => shownSkills.some((s) => s.domain === d))

export function domainDepth() {
  return shownDomains.map((domain) => {
    const items = shownSkills.filter((s) => s.domain === domain)
    return {
      domain,
      count: items.length,
      expert: items.filter((s) => s.level === 5).length,
    }
  })
}
