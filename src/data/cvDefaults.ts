export type CvMode = 'academic' | 'professional'
export type CvStyle = 'academic-latex' | 'modern-sans' | 'swiss-clean'
export type CvDensity = 'normal' | 'compact'

export interface CvBasics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  summary: string
  researchInterests: string[]
}

export interface CvEducation {
  id: string
  institution: string
  degree: string
  field: string
  location?: string
  startDate: string
  endDate: string
  gpa?: string
  details?: string
}

export interface CvExperience {
  id: string
  company: string
  role: string
  location?: string
  startDate: string
  endDate: string
  bullets: string[]
  technologies: string[]
}

export interface CvPublication {
  id: string
  title: string
  authors: string
  venue: string
  year: string
  type: string
  doiOrUrl?: string
}

export interface CvProject {
  id: string
  name: string
  role?: string
  year?: string
  description: string
  bullets: string[]
  stack: string[]
  url?: string
}

export interface CvSkillCategory {
  id: string
  category: string
  items: string[]
}

export interface CvAward {
  id: string
  title: string
  issuer: string
  year: string
  description?: string
}

export interface CvCertification {
  id: string
  name: string
  issuer: string
  year: string
  url?: string
}

export interface CvTeaching {
  id: string
  role: string
  course: string
  institution: string
  period: string
  details?: string
}

export interface CvSectionVisibility {
  researchInterests: boolean
  education: boolean
  experience: boolean
  publications: boolean
  projects: boolean
  skills: boolean
  awards: boolean
  certifications: boolean
  teaching: boolean
}

export interface CvData {
  basics: CvBasics
  education: CvEducation[]
  experience: CvExperience[]
  publications: CvPublication[]
  projects: CvProject[]
  skills: CvSkillCategory[]
  awards: CvAward[]
  certifications: CvCertification[]
  teaching: CvTeaching[]
}

export const DEFAULT_SECTION_VISIBILITY: Record<CvMode, CvSectionVisibility> = {
  academic: {
    researchInterests: true,
    education: true,
    publications: true,
    experience: true,
    teaching: true,
    projects: true,
    skills: true,
    awards: true,
    certifications: false,
  },
  professional: {
    researchInterests: false,
    education: true,
    publications: false,
    experience: true,
    teaching: false,
    projects: true,
    skills: true,
    awards: true,
    certifications: true,
  },
}

