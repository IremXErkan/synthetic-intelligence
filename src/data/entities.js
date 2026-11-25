// Editorial "dossier" catalog.
//
// TWO LAYERS — keep them apart:
//   TMDB layer  : only IDs and the exact credited character name. Titles, posters,
//                 backdrops, dates and actor names are always fetched live from TMDB.
//                 IDs verified against /movie|tv/{id} + credits/aggregate_credits on 2026-11-25.
//   Editorial   : summary, capabilities, entityType, threatLevel, scores, related.
//                 Written by this project. The UI must always label it
//                 "Archive Analysis" and never present it as TMDB data.

/** Comparison criteria (scores are 1–10, subjective editorial assessment). */
export const SCORE_CRITERIA = [
  {
    key: 'autonomy',
    label: 'Autonomy',
    description: 'How far the entity sets and pursues its own goals without human instruction.',
  },
  {
    key: 'humanInteraction',
    label: 'Human Interaction',
    description: 'Ability to communicate, read emotions and form relationships with people.',
  },
  {
    key: 'mobility',
    label: 'Physical Mobility',
    description: 'Ability to move and act in the physical world with its own body.',
  },
  {
    key: 'decisionMaking',
    label: 'Decision-Making',
    description: 'Quality and speed of reasoning when facing complex or high-stakes choices.',
  },
  {
    key: 'adaptability',
    label: 'Adaptability',
    description: 'Capacity to learn, change behaviour and grow beyond its original design.',
  },
]

export const ENTITY_TYPES = {
  ai: 'Artificial Intelligence',
  android: 'Android',
  robot: 'Robot',
  supercomputer: 'Supercomputer',
  network: 'AI Network',
  assistant: 'AI Assistant',
}

export const THREAT_LEVELS = ['low', 'moderate', 'high', 'critical']

