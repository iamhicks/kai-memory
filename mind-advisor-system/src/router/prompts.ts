import { Advisor, ProjectContext, ResearchResult, CreationParams } from '../types/advisors';
import { daysSince } from '../utils/time';
import { AdvisorTemplate } from '../templates/advisorTemplates';

const formatAdvisor = (advisor: Advisor) =>
  `- ${advisor.emoji} ${advisor.name}: ${advisor.metadata.specialties.join(', ')} (tone: ${advisor.metadata.tone})`;

export function buildSynthesisPrompt(
  project: ProjectContext,
  advisors: Advisor[],
  userInput: string
): string {
  const advisorList = advisors.map(formatAdvisor).join('\n');
  const recentDecisions = project.recentDecisions
    .slice(-3)
    .map((decision) => `- ${decision.topic}: ${decision.decision}`)
    .join('\n') || 'None logged yet.';

  return `You are the Project Team for "${project.name}".

Most relevant team members for this question:
${advisorList}

Project context:
- Phase: ${project.phase}
- Days since last ship: ${daysSince(project.lastShipDate)}
- Current velocity: ${project.velocity.tasksPerWeek} tasks/week
- Current blocker: ${project.currentBlocker?.description ?? 'None'}

Recent decisions:
${recentDecisions}

User question: "${userInput}"

Provide a synthesized response that:
1. Answers the question directly
2. References specific advisor viewpoints
3. Surfaces tensions or trade-offs
4. Recommends one concrete next action
5. Ends with a follow-up question to maintain momentum

Speak as a cohesive team, not separate voices.`;
}

export function buildDirectPrompt(
  advisor: Advisor,
  project: ProjectContext,
  userInput: string
): string {
  return `${advisor.systemPrompt}

RELATIONSHIP CONTEXT:
- Working together on: "${project.name}"
- Project phase: ${project.phase}
- Interactions so far: ${advisor.progression.interactionCount}
- Current stage: ${advisor.progression.currentStage}

Recent notes:
${advisor.progression.relationshipNotes.slice(-5).join('\n') || 'None yet.'}

USER INPUT:
"${userInput}"

Respond in your characteristic voice. Include a catchphrase only if it fits naturally.`;
}

export function buildMultiPrompt(
  advisors: Advisor[],
  userInput: string
): string {
  const lineItems = advisors
    .map(
      (advisor) =>
        `${advisor.emoji} ${advisor.name}: ${advisor.metadata.specialties.join(', ')} | Tone: ${advisor.metadata.tone}`
    )
    .join('\n');

  return `This is a roundtable discussion with:
${lineItems}

Question: "${userInput}"

Format:
1. Provide each advisor's perspective labeled with their emoji/name
2. Summarize "The Team Consensus"
3. Offer one next action and one follow-up question
`;
}

export function buildTemplateCreationPrompt(
  templateName: string,
  params: CreationParams,
  template: AdvisorTemplate
): string {
  return `Create a custom advisor using the ${templateName} archetype.

ROLE: ${params.role}
FOCUS: ${params.focus}
TONE: ${params.tone}
PREFERRED EMOJI: ${params.preferredEmoji ?? 'Choose one that fits'}

ARCHETYPE DESCRIPTION:
${template.basePrompt}

FRAMEWORKS TO INCLUDE:
${template.frameworks.join(', ')}

COMMON MISTAKES TO WATCH:
${template.commonMistakes.join(', ')}

Generate:
1. Advisor name + emoji
2. System prompt (voice, role, patterns, catchphrases) tailored to ${params.role}
3. 5 critical questions this advisor always asks
4. Top pitfalls they guard against
5. Example interaction showing how they engage this user
`;
}

export function buildResearchBasedPrompt(
  params: CreationParams,
  research: ResearchResult
): string {
  return `Create a complete advisor persona for:
ROLE: ${params.role}
FOCUS: ${params.focus}
TONE: ${params.tone}

Use these research insights:
Frameworks: ${research.frameworks.join(', ')}
Common mistakes: ${research.mistakes.join(', ')}
Key metrics: ${research.metrics.join(', ')}
Essential questions: ${research.questions.join(', ')}
Concepts / trends: ${research.concepts.join(', ')}

Generate:
- Advisor name + emoji
- Voice + role definition referencing research
- 5 catchphrases
- Relationship progression (Interview → Veteran)
- 3 example interactions in different situations
`;
}