/** Sample preset geared towards academia, PhD applications, or research positions. */
export const academicSamplePreset: CvData = {
  basics: {
    name: 'Dr. Jane A. Doe',
    headline: 'Postdoctoral Fellow in Computer Science & Distributed Systems',
    email: 'jane.doe@example.edu',
    phone: '+1 (555) 234-5678',
    location: 'Boston, MA, USA',
    website: 'https://example.edu/~janedoe',
    linkedin: 'https://www.linkedin.com/in/example/',
    github: 'https://github.com/example',
    summary:
      'Researcher investigating high-assurance distributed protocols, formal verification of consensus algorithms, and fault-tolerant state-machine replication under Byzantine conditions.',
    researchInterests: [
      'Byzantine Fault Tolerant Consensus Protocols',
      'Formal Verification & Model Checking (TLA+)',
      'Asynchronous Distributed Systems & Replicated State Machines',
      'Cryptographic Primitives for Decentralized Systems',
    ],
  },
  education: [
    {
      id: 'edu-ac-1',
      institution: 'Stanford University',
      degree: 'Ph.D. in Computer Science',
      field: 'Systems & Security',
      location: 'Stanford, CA',
      startDate: '2019',
      endDate: '2024',
      gpa: 'GPA 3.96 / 4.0',
      details: 'Dissertation: "Resilient Consensus Under Adaptive Network Partitions". Advisor: Prof. Alex Rivera.',
    },
    {
      id: 'edu-ac-2',
      institution: 'Carnegie Mellon University',
      degree: 'B.S. in Computer Science',
      field: 'Computer Science with University Honors',
      location: 'Pittsburgh, PA',
      startDate: '2015',
      endDate: '2019',
      gpa: 'GPA 3.94 / 4.0 (University Honors)',
      details: 'Senior Thesis on asynchronous broadcast primitives.',
    },
  ],
  experience: [
    {
      id: 'exp-ac-1',
      company: 'MIT CSAIL',
      role: 'Postdoctoral Fellow',
      location: 'Cambridge, MA',
      startDate: '2024',
      endDate: 'Present',
      bullets: [
        'Developing provably safe consensus protocols for partially synchronous networks with zero-downtime reconfiguration.',
        'Co-advising graduate and undergraduate research projects on formal verification of distributed lock managers.',
      ],
      technologies: ['TLA+', 'Rust', 'Coq', 'Go'],
    },
    {
      id: 'exp-ac-2',
      company: 'Distributed Systems Laboratory',
      role: 'Graduate Research Assistant',
      location: 'Stanford, CA',
      startDate: '2019',
      endDate: '2024',
      bullets: [
        'Formally specified and verified novel consensus invariants with TLA+ and TLC model checker across 10^7 state transitions.',
        'Authored benchmark suites to evaluate protocol performance under simulated adversarial network delays.',
      ],
      technologies: ['TLA+', 'Go', 'Python', 'C++'],
    },
  ],
  publications: [
    {
      id: 'pub-ac-1',
      title: 'Partition-Tolerant State Machine Replication with Dynamic Validator Weights',
      authors: 'Jane A. Doe, Alex Rivera',
      venue: 'ACM Symposium on Operating Systems Principles (SOSP)',
      year: '2024',
      type: 'Conference',
      doiOrUrl: 'https://doi.org/10.1145/example',
    },
    {
      id: 'pub-ac-2',
      title: 'Formal Safety Proofs for Optimistic BFT Protocols',
      authors: 'Jane A. Doe, Marcus Vance, Elena Rostova',
      venue: 'USENIX Symposium on Networked Systems Design and Implementation (NSDI)',
      year: '2023',
      type: 'Conference',
    },
    {
      id: 'pub-ac-3',
      title: 'A Survey of Reconfiguration Protocols in Decentralized Ledgers',
      authors: 'Jane A. Doe',
      venue: 'IEEE Transactions on Dependable and Secure Computing',
      year: '2022',
      type: 'Journal',
    },
  ],
  projects: [
    {
      id: 'proj-ac-1',
      name: 'VeriSync',
      role: 'Creator',
      year: '2023',
      description: 'An open-source TLA+ formal specification and model-checking test harness for raft and paxos variants.',
      bullets: ['Exhaustively checked safety invariants across 10^7 state transitions under network drop simulations.'],
      stack: ['TLA+', 'Java', 'Python'],
      url: 'https://github.com/example/verisync',
    },
  ],
  skills: [
    {
      id: 'skill-ac-methods',
      category: 'Methods & Formalisms',
      items: ['TLA+ & PlusCal', 'Coq Proof Assistant', 'Model Checking', 'Distributed Algorithms', 'Safety & Liveness Proofs'],
    },
    {
      id: 'skill-ac-sys',
      category: 'Systems & Programming',
      items: ['Rust', 'Go', 'C++', 'Python', 'Linux Kernel Network Stack', 'Docker'],
    },
  ],
  awards: [
    {
      id: 'award-ac-1',
      title: 'NSF Graduate Research Fellowship (GRFP)',
      issuer: 'National Science Foundation',
      year: '2019 – 2022',
      description: 'Awarded to outstanding graduate students conducting research-based master\'s and doctoral degrees.',
    },
    {
      id: 'award-ac-2',
      title: 'Best Student Paper Award',
      issuer: 'SOSP',
      year: '2024',
    },
  ],
  certifications: [],
  teaching: [
    {
      id: 'teach-ac-1',
      role: 'Graduate Teaching Assistant',
      course: 'CS 244B: Distributed Systems',
      institution: 'Stanford University',
      period: 'Fall 2021, Spring 2023',
      details: 'Led weekly discussions, designed lab assignments implementing Raft in Go, and graded student submissions.',
    },
  ],
}

