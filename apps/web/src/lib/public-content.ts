/**
 * @module public-content
 * @description Editorial content for the public site.
 *
 * The public surface is intentionally content-first: it ships with real,
 * verified project material rather than waiting on an empty database. Work
 * added through the admin dashboard still appears alongside this curated set.
 *
 * Everything here is plain data so pages can stay server-rendered.
 */

export const SITE = {
  name: 'Bappadala Rohith Kumar Naidu',
  shortName: 'Rohith Naidu',
  firstName: 'Rohith',
  role: 'Software engineer',
  tagline: 'I build systems that have to be right.',
  intro:
    'I work across applied AI, platform engineering, and full-stack product — usually where a model has to earn its answer and a release has to be provable.',
  description:
    'Software engineer working on applied AI systems, developer platforms, and full-stack products. Open-source builder behind Forgevena, DRAXELYRA, and ScholarFormAI.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rohitkumarnaidu.github.io/Portfolio',
  github: 'https://github.com/rohitkumarnaidu',
  githubHandle: 'rohitkumarnaidu',
  npm: 'https://www.npmjs.com/package/forgevena',
  available: true,
  availabilityLabel: 'Open to work',
  locale: 'en_US',
} as const;

export const PUBLIC_NAV = [
  { label: 'Work', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Writing', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export interface WorkLink {
  label: string;
  href: string;
}

export interface WorkFact {
  value: string;
  label: string;
}

export interface WorkSection {
  title: string;
  body: string[];
}

export interface WorkProject {
  slug: string;
  title: string;
  kicker: string;
  year: string;
  summary: string;
  stack: string[];
  facts: WorkFact[];
  sections: WorkSection[];
  links: WorkLink[];
  featured?: boolean;
}

export const WORK: WorkProject[] = [
  {
    slug: 'forgevena',
    title: 'Forgevena',
    kicker: 'Platform engineering',
    year: '2026',
    summary:
      'A governed engineering platform that carries a project from idea to signed release — with policy, provenance, and recovery built into the CLI.',
    stack: ['Node.js', 'JavaScript', 'MCP', 'CLI design', 'GitHub Actions'],
    facts: [
      { value: '1.3.0', label: 'Stable npm release' },
      { value: '32', label: 'Concurrent writers' },
      { value: '1,000', label: 'Corruption cases tested' },
      { value: 'Signed', label: 'Release artifacts' },
    ],
    links: [
      { label: 'Source', href: 'https://github.com/rohitkumarnaidu/Forgevena' },
      { label: 'npm', href: 'https://www.npmjs.com/package/forgevena' },
      { label: 'Documentation', href: 'https://rohitkumarnaidu.github.io/Forgevena/' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Release work is usually spread across scripts, CI configuration, dashboards, and memory. Add AI-assisted development and the problem compounds: tools get access without boundaries, and nobody can prove what changed, who approved it, or why it shipped.',
          'Forgevena treats delivery as a governed system rather than a pile of automation. The CLI is the interface, but the guarantee is the product.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'Plugins and MCP integrations run inside explicit controls. Concurrent writers are serialized through a locking model tested at 32 simultaneous writers. Releases are signed and traceable, so provenance is attached to the artifact instead of reconstructed after the fact.',
          'Recovery is designed rather than hoped for: the test suite deliberately corrupts state in a thousand different ways and verifies that the system fails loudly and recovers predictably.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'A stable npm package with a documented plugin surface, a generated documentation site, CI-enforced coverage, security workflows, and signed releases. It is the clearest expression of how I think about developer tools: give people leverage, but keep the boundary visible.',
        ],
      },
    ],
    featured: true,
  },
  {
    slug: 'draxelyra',
    title: 'DRAXELYRA',
    kicker: 'Disaster response',
    year: '2026',
    summary:
      'An operating system that turns post-disaster imagery, weather telemetry, and agency feeds into explainable priorities and accountable field work.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'PGlite', 'WebSockets', 'PWA'],
    facts: [
      { value: '5-factor', label: 'Priority scoring' },
      { value: 'FSM', label: 'Task lifecycle' },
      { value: 'Realtime', label: 'WebSocket updates' },
      { value: 'Offline', label: 'Field-ready PWA' },
    ],
    links: [
      {
        label: 'Live application',
        href: 'https://disaster-intelligence-response-os.up.railway.app/',
      },
      {
        label: 'Documentation',
        href: 'https://rohitkumarnaidu.github.io/Disaster-Intelligence-Response-OS/',
      },
      {
        label: 'Source',
        href: 'https://github.com/rohitkumarnaidu/Disaster-Intelligence-Response-OS',
      },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'After a disaster, the bottleneck is rarely a lack of data. It is turning satellite passes, weather feeds, and agency reports into decisions a field team can trust, act on, and audit — while conditions change underneath them.',
          'Most response tools optimize for a command-center dashboard. The harder problem is keeping the field view, the priority queue, and the record of what actually happened in agreement.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'DRAXELYRA scores incidents across five factors, moves every task through an explicit finite-state lifecycle, and keeps the reasoning attached to the decision. Realtime updates over WebSockets keep command and field views aligned; an offline-capable PWA keeps the field view usable when the network is not.',
          'PostgreSQL carries production state, while PGlite provides an embedded database where a full server is the wrong fit. The architecture follows the deployment reality instead of forcing one shape everywhere.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'A live production application and a separate documentation site. Every priority queue is explainable, every field task has an owner and a state, and the system records verified outcomes rather than assuming the plan worked.',
        ],
      },
    ],
    featured: true,
  },
  {
    slug: 'insurance-evidence-review',
    title: 'Evidence Review Pipeline',
    kicker: 'Applied AI',
    year: '2026',
    summary:
      'A claim-review pipeline that reads text and images, checks the evidence, detects fraud, and explains the decision — with deterministic engines where correctness matters.',
    stack: ['Python', 'Vision-language models', 'YOLOv8', 'LLM providers', 'Rule engines'],
    facts: [
      { value: '8', label: 'Deterministic engines' },
      { value: '4', label: 'LLM providers' },
      { value: 'Majority', label: 'Vote consensus' },
      { value: 'Per-key', label: 'Rate limiting' },
    ],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/rohitkumarnaidu/multi-modal-insurance-evidence-review-pipeline',
      },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Insurance claim review mixes unstructured text, damaged-item photos, and policy rules. A single model call is fast but opaque; a pure rules engine is explainable but brittle. Neither is sufficient when the output changes what a person receives.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'The pipeline runs eight deterministic engines in sequence: text extraction, vision analysis, evidence sufficiency, image quality, fraud detection, risk history, decision, and explanation. Vision-language models read the images, YOLOv8 localizes damage, and four LLM providers sit behind a common interface.',
          'No single provider decides alone. Per-key rate limiting keeps the service stable, and majority-vote consensus across providers reduces the blast radius of any one model being wrong. The final decision is constrained by rules, then explained in language a reviewer can act on.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'An end-to-end review service that returns a claim status, a risk signal, and a human-readable explanation. Mismatched or fraudulent images are flagged rather than silently accepted, and every stage leaves enough evidence to reconstruct the decision.',
        ],
      },
    ],
    featured: true,
  },
  {
    slug: 'ai-message-router',
    title: 'AI Message Router',
    kicker: 'Applied AI',
    year: '2026',
    summary:
      'Routes WhatsApp messages into notify, digest, or mute by reading text, images, and voice notes — with deterministic safety around the model.',
    stack: ['Python', 'FastAPI', 'Next.js', 'ASR', 'OCR'],
    facts: [
      { value: '118', label: 'Passing tests' },
      { value: '3', label: 'Input modalities' },
      { value: '3', label: 'Routing actions' },
      { value: '2', label: 'Applications' },
    ],
    links: [
      {
        label: 'Source',
        href: 'https://github.com/rohitkumarnaidu/AI-Message-Notification-Router',
      },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Every message arrives with the same urgency. A bank OTP, a scam forward, and a wedding invitation all produce the same buzz, so people either miss what matters or turn notifications off entirely.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'Each message is analyzed across text, image, and voice. A model classifies intent and urgency, while deterministic checks constrain the output: the router can only return notify, digest, or mute, and unsafe or low-confidence results fall back to a conservative path.',
          'Sender history and personal context shape the decision without becoming an unbounded prompt. The routing contract stays explicit, which makes the product behavior testable rather than merely probabilistic.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'A FastAPI service and a Next.js console, with 118 passing tests and a CI workflow. The interesting part is not the classification accuracy — it is that the system can explain and defend every interruption it chooses to make.',
        ],
      },
    ],
  },
  {
    slug: 'scholarform',
    title: 'ScholarFormAI',
    kicker: 'Academic tooling',
    year: '2026',
    summary:
      'Turns a raw manuscript into a publisher-ready document — or generates a cited paper from a prompt with an agentic workflow.',
    stack: ['Python', 'Agentic AI', 'RAG', 'WebSockets', 'Document parsing'],
    facts: [
      { value: '17+', label: 'Publisher templates' },
      { value: '5', label: 'Input formats' },
      { value: 'Multi-doc', label: 'RAG synthesis' },
      { value: 'Live', label: 'Public demo' },
    ],
    links: [
      { label: 'Live application', href: 'https://scholarform.vercel.app' },
      { label: 'Source', href: 'https://github.com/rohitkumarnaidu/ScholarFormAI' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Researchers lose days to formatting, reference resolution, and journal-specific templates. Existing tools handle one input format or one publisher, then stop. The work is repetitive, but the cost of getting it wrong is high.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'ScholarFormAI accepts DOCX, PDF, LaTeX, Markdown, and HTML, extracts structure through a three-tier parser, and emits output in 17+ templates including IEEE, APA, Springer, and Nature. A multi-agent generator can draft a paper with iterative outline approval and streaming, while multi-document RAG keeps citations grounded in the sources the user provides.',
          'A split-pane diff editor over WebSockets and server-sent events makes the transformation inspectable instead of magic.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'A live product with an agentic generation flow, a multi-document synthesis workspace, and an MIT-licensed codebase with SLSA Level 3 provenance. It is the project where document structure, model output, and human review had to meet in one interface.',
        ],
      },
    ],
  },
  {
    slug: 'aureus',
    title: 'Aureus Banking',
    kicker: 'Full-stack product',
    year: '2025',
    summary:
      'A digital banking simulation with UPI payments, KYC workflows, admin controls, analytics, and budgeting.',
    stack: ['React', 'Vite', 'REST API', 'Role-based admin'],
    facts: [
      { value: '35+', label: 'User pages' },
      { value: '10', label: 'Admin pages' },
      { value: 'UPI', label: 'Payment flows' },
      { value: 'KYC', label: 'Review workflow' },
    ],
    links: [
      { label: 'Live application', href: 'https://aureus-banking.vercel.app' },
      {
        label: 'Source',
        href: 'https://github.com/rohitkumarnaidu/Modern-Digital-Banking-Dashboard',
      },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Banking dashboards are usually demos: a few screens, fake data, and no operational surface. The interesting part is everything around the transaction — identity, limits, admin control, and the ledger.',
        ],
      },
      {
        title: 'The approach',
        body: [
          'Aureus models the full product: accounts, UPI payments, KYC review, transaction analytics, budgets, bills, rewards, and push notifications, with separate user and admin experiences over a shared API.',
          'The admin surface is treated as a first-class product, not a debug panel. That is where limits, reviews, and exceptions actually live.',
        ],
      },
      {
        title: 'What shipped',
        body: [
          'A deployed full-stack application with 35+ user-facing pages and 10 admin pages, built as an Infosys Springboard internship project and kept live as a working reference.',
        ],
      },
    ],
  },
];

