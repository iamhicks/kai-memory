import { Advisor, ProjectContext, RoutingDecision } from '../types/advisors';

export function simulateResponse(
  decision: RoutingDecision,
  project: ProjectContext,
  advisorLookup: Map<string, Advisor>,
  userInput: string
): string {
  switch (decision.type) {
    case 'direct': {
      const advisor = advisorLookup.get(decision.advisors?.[0] ?? '');
      if (!advisor) return 'No advisor found.';
      return mockDirect(advisor, userInput);
    }
    case 'multi': {
      const advisors = (decision.advisors ?? [])
        .map((id) => advisorLookup.get(id))
        .filter(Boolean) as Advisor[];
      return mockMulti(advisors, userInput);
    }
    case 'create_advisor':
      return decision.creationPreview ?? 'Generated advisor preview unavailable.';
    case 'synthesis':
    default: {
      const advisors = (decision.advisors ?? [])
        .map((id) => advisorLookup.get(id))
        .filter(Boolean) as Advisor[];
      return mockSynthesis(advisors, userInput, project);
    }
  }
}

function mockSynthesis(advisors: Advisor[], question: string, project: ProjectContext): string {
  const perspectives = advisors
    .map((advisor) => `${advisor.emoji} ${advisor.name}: ${advisor.metadata.specialties[0]} lens`)
    .join('\n');

  return [`[Team Synthesis for "${question}"]`, perspectives, buildNextAction(project.phase)].join('\n\n');
}

function mockDirect(advisor: Advisor, question: string): string {
  return `${advisor.emoji} ${advisor.name} says: ${advisor.metadata.catchphrases[0] ?? 'Focus.'} Question received: "${question}".`;
}

function mockMulti(advisors: Advisor[], question: string): string {
  const lines = advisors.map((advisor) => `${advisor.emoji} ${advisor.name}: ${advisor.metadata.catchphrases[0]}`);
  return [`Roundtable on "${question}"`, ...lines, 'Consensus: pick a lead and move.'].join('\n');
}

function buildNextAction(phase: ProjectContext['phase']): string {
  switch (phase) {
    case 'chaos':
      return 'Next action: pick one focus metric for the week.';
    case 'clarity':
      return 'Next action: synthesize research into a single-page brief.';
    case 'action':
      return 'Next action: commit to shipping one thin slice in 48 hours.';
    case 'shipped':
    default:
      return 'Next action: capture post-ship learnings and plan the next experiment.';
  }
}
