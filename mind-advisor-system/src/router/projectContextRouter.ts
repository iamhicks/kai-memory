import {
  Advisor,
  ProjectContext,
  RoutingDecision,
  CreationParams,
  ResearchResult
} from '../types/advisors';
import { coreAdvisors } from '../data/coreAdvisors';
import { extractMentions } from '../utils/mentions';
import { extractKeywords } from '../utils/text';
import { buildDirectPrompt, buildMultiPrompt, buildSynthesisPrompt } from './prompts';
import { findBestTemplate } from '../templates/advisorTemplates';
import { buildTemplateAdvisorPreview } from '../services/templateAdvisorFactory';

export type ConnectivityMode = 'standalone' | 'hybrid' | 'connected';

export interface RouterOptions {
  connectivityMode?: ConnectivityMode;
  customAdvisors?: Advisor[];
  researchProvider?: (params: CreationParams) => Promise<ResearchResult>;
}

const DEFAULT_OPTIONS: Required<Omit<RouterOptions, 'researchProvider'>> = {
  connectivityMode: 'standalone',
  customAdvisors: []
};

export class ProjectContextRouter {
  private project: ProjectContext;
  private advisors: Map<string, Advisor>;
  private options: Required<Omit<RouterOptions, 'researchProvider'>>;
  private researchProvider?: (params: CreationParams) => Promise<ResearchResult>;

  constructor(project: ProjectContext, opts: RouterOptions = {}) {
    this.project = project;
    this.options = { ...DEFAULT_OPTIONS, ...opts };
    this.researchProvider = opts.researchProvider;

    const advisorEntries = [...coreAdvisors, ...(opts.customAdvisors ?? [])];
    this.advisors = new Map(advisorEntries.map((advisor) => [advisor.id, advisor]));
  }

  async route(input: string): Promise<RoutingDecision> {
    const trimmed = input.trim();

    // 1. Check for @mentions
    const mentionNames = extractMentions(trimmed);
    if (mentionNames.length > 0) {
      return this.handleMentions(mentionNames, trimmed);
    }

    // 2. Check for advisor creation intent
    if (isCreationIntent(trimmed)) {
      return this.handleCreationIntent(trimmed);
    }

    // 3. Default: project synthesis
    return this.handleSynthesis(trimmed);
  }

  private handleMentions(mentionNames: string[], input: string): RoutingDecision {
    const resolved = mentionNames
      .map((mention) => resolveAdvisor(mention, this.advisors))
      .filter(Boolean) as Advisor[];

    if (resolved.length === 0) {
      return this.handleSynthesis(input);
    }

    if (resolved.length === 1) {
      return {
        type: 'direct',
        advisors: [resolved[0].id],
        prompt: buildDirectPrompt(resolved[0], this.project, input)
      };
    }

    return {
      type: 'multi',
      advisors: resolved.map((advisor) => advisor.id),
      prompt: buildMultiPrompt(resolved, input)
    };
  }

  private handleSynthesis(input: string): RoutingDecision {
    const available = Array.from(this.advisors.values());
    const relevant = pickTopAdvisors(input, available);

    return {
      type: 'synthesis',
      advisors: relevant.map((advisor) => advisor.id),
      prompt: buildSynthesisPrompt(this.project, relevant, input)
    };
  }

  private async handleCreationIntent(input: string): Promise<RoutingDecision> {
    const params = extractCreationParams(input);

    if (this.options.connectivityMode === 'standalone' || !this.researchProvider) {
      const template = findBestTemplate(params.role);
      const preview = buildTemplateAdvisorPreview(template, params);
      return {
        type: 'create_advisor',
        templateId: template.id,
        creationPreview: preview
      };
    }

    const research = await this.researchProvider(params);
    const preview = buildTemplateAdvisorPreview(
      {
        ...findBestTemplate(params.role),
        frameworks: research.frameworks,
        commonMistakes: research.mistakes,
        signatureQuestions: research.questions
      },
      params,
      research
    );

    return {
      type: 'create_advisor',
      creationPreview: preview
    };
  }
}

function resolveAdvisor(mention: string, advisors: Map<string, Advisor>): Advisor | undefined {
  // exact id match
  const direct = advisors.get(mention);
  if (direct) return direct;

  // emoji match
  for (const advisor of advisors.values()) {
    if (advisor.emoji === mention) return advisor;
  }

  // fuzzy name match
  return Array.from(advisors.values()).find((advisor) =>
    advisor.name.toLowerCase().includes(mention.toLowerCase())
  );
}

function pickTopAdvisors(input: string, advisors: Advisor[], limit = 3): Advisor[] {
  const keywords = extractKeywords(input);

  const scored = advisors.map((advisor) => {
    let score = 0;

    advisor.metadata.specialties.forEach((specialty) => {
      if (keywords.includes(specialty.toLowerCase())) {
        score += 3;
      }
    });

    advisor.metadata.frameworks?.forEach((framework) => {
      if (input.toLowerCase().includes(framework.toLowerCase())) {
        score += 2;
      }
    });

    if (advisor.category === 'core' && score === 0) {
      score = 1; // default relevance
    }

    return { advisor, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ advisor }) => advisor);
}

function isCreationIntent(input: string): boolean {
  const creationKeywords = ['create advisor', 'new advisor', 'custom advisor', 'hire advisor'];
  return creationKeywords.some((keyword) => input.toLowerCase().includes(keyword));
}

function extractCreationParams(input: string): CreationParams {
  const toneMatch = input.match(/tone\s*:?\s*(challenging|empathetic|pragmatic|analytical|creative)/i);
  const tone = (toneMatch?.[1].toLowerCase() as CreationParams['tone']) ?? 'analytical';

  const roleMatch = input.match(/advisor(?: for)? ([^.]+?)(?: with| focus| tone|$)/i);
  const focusMatch = input.match(/focus(?: on)? ([^.]+)$/i);

  return {
    role: roleMatch?.[1].trim() || 'generalist operator',
    focus: focusMatch?.[1].trim() || 'helping the founder make better decisions',
    tone
  };
}