export const FEATURED_WORK = WORK.filter((project) => project.featured);

export function getWork(slug: string): WorkProject | undefined {
  return WORK.find((project) => project.slug === slug);
}

export interface Capability {
  index: string;
  title: string;
  body: string;
  detail: string[];
}

export const CAPABILITIES: Capability[] = [
  {
    index: '01',
    title: 'Applied AI systems',
    body: 'Multimodal pipelines, retrieval, agent workflows, and the evaluation and guardrails that make them dependable.',
    detail: [
      'Vision-language pipelines',
      'RAG and retrieval',
      'Agent workflows',
      'Deterministic guardrails',
    ],
  },
  {
    index: '02',
    title: 'Platform engineering',
    body: 'CLIs, release automation, policy boundaries, and developer tooling that stays legible under load.',
    detail: [
      'CLI and plugin design',
      'Release provenance',
      'MCP integrations',
      'CI and security workflows',
    ],
  },
  {
    index: '03',
    title: 'Product engineering',
    body: 'Full-stack applications with real auth, real data, and interfaces that hold up outside a demo.',
    detail: ['Next.js and React', 'NestJS and FastAPI', 'PostgreSQL', 'Offline-first interfaces'],
  },
];

export interface Principle {
  index: string;
  title: string;
  body: string;
}

