import { ProjectContext } from '../types/advisors';

export const sampleProject: ProjectContext = {
  id: 'project_clarity',
  name: 'Launch Accountability OS',
  userId: 'founder_01',
  hiredAdvisors: ['strategist', 'product_lead', 'mindset_coach'],
  phase: 'action',
  createdAt: new Date('2026-01-15T09:00:00Z'),
  recentDecisions: [
    {
      id: 'decision-1',
      timestamp: new Date('2026-02-10T10:00:00Z'),
      topic: 'MVP Scope',
      decision: 'Launch with advisor chat + accountability cadence only',
      reasoning: 'Faster validation of positioning',
      advisorsConsulted: ['strategist', 'product_lead']
    },
    {
      id: 'decision-2',
      timestamp: new Date('2026-02-14T12:00:00Z'),
      topic: 'Pricing',
      decision: '$299 standalone, upsell to OpenClaw for $29/mo',
      reasoning: 'Matches offline-first promise with premium tier',
      advisorsConsulted: ['strategist']
    },
    {
      id: 'decision-3',
      timestamp: new Date('2026-02-17T17:00:00Z'),
      topic: 'Launch Blocker',
      decision: 'Defer custom advisor research API until v1.1',
      reasoning: 'Ship template system first',
      advisorsConsulted: ['product_lead']
    }
  ],
  currentBlocker: {
    id: 'blocker-1',
    description: 'Landing page hero copy still unresolved',
    severity: 'medium',
    since: new Date('2026-02-15T09:00:00Z')
  },
  velocity: {
    tasksPerWeek: 6,
    shipsLast30Days: 3
  },
  lastShipDate: new Date('2026-02-12T08:00:00Z')
};
