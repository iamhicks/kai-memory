"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectContextRouter = void 0;
const coreAdvisors_1 = require("../data/coreAdvisors");
const mentions_1 = require("../utils/mentions");
const text_1 = require("../utils/text");
const prompts_1 = require("./prompts");
const advisorTemplates_1 = require("../templates/advisorTemplates");
const templateAdvisorFactory_1 = require("../services/templateAdvisorFactory");
const DEFAULT_OPTIONS = {
    connectivityMode: 'standalone',
    customAdvisors: []
};
class ProjectContextRouter {
    constructor(project, opts = {}) {
        this.project = project;
        this.options = { ...DEFAULT_OPTIONS, ...opts };
        this.researchProvider = opts.researchProvider;
        const advisorEntries = [...coreAdvisors_1.coreAdvisors, ...(opts.customAdvisors ?? [])];
        this.advisors = new Map(advisorEntries.map((advisor) => [advisor.id, advisor]));
    }
    async route(input) {
        const trimmed = input.trim();
        // 1. Check for @mentions
        const mentionNames = (0, mentions_1.extractMentions)(trimmed);
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
    handleMentions(mentionNames, input) {
        const resolved = mentionNames
            .map((mention) => resolveAdvisor(mention, this.advisors))
            .filter(Boolean);
        if (resolved.length === 0) {
            return this.handleSynthesis(input);
        }
        if (resolved.length === 1) {
            return {
                type: 'direct',
                advisors: [resolved[0].id],
                prompt: (0, prompts_1.buildDirectPrompt)(resolved[0], this.project, input)
            };
        }
        return {
            type: 'multi',
            advisors: resolved.map((advisor) => advisor.id),
            prompt: (0, prompts_1.buildMultiPrompt)(resolved, input)
        };
    }
    handleSynthesis(input) {
        const available = Array.from(this.advisors.values());
        const relevant = pickTopAdvisors(input, available);
        return {
            type: 'synthesis',
            advisors: relevant.map((advisor) => advisor.id),
            prompt: (0, prompts_1.buildSynthesisPrompt)(this.project, relevant, input)
        };
    }
    async handleCreationIntent(input) {
        const params = extractCreationParams(input);
        if (this.options.connectivityMode === 'standalone' || !this.researchProvider) {
            const template = (0, advisorTemplates_1.findBestTemplate)(params.role);
            const preview = (0, templateAdvisorFactory_1.buildTemplateAdvisorPreview)(template, params);
            return {
                type: 'create_advisor',
                templateId: template.id,
                creationPreview: preview
            };
        }
        const research = await this.researchProvider(params);
        const preview = (0, templateAdvisorFactory_1.buildTemplateAdvisorPreview)({
            ...(0, advisorTemplates_1.findBestTemplate)(params.role),
            frameworks: research.frameworks,
            commonMistakes: research.mistakes,
            signatureQuestions: research.questions
        }, params, research);
        return {
            type: 'create_advisor',
            creationPreview: preview
        };
    }
}
exports.ProjectContextRouter = ProjectContextRouter;
function resolveAdvisor(mention, advisors) {
    // exact id match
    const direct = advisors.get(mention);
    if (direct)
        return direct;
    // emoji match
    for (const advisor of advisors.values()) {
        if (advisor.emoji === mention)
            return advisor;
    }
    // fuzzy name match
    return Array.from(advisors.values()).find((advisor) => advisor.name.toLowerCase().includes(mention.toLowerCase()));
}
function pickTopAdvisors(input, advisors, limit = 3) {
    const keywords = (0, text_1.extractKeywords)(input);
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
function isCreationIntent(input) {
    const creationKeywords = ['create advisor', 'new advisor', 'custom advisor', 'hire advisor'];
    return creationKeywords.some((keyword) => input.toLowerCase().includes(keyword));
}
function extractCreationParams(input) {
    const toneMatch = input.match(/tone\s*:?\s*(challenging|empathetic|pragmatic|analytical|creative)/i);
    const tone = toneMatch?.[1].toLowerCase() ?? 'analytical';
    const roleMatch = input.match(/advisor(?: for)? ([^.]+?)(?: with| focus| tone|$)/i);
    const focusMatch = input.match(/focus(?: on)? ([^.]+)$/i);
    return {
        role: roleMatch?.[1].trim() || 'generalist operator',
        focus: focusMatch?.[1].trim() || 'helping the founder make better decisions',
        tone
    };
}