export const PRINCIPLES: Principle[] = [
  {
    index: '01',
    title: 'Correctness is a feature.',
    body: 'If a decision matters, it gets a rule, a test, and an explanation. Models are components, not authorities.',
  },
  {
    index: '02',
    title: 'Make the boundary explicit.',
    body: 'Tools, permissions, and failure modes should be visible in the interface, not buried in a prompt.',
  },
  {
    index: '03',
    title: 'Ship the whole path.',
    body: 'A feature is not done at the happy path. Auth, recovery, empty states, and release are part of the work.',
  },
  {
    index: '04',
    title: 'Prefer boring foundations.',
    body: 'Postgres, HTTP, and a clear state machine beat a clever abstraction you cannot debug at 2 a.m.',
  },
];

export const TOOLKIT = [
  {
    label: 'Languages',
    items: ['TypeScript', 'Python', 'JavaScript', 'SQL'],
  },
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'Tailwind CSS', 'Vite'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'FastAPI', 'NestJS', 'PostgreSQL'],
  },
  {
    label: 'AI systems',
    items: ['Vision-language models', 'RAG', 'Agent workflows', 'MCP'],
  },
  {
    label: 'Platform',
    items: ['GitHub Actions', 'Docker', 'Railway', 'Vercel'],
  },
] as const;

export const ABOUT_PARAGRAPHS = [
  'I am a software engineer who likes the part of the problem where the demo ends. The model works on a sample; now it has to work on a bad photo at 3 a.m. The CLI runs once; now it has to survive two writers, a corrupted lock file, and a release someone will audit six months later.',
  'That interest shows up across the work: a governed release platform, a disaster-response operating system, an insurance claim pipeline that has to explain itself, and a set of full-stack products built around real workflows rather than screenshots.',
  'I work mostly in TypeScript and Python, with PostgreSQL underneath and a bias toward explicit state. I care about interfaces that make the system legible — for the person using it and for the person who has to fix it later.',
  'Most of this is public. The code, the tests, and the release notes are the honest version of the portfolio.',
] as const;

export const FACTS = [
  { value: '31', label: 'Public repositories' },
  { value: '6', label: 'Systems in this index' },
  { value: '3', label: 'Live products' },
  { value: '2025', label: 'Building in public since' },
] as const;
