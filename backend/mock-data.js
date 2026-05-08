/**
 * Mock data matching the Vanyar Ontology schema.
 * Used when backend is started with: node server.js --mock
 * Lets you test the full website UI without Foundry credentials.
 */

export const MOCK = {
  stats: {
    totalUsers: 142,
    totalEvents: 4,
    activeEvents: 1,
    tracks: 7,
    submissions: 89,
    organisations: 3,
    modulesCompleted: 21,
    avgScore: 82,
  },

  events: [
    {
      primaryKey: 'evt-001',
      properties: {
        eventId: 'evt-001',
        name: 'Vanyar Hackathon — Foundry Sprint I',
        type: 'HACKATHON',
        status: 'ACTIVE',
        startDate: '2026-04-15',
        endDate: '2026-04-22',
        orgId: 'org-001',
        description: 'A competitive build challenge on Palantir Foundry. Teams compete to build the best AIP-powered analytics application in 72 hours.',
        maxParticipants: 60,
      },
    },
    {
      primaryKey: 'evt-002',
      properties: {
        eventId: 'evt-002',
        name: 'FDE Onboarding Cohort — April 2026',
        type: 'TRAINING',
        status: 'PUBLISHED',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        orgId: 'org-002',
        description: 'Structured onboarding for new Foundry Dev Engineers. Covers Pipeline Builder, Ontology design, Workshop application development and OSDK.',
        maxParticipants: 30,
      },
    },
    {
      primaryKey: 'evt-003',
      properties: {
        eventId: 'evt-003',
        name: 'Supply Chain Optimisation Challenge',
        type: 'HACKATHON',
        status: 'COMPLETED',
        startDate: '2026-03-01',
        endDate: '2026-03-08',
        orgId: 'org-001',
        description: 'Participants model and optimise supply chain networks using Foundry Ontology and AIP agent workflows.',
      },
    },
    {
      primaryKey: 'evt-004',
      properties: {
        eventId: 'evt-004',
        name: 'Ontology Design Masterclass',
        type: 'TRAINING',
        status: 'PUBLISHED',
        startDate: '2026-06-10',
        endDate: '2026-06-14',
        orgId: 'org-003',
        description: 'Advanced workshop on Ontology schema design, link graph modelling and action type architecture in Palantir Foundry.',
      },
    },
  ],

  leaderboard: [
    { primaryKey: 'lb-01', properties: { entryId: 'lb-01', eventId: 'evt-001', userId: 'Aisha Patel', teamId: 'Team Alpha', rank: 1, totalScore: 94.5, submissionCount: 3, lastSubmittedAt: '2026-04-19T18:22:00Z' } },
    { primaryKey: 'lb-02', properties: { entryId: 'lb-02', eventId: 'evt-001', userId: 'Priya Sharma', teamId: 'Team Alpha', rank: 2, totalScore: 91.0, submissionCount: 2, lastSubmittedAt: '2026-04-19T16:45:00Z' } },
    { primaryKey: 'lb-03', properties: { entryId: 'lb-03', eventId: 'evt-001', userId: 'James Okonkwo', teamId: 'Team Nexus', rank: 3, totalScore: 88.5, submissionCount: 4, lastSubmittedAt: '2026-04-20T09:10:00Z' } },
    { primaryKey: 'lb-04', properties: { entryId: 'lb-04', eventId: 'evt-001', userId: 'Mei Lin Zhang', teamId: 'Team Nexus', rank: 4, totalScore: 85.0, submissionCount: 2, lastSubmittedAt: '2026-04-18T22:00:00Z' } },
    { primaryKey: 'lb-05', properties: { entryId: 'lb-05', eventId: 'evt-001', userId: 'Ravi Krishnamurthy', teamId: 'Team Forge', rank: 5, totalScore: 82.0, submissionCount: 3, lastSubmittedAt: '2026-04-19T14:30:00Z' } },
    { primaryKey: 'lb-06', properties: { entryId: 'lb-06', eventId: 'evt-001', userId: 'Sophie Laurent', teamId: 'Team Forge', rank: 6, totalScore: 79.5, submissionCount: 2, lastSubmittedAt: '2026-04-20T08:00:00Z' } },
    { primaryKey: 'lb-07', properties: { entryId: 'lb-07', eventId: 'evt-003', userId: 'Daniel Osei', teamId: 'Team Vertex', rank: 1, totalScore: 97.0, submissionCount: 1, lastSubmittedAt: '2026-03-07T20:00:00Z' } },
    { primaryKey: 'lb-08', properties: { entryId: 'lb-08', eventId: 'evt-003', userId: 'Fatima Al-Rashid', teamId: 'Team Vertex', rank: 2, totalScore: 93.0, submissionCount: 2, lastSubmittedAt: '2026-03-07T18:15:00Z' } },
  ],

  tracks: [
    { primaryKey: 'trk-001', properties: { trackId: 'trk-001', name: 'Foundry Dev Engineer (FDE) — Core', difficulty: 'BEGINNER', estimatedHours: 40, moduleCount: 8, description: 'The complete onboarding track for new FDEs. Covers Pipeline Builder, Ontology fundamentals, Workshop and action types from first principles.' } },
    { primaryKey: 'trk-002', properties: { trackId: 'trk-002', name: 'Ontology Architecture', difficulty: 'INTERMEDIATE', estimatedHours: 24, moduleCount: 5, description: 'Advanced ontology design patterns — link graph modelling, object type backed datasets, action type validation and search configuration.' } },
    { primaryKey: 'trk-003', properties: { trackId: 'trk-003', name: 'AIP & Agent Engineering', difficulty: 'ADVANCED', estimatedHours: 32, moduleCount: 7, description: 'Build production-grade AIP agents on Palantir. LLM integration, agent actions, logic tier design and multi-agent orchestration patterns.' } },
    { primaryKey: 'trk-004', properties: { trackId: 'trk-004', name: 'Solution Architecture', difficulty: 'INTERMEDIATE', estimatedHours: 28, moduleCount: 6, description: 'Technical blueprint design for Palantir implementations. HLD, LLD, security model, data flow and stakeholder engagement patterns.' } },
    { primaryKey: 'trk-005', properties: { trackId: 'trk-005', name: 'Pipeline Builder & Data Engineering', difficulty: 'BEGINNER', estimatedHours: 20, moduleCount: 4, description: 'Design and build production data pipelines in Foundry. Incremental transforms, branching strategies and pipeline health patterns.' } },
    { primaryKey: 'trk-006', properties: { trackId: 'trk-006', name: 'OSDK & External Applications', difficulty: 'ADVANCED', estimatedHours: 36, moduleCount: 8, description: 'Build client-facing applications using the Foundry OSDK. Confidential clients, object queries, action invocation and TypeScript integration.' } },
    { primaryKey: 'trk-007', properties: { trackId: 'trk-007', name: 'Workshop Application Development', difficulty: 'INTERMEDIATE', estimatedHours: 18, moduleCount: 4, description: 'Build role-based Workshop applications on Foundry. Layouts, variables, action buttons and object-set filtered views.' } },
  ],

  challengesForEvent: {
    'evt-001': [
      { primaryKey: 'ch-001', properties: { challengeId: 'ch-001', eventId: 'evt-001', title: 'Supply Chain Optimisation', type: 'ANALYTICAL', maxScore: 100, scoringMethod: 'automated' } },
      { primaryKey: 'ch-002', properties: { challengeId: 'ch-002', eventId: 'evt-001', title: 'AIP Agent Design', type: 'NON_ANALYTICAL', maxScore: 100, scoringMethod: 'judge' } },
      { primaryKey: 'ch-003', properties: { challengeId: 'ch-003', eventId: 'evt-001', title: 'Ontology Data Model', type: 'NON_ANALYTICAL', maxScore: 100, scoringMethod: 'judge' } },
    ],
    'evt-003': [
      { primaryKey: 'ch-004', properties: { challengeId: 'ch-004', eventId: 'evt-003', title: 'Route Optimisation Model', type: 'ANALYTICAL', maxScore: 100, scoringMethod: 'automated' } },
    ],
  },
};