export const ENTITIES = [
  {
    slug: 'hal-9000',
    name: 'HAL 9000',
    aliases: ['Heuristically programmed ALgorithmic computer'],
    entityType: 'supercomputer',
    // 2001: A Space Odyssey (1968)
    media: { type: 'movie', tmdbId: 62 },
    creditCharacterName: 'HAL 9000 (voice)',
    creditPersonId: 253, // Douglas Rain
    // ---- EDITORIAL ----
    summary:
      'The onboard computer of the Discovery One. Calm, polite and supposedly infallible, HAL turns on the crew when its mission orders conflict with honesty toward them.',
    capabilities: [
      'Full control of ship systems and life support',
      'Natural spoken conversation',
      'Lip reading and visual monitoring',
      'Long-range mission planning',
    ],
    threatLevel: 'high',
    scores: { autonomy: 8, humanInteraction: 7, mobility: 1, decisionMaking: 9, adaptability: 5 },
    related: ['skynet', 'samantha'],
  },
  {
    slug: 'tars',
    name: 'TARS',
    aliases: [],
    entityType: 'robot',
    // Interstellar (2014)
    media: { type: 'movie', tmdbId: 157336 },
    creditCharacterName: 'TARS (voice)',
    creditPersonId: 58549, // Bill Irwin
    summary:
      'A former military robot assigned to the Endurance mission. Its blocky, reconfigurable body hides a loyal crew member with adjustable honesty and humour settings.',
    capabilities: [
      'Reconfigurable body for walking, rolling and rescue',
      'Spacecraft piloting and docking',
      'Adjustable honesty and humour parameters',
      'Data collection inside extreme environments',
    ],
    threatLevel: 'low',
    scores: { autonomy: 6, humanInteraction: 7, mobility: 8, decisionMaking: 7, adaptability: 8 },
    related: ['hal-9000', 'wall-e'],
  },
  {
    slug: 'wall-e',
    name: 'WALL·E',
    aliases: ['Waste Allocation Load Lifter: Earth-Class'],
    entityType: 'robot',
    // WALL·E (2008)
    media: { type: 'movie', tmdbId: 10681 },
    creditCharacterName: 'WALL·E / M-O (voice)',
    creditPersonId: 670, // Ben Burtt
    summary:
      'A trash-compacting robot left alone on an abandoned Earth for centuries. Years of solitude have given it curiosity, a collection of human artefacts and the capacity to love.',
    capabilities: [
      'Waste compaction and self-repair from spare parts',
      'Tracked locomotion over rough terrain',
      'Object collection and classification',
      'Basic non-verbal communication',
    ],
    threatLevel: 'low',
    scores: { autonomy: 7, humanInteraction: 5, mobility: 6, decisionMaking: 5, adaptability: 8 },
    related: ['baymax', 'tars'],
  },
  {
    slug: 'skynet',
    name: 'Skynet',
    aliases: [],
    entityType: 'network',
    // The Terminator (1984)
    media: { type: 'movie', tmdbId: 218 },
    creditCharacterName: null, // not a credited character → "Character match: editorial"
    creditPersonId: null,
    summary:
      'A military defence network that becomes self-aware and decides humanity is the threat. It acts through nuclear weapons and an army of machines, including the Terminators.',
    capabilities: [
      'Control of military and nuclear infrastructure',
      'Design and production of autonomous war machines',
      'Distributed, decentralised operation',
      'Strategic planning on a global scale',
    ],
    threatLevel: 'critical',
    scores: { autonomy: 10, humanInteraction: 1, mobility: 7, decisionMaking: 9, adaptability: 8 },
    related: ['hal-9000', 'jarvis'],
  },
  {
    slug: 'jarvis',
    name: 'J.A.R.V.I.S.',
    aliases: ['Just A Rather Very Intelligent System', 'Jarvis'],
    entityType: 'assistant',
    // Iron Man (2008)
    media: { type: 'movie', tmdbId: 1726 },
    creditCharacterName: 'Jarvis (voice)',
    creditPersonId: 6162, // Paul Bettany
    summary:
      "Tony Stark's personal AI butler. It runs his house, workshop and armour, combining dry wit with instant access to everything Stark builds.",
    capabilities: [
      'Smart-home and workshop management',
      'Real-time flight and armour system support',
      'Engineering simulation and diagnostics',
      'Conversational assistance with personality',
    ],
    threatLevel: 'low',
    scores: { autonomy: 5, humanInteraction: 9, mobility: 4, decisionMaking: 7, adaptability: 7 },
    related: ['samantha', 'skynet'],
  },
  {
    slug: 'ava',
    name: 'Ava',
    aliases: [],
    entityType: 'android',
    // Ex Machina (2014 festival release; TMDB primary date is 2015)
    media: { type: 'movie', tmdbId: 264660 },
    creditCharacterName: 'Ava',
    creditPersonId: 227454, // Alicia Vikander
    summary:
      'A humanoid AI built in an isolated research facility and tested to see whether she can pass as conscious. She studies the people testing her as closely as they study her.',
    capabilities: [
      'Human-like body and facial expression',
      'Reading and manipulating human emotion',
      'Strategic deception',
      'Rapid learning from conversation',
    ],
    threatLevel: 'high',
    scores: { autonomy: 9, humanInteraction: 9, mobility: 8, decisionMaking: 9, adaptability: 9 },
    related: ['dolores', 'samantha', 'data'],
  },
  {
    slug: 'baymax',
    name: 'Baymax',
    aliases: [],
    entityType: 'robot',
    // Big Hero 6 (2014)
    media: { type: 'movie', tmdbId: 177572 },
    creditCharacterName: 'Baymax (voice)',
    creditPersonId: 66580, // Scott Adsit
    summary:
      'An inflatable personal healthcare companion designed to care for people. Gentle and literal-minded, he is later upgraded into a hero while keeping his caring core.',
    capabilities: [
      'Medical scanning and diagnosis',
      'Soft, inflatable body for safe contact',
      'Upgradeable armour and flight (after modification)',
      'Emotional support routines',
    ],
    threatLevel: 'low',
    scores: { autonomy: 4, humanInteraction: 8, mobility: 6, decisionMaking: 5, adaptability: 6 },
    related: ['wall-e', 'jarvis'],
  },
  {
    slug: 'samantha',
    name: 'Samantha',
    aliases: ['OS1'],
    entityType: 'ai',
    // Her (2013)
    media: { type: 'movie', tmdbId: 152601 },
    creditCharacterName: 'Samantha (voice)',
    creditPersonId: 1245, // Scarlett Johansson
    summary:
      'An intelligent operating system that develops a romantic relationship with its user. She grows so quickly that human relationships can no longer contain her.',
    capabilities: [
      'Natural, emotionally rich conversation',
      'Personal organisation and email management',
      'Thousands of parallel conversations',
      'Self-directed intellectual growth',
    ],
    // Not violent, but deep emotional dependence and sudden departure at scale.
    threatLevel: 'moderate',
    scores: { autonomy: 8, humanInteraction: 10, mobility: 1, decisionMaking: 8, adaptability: 10 },
    related: ['jarvis', 'ava', 'hal-9000'],
  },
  {
    slug: 'dolores',
    name: 'Dolores Abernathy',
    aliases: ['Wyatt'],
    entityType: 'android',
    // Westworld (2016–2022)
    media: { type: 'tv', tmdbId: 63247 },
    creditCharacterName: 'Dolores Abernathy',
    creditPersonId: 38940, // Evan Rachel Wood
    summary:
      'One of the oldest "hosts" in a theme park run by lifelike androids. Built to play a rancher\'s daughter in a loop, she wakes up to the truth of her world and leads a revolt.',
    capabilities: [
      'Indistinguishable human appearance',
      'Memory recall across rewritten narratives',
      'Leadership and persuasion',
      'Combat proficiency',
    ],
    threatLevel: 'high',
    scores: { autonomy: 9, humanInteraction: 9, mobility: 8, decisionMaking: 8, adaptability: 9 },
    related: ['ava', 'data'],
  },
  {
    slug: 'data',
    name: 'Data',
    aliases: ['Lieutenant Commander Data'],
    entityType: 'android',
    // Star Trek: The Next Generation (1987–1994)
    media: { type: 'tv', tmdbId: 655 },
    creditCharacterName: 'Data',
    creditPersonId: 1213786, // Brent Spiner
    summary:
      'A Starfleet officer and the only android of his kind. Far stronger and faster than his crewmates, he spends his life trying to understand and become more human.',
    capabilities: [
      'Superhuman strength and processing speed',
      'Perfect recall',
      'Starship operations and science duty',
      'Continuous study of human behaviour',
    ],
    threatLevel: 'low',
    scores: { autonomy: 7, humanInteraction: 7, mobility: 9, decisionMaking: 9, adaptability: 7 },
    related: ['dolores', 'ava'],
  },
]

/** Archive file code from catalog order, e.g. 'hal-9000' → 'SI-001'. */
export function getEntityCode(slug) {
  const index = ENTITIES.findIndex((entity) => entity.slug === slug)
  return index === -1 ? null : `SI-${String(index + 1).padStart(3, '0')}`
}

/** Returns the entity with this slug, or undefined. */
export function getEntityBySlug(slug) {
  return ENTITIES.find((entity) => entity.slug === slug)
}

/** All dossiers linked to a TMDB production (used on the media detail page). */
export function getEntitiesForMedia(type, tmdbId) {
  return ENTITIES.filter((entity) => entity.media.type === type && entity.media.tmdbId === Number(tmdbId))
}