/** Sample preset geared towards industry, tech lead or senior software engineer roles. */
export const professionalSamplePreset: CvData = {
  basics: {
    name: 'Alex Mercer',
    headline: 'Senior Full-Stack & Infrastructure Engineer',
    email: 'alex.mercer@devmail.io',
    phone: '+1 (555) 456-7890',
    location: 'San Francisco, CA, USA',
    website: 'https://alexmercer.dev',
    linkedin: 'https://www.linkedin.com/in/example/',
    github: 'https://github.com/example',
    summary:
      'Senior software engineer with 7+ years of experience designing scalable microservices, low-latency distributed APIs, and automated cloud infrastructure. Track record of scaling systems to 20M+ MAU with 99.99% uptime.',
    researchInterests: [],
  },
  education: [
    {
      id: 'edu-pr-1',
      institution: 'Massachusetts Institute of Technology (MIT)',
      degree: 'B.S. in Computer Science & Engineering',
      field: 'Systems & Software Architecture',
      location: 'Cambridge, MA',
      startDate: '2014',
      endDate: '2018',
      gpa: 'GPA 3.91 / 4.0',
      details: 'Concentration in Distributed Systems and Cloud Architecture.',
    },
  ],
  experience: [
    {
      id: 'exp-pr-1',
      company: 'CloudStream Technologies',
      role: 'Staff Infrastructure Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      bullets: [
        'Architected real-time streaming pipeline processing 150K events/sec using Kafka, Go, and Kubernetes, reducing end-to-end latency by 45%.',
        'Led migration of monolithic payment services to event-driven microservices, improving deployment frequency from bi-weekly to 12x daily.',
        'Spearheaded zero-trust identity service with mTLS across 200+ microservices with zero production downtime.',
      ],
      technologies: ['Go', 'Kubernetes', 'Kafka', 'Terraform', 'PostgreSQL', 'AWS'],
    },
    {
      id: 'exp-pr-2',
      company: 'FinTech Velocity',
      role: 'Senior Software Engineer',
      location: 'Seattle, WA',
      startDate: '2018',
      endDate: '2022',
      bullets: [
        'Designed high-throughput ledger reconciliation engine processing $50M+ daily financial transactions with idempotency guarantees.',
        'Mentored 6 junior/mid-level engineers through structured code reviews and system design workshops.',
      ],
      technologies: ['TypeScript', 'Node.js', 'React', 'Redis', 'Docker'],
    },
  ],
  publications: [],
  projects: [
    {
      id: 'proj-pr-1',
      name: 'OmniTrace',
      role: 'Author',
      year: '2024',
      description: 'Distributed tracing aggregator correlating OpenTelemetry spans with infrastructure metric anomalies.',
      bullets: ['Adopted by 15+ engineering teams, cutting MTTR for production incidents from 48 minutes to under 9 minutes.'],
      stack: ['Go', 'OpenTelemetry', 'ClickHouse', 'React'],
      url: 'https://github.com/example/omnitrace',
    },
  ],
  skills: [
    {
      id: 'skill-pr-core',
      category: 'Languages & Core Stack',
      items: ['Go', 'TypeScript / JavaScript', 'Python', 'SQL', 'Rust (Intermediate)'],
    },
    {
      id: 'skill-pr-cloud',
      category: 'Cloud & Infrastructure',
      items: ['AWS (ECS, EKS, RDS, SQS)', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD (GitHub Actions)'],
    },
    {
      id: 'skill-pr-data',
      category: 'Distributed Systems & Data',
      items: ['Kafka', 'Redis', 'PostgreSQL', 'ElasticSearch', 'gRPC / Protocol Buffers'],
    },
  ],
  awards: [
    {
      id: 'award-pr-1',
      title: 'Company Engineering Excellence Award',
      issuer: 'CloudStream Technologies',
      year: '2023',
    },
  ],
  certifications: [
    {
      id: 'cert-pr-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      year: '2023',
    },
    {
      id: 'cert-pr-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      year: '2022',
    },
  ],
  teaching: [],
}

export const blankPreset: CvData = {
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
  publications: [],
  projects: [],
  skills: [],
  awards: [],
  certifications: [],
  teaching: [],
}

