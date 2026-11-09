// Everything personal lives here — edit this file, then run `node scripts/build.mjs`.

export const profile = {
  user: 'vacucity',
  name: 'Chujie Wang',
  linkedin: 'https://www.linkedin.com/in/vacucity',
  homepage: 'https://vacucity.github.io',
  email: 'chujie@uchicago.edu',

  // Portrait blended into the right side of the header; remove to go back to the plain night scene.
  heroine: 'art/heroine.jpg',

  kicker: 'VACUCITY  ·  ECONOMICS × AI',
  // Rotating lines under the name in the header banner.
  taglines: [
    'Economics is for the fun, coding is the future.',
    'Finance @ ZUEL  →  Applied Data Science @ UChicago',
    'LLM Agents  ·  RAG  ·  Causal Inference  ·  Labor Economics',
    'you still have lots more to work on.',
  ],
  motto: 'you still have lots more to work on.',

  // Name card
  school: 'THE UNIVERSITY OF CHICAGO',
  program: 'M.S. in Applied Data Science',
  cohort: 'Graduate Student  ·  2026 – 2027',
  status: 'ENROLLED  ·  CLASS OF 2027',
  campus: '41.79° N · 87.60° W  —  HYDE PARK, CHICAGO',

  // LinkedIn card
  headline: 'M.S. Applied Data Science @ UChicago  ·  Finance @ ZUEL  ·  Economics × AI',
  journey: [
    { when: '09/2021 – 06/2025', org: 'ZUEL', role: 'Finance · Undergraduate', kind: 'edu' },
    { when: '10/2023 – 12/2023', org: 'McKinsey & Company', role: 'Strategy Intern', kind: 'work' },
    { when: '06/2024 – 09/2024', org: 'Changjiang Securities', role: 'Research Intern · Food & Bev', kind: 'work' },
    { when: '07/2025 – 10/2025', org: 'Qu County Project', role: 'Modeling Consultant', kind: 'work' },
    { when: '11/2025 – 02/2026', org: 'HengZong XinXi', role: 'Algorithm Research · RAG', kind: 'work' },
    { when: '06/2026 – 09/2026', org: 'Guancheng Digital', role: 'Forward Deployed Engineer', kind: 'work' },
    { when: '09/2026 – 12/2027', org: 'UChicago', role: 'M.S. Applied Data Science', kind: 'edu', now: true },
  ],
  focus: ['LLM Agents', 'Agentic RAG', 'Multimodal Metaphor Detection', 'Causal Inference · DID', 'Labor & Innovation Econ', 'FRM Part I'],

  // Repo cards. Descriptions override the (often empty) GitHub ones.
  // Add, remove or reorder entries here; the README section and the card SVGs follow automatically.
  // A repo that no longer exists (deleted, renamed, made private) is skipped with a warning.
  featured: [
    { repo: 'Group-Research', tag: 'IN PROGRESS', desc: 'One-stop research collaboration app: turns scattered ideas into research concepts and automates literature retrieval & analysis.' },
    { repo: 'Decree-Farm', tag: 'ADVENTURE-X · 2ND PRIZE', desc: 'Gamified focus manager: a smart ring reads your focus, and an AI agent farms Stardew Valley for you.' },
    { repo: 'ScenicMind', tag: 'MULTI-AGENT', desc: 'AI copilot for scenic-area ops: visitor-flow forecasting, 8 KPI modules and multi-agent decision reports.' },
  ],

  // "Learning series" table under the cards. Order here = column order in the README.
  seriesTitle: 'UCVC AI Lab · learning series',
  series: [
    { repo: 'DL-for-Sanan-LI', label: 'Deep Learning', color: 'b9a8ff' },
    { repo: 'RL-for-Sanan-Li', label: 'Reinforcement Learning', color: 'f6c1d9' },
    { repo: 'RAG-for-Sanan-Li', label: 'RAG', color: 'ffe0c2' },
    { repo: 'cs336-for-Sanan-Li', label: 'CS336 · LM from scratch', color: '6f9bff' },
    { repo: 'Agent_learning', label: 'Agents', color: '9ff0dc' },
  ],
};
