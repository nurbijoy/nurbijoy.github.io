export type ResearchStatus = 'Reading' | 'Exploring' | 'Planned'

export interface ResearchDirection {
  id: string
  title: string
  question: string
  summary: string
  status: ResearchStatus
  tags: string[]
  sample?: boolean
}

/**
 * ⚠ SAMPLE CONTENT: research *directions*, not results. Swap in your real interests
 * and your advisors' areas as they firm up. Nothing here claims a finding or a
 * publication.
 */
export const directions: ResearchDirection[] = [
  {
    id: 'applied-crypto',
    title: 'Applied cryptography in real systems',
    question: 'Where do sound primitives still end up in unsound protocols?',
    summary:
      'Key management, misuse-resistant APIs, zero-knowledge proofs in practice, and the road to post-quantum schemes.',
    status: 'Reading',
    tags: ['Protocols', 'Zero-knowledge', 'Post-quantum'],
    sample: true,
  },
  {
    id: 'blockchain-security',
    title: 'Blockchain & smart-contract security',
    question: 'Which failure modes keep recurring, and can tools catch them before deployment?',
    summary:
      'A taxonomy of smart-contract vulnerabilities, consensus-level attacks, and the fuzzing and formal methods that find them early.',
    status: 'Exploring',
    tags: ['Smart contracts', 'Consensus', 'Fuzzing'],
    sample: true,
  },
  {
    id: 'ml-intrusion',
    title: 'Machine learning for intrusion detection',
    question: 'How well do detection models hold up when the attacker adapts?',
    summary:
      'Anomaly detection on network and host data, evaluated honestly against adversarial noise and distribution shift.',
    status: 'Exploring',
    tags: ['Anomaly detection', 'Adversarial ML', 'Data science'],
    sample: true,
  },
  {
    id: 'supply-chain',
    title: 'Software supply-chain security',
    question: 'How much of what we ship do we actually know how to trust?',
    summary: 'Dependency trust, build provenance and reproducible builds as a measurable property rather than a hope.',
    status: 'Planned',
    tags: ['Provenance', 'SBOM', 'Reproducibility'],
    sample: true,
  },
]

export type NodeKind = 'research' | 'concept' | 'skill'

export interface GraphNode {
  id: string
  label: string
  /** Compact label used on narrow screens, where space is tight. */
  short?: string
  kind: NodeKind
}

/** Node → node edges for the "how these ideas connect" constellation chart. */
export const graphNodes: GraphNode[] = [
  { id: 'r-crypto', label: 'Applied cryptography', short: 'Crypto', kind: 'research' },
  { id: 'r-chain', label: 'Blockchain security', short: 'Blockchain', kind: 'research' },
  { id: 'r-ml', label: 'ML for intrusion detection', short: 'ML defence', kind: 'research' },
  { id: 'r-supply', label: 'Supply-chain security', short: 'Supply chain', kind: 'research' },

  { id: 'c-keys', label: 'Key management', kind: 'concept' },
  { id: 'c-zk', label: 'Zero-knowledge', kind: 'concept' },
  { id: 'c-pqc', label: 'Post-quantum', kind: 'concept' },
  { id: 'c-consensus', label: 'Consensus', kind: 'concept' },
  { id: 'c-vuln', label: 'Contract bugs', kind: 'concept' },
  { id: 'c-anom', label: 'Anomaly detection', kind: 'concept' },
  { id: 'c-adv', label: 'Adversarial inputs', kind: 'concept' },
  { id: 'c-prov', label: 'Provenance', kind: 'concept' },
  { id: 'c-threat', label: 'Threat models', kind: 'concept' },

  { id: 's-crypto', label: 'Cryptography', kind: 'skill' },
  { id: 's-sol', label: 'Solidity', kind: 'skill' },
  { id: 's-torch', label: 'PyTorch', kind: 'skill' },
  { id: 's-py', label: 'Python', kind: 'skill' },
  { id: 's-stats', label: 'Statistics', kind: 'skill' },
  { id: 's-sec', label: 'Security testing', kind: 'skill' },
  { id: 's-ci', label: 'CI/CD', kind: 'skill' },
  { id: 's-spark', label: 'Spark', kind: 'skill' },
]

export const graphLinks: [string, string][] = [
  ['r-crypto', 'c-keys'],
  ['r-crypto', 'c-zk'],
  ['r-crypto', 'c-pqc'],
  ['r-crypto', 's-crypto'],
  ['r-chain', 'c-consensus'],
  ['r-chain', 'c-vuln'],
  ['r-chain', 'c-zk'],
  ['r-chain', 's-sol'],
  ['r-ml', 'c-anom'],
  ['r-ml', 'c-adv'],
  ['r-ml', 'c-threat'],
  ['r-ml', 's-torch'],
  ['r-supply', 'c-prov'],
  ['r-supply', 'c-threat'],
  ['r-supply', 's-ci'],
  ['c-keys', 's-crypto'],
  ['c-zk', 's-crypto'],
  ['c-pqc', 's-crypto'],
  ['c-consensus', 's-sol'],
  ['c-vuln', 's-sol'],
  ['c-vuln', 's-sec'],
  ['c-anom', 's-stats'],
  ['c-anom', 's-torch'],
  ['c-adv', 's-torch'],
  ['c-adv', 's-sec'],
  ['c-prov', 's-ci'],
  ['c-threat', 's-sec'],
  ['s-torch', 's-py'],
  ['s-stats', 's-py'],
  ['s-stats', 's-spark'],
  ['s-spark', 's-py'],
]
