export type VitaeGrade = {
  id: string
  number: string
  title: string
  school: 'elementary' | 'intermediate' | 'high'
  function: string
  summary: string
}

export type VitaeSchool = {
  id: 'elementary' | 'intermediate' | 'high'
  title: string
  purpose: string
  grades: VitaeGrade[]
}

export type VitaeSpecialization = {
  id: string
  title: string
  mandate: string
  domain: string
  risk: string
  safeguard: string
}

export const VITAE_SCHOOLS: VitaeSchool[] = [
  {
    id: 'elementary',
    title: 'Elementary School',
    purpose: 'Stabilizes the self before systems, creation, or mastery are approached.',
    grades: [
      { id: 'guardian', number: 'I', title: 'The Guardian', school: 'elementary', function: 'Self-governance and reliability', summary: 'Daily self-regulation, responsibility, and continuity.' },
      { id: 'seeker', number: 'II', title: 'The Seeker', school: 'elementary', function: 'Meaning discipline and inquiry stability', summary: 'Inquiry without obsession; ambiguity without collapse.' },
      { id: 'disciple', number: 'III', title: 'The Disciple', school: 'elementary', function: 'Ethical action without authority', summary: 'Proportional action, restraint, and consequence.' },
      { id: 'mystic', number: 'IV', title: 'The Mystic', school: 'elementary', function: 'Perception without interpretation', summary: 'Perceptual range with grounding and containment.' },
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermediate School',
    purpose: 'Stabilizes systems, complexity, care, knowledge, and transformation.',
    grades: [
      { id: 'scholar', number: 'V', title: 'The Scholar', school: 'intermediate', function: 'Structured knowledge and cognitive architecture', summary: 'Disciplined learning and signal discernment.' },
      { id: 'healer', number: 'VI', title: 'The Healer', school: 'intermediate', function: 'Care, maintenance, and restoration', summary: 'Repair without ownership; restoration without authority.' },
      { id: 'alchemist', number: 'VII', title: 'The Alchemist', school: 'intermediate', function: 'Transformation and synthesis', summary: 'Change under ethical constraint.' },
      { id: 'sage', number: 'VIII', title: 'The Sage', school: 'intermediate', function: 'Integration and reflective wisdom', summary: 'Wisdom lived, not imposed.' },
    ],
  },
  {
    id: 'high',
    title: 'High School',
    purpose: 'Stabilizes creation, pattern-level consequence, and generative influence.',
    grades: [
      { id: 'oracle', number: 'IX', title: 'The Oracle', school: 'high', function: 'Pattern perception and foresight without prophecy', summary: 'Seeing without declaring truth.' },
      { id: 'adept', number: 'X', title: 'The Adept', school: 'high', function: 'Creative stabilization and governance readiness', summary: 'Creation without distortion; readiness for specialization.' },
    ],
  },
]

export const VITAE_SPECIALIZATIONS: VitaeSpecialization[] = [
  { id: 'arcanist', title: 'Arcanist', mandate: 'Epistemic stewardship', domain: 'Knowledge systems', risk: 'Dogmatism', safeguard: 'Epistemic humility' },
  { id: 'philosopher', title: 'Philosopher', mandate: 'Coherence without closure', domain: 'Meaning and ethics', risk: 'Totalizing narratives', safeguard: 'Open-ended inquiry' },
  { id: 'illusionist', title: 'Illusionist', mandate: 'Perceptual hygiene', domain: 'Bias and projection', risk: 'Superiority drift', safeguard: 'Consent gates' },
  { id: 'astrologer', title: 'Astrologer', mandate: 'Scale and rhythm without fate', domain: 'Cycles and timing', risk: 'Fatalism', safeguard: 'Agency preservation' },
  { id: 'hierophant', title: 'Hierophant', mandate: 'Threshold stewardship', domain: 'Liminality and rites', risk: 'Gatekeeping', safeguard: 'Voluntary participation' },
  { id: 'druid', title: 'Druid', mandate: 'Living systems stewardship', domain: 'Ecology and embodiment', risk: 'Moral superiority', safeguard: 'Relational ethics' },
  { id: 'necromancer', title: 'Necromancer', mandate: 'Ethical endings and release', domain: 'Grief and impermanence', risk: 'Morbid fixation', safeguard: 'Care-first framing' },
  { id: 'alchemist-specialization', title: 'Alchemist', mandate: 'Ethical transformation', domain: 'Synthesis and change', risk: 'Power inflation', safeguard: 'Reversibility' },
  { id: 'artificer', title: 'Artificer', mandate: 'Responsible form and tool stewardship', domain: 'Design and maintenance', risk: 'Over-optimization', safeguard: 'Repair priority' },
  { id: 'enchanter', title: 'Enchanter', mandate: 'Meaning and resonance without control', domain: 'Atmosphere and symbol', risk: 'Charismatic authority', safeguard: 'Consent and impermanence' },
]
