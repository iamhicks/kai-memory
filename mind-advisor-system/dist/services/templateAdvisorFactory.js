"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAdvisorFromTemplate = generateAdvisorFromTemplate;
exports.buildTemplateAdvisorPreview = buildTemplateAdvisorPreview;
let customCounter = 0;
const toneFallbacks = {
    challenging: 'challenging',
    empathetic: 'empathetic',
    pragmatic: 'pragmatic',
    analytical: 'analytical',
    creative: 'creative'
};
function generateAdvisorFromTemplate(template, params, research) {
    const id = `custom_${template.id}_${++customCounter}`;
    const name = buildAdvisorName(template, params);
    const metadataCatchphrases = buildCatchphrases(template, params, research);
    return {
        id,
        name,
        emoji: params.preferredEmoji ?? pickEmojiForTone(params.tone ?? template.defaultTone),
        category: 'custom',
        unlocked: true,
        createdBy: 'local_user',
        systemPrompt: buildSystemPrompt(template, params, research),
        metadata: {
            specialties: [params.role, params.focus],
            tone: params.tone ?? template.defaultTone,
            frameworks: research?.frameworks ?? template.frameworks,
            catchphrases: metadataCatchphrases
        },
        progression: {
            thresholds: {
                interview: 0,
                ramping: 3,
                trusted: 8,
                veteran: 20
            },
            currentStage: 'interview',
            interactionCount: 0,
            relationshipNotes: []
        }
    };
}
function buildTemplateAdvisorPreview(template, params, research) {
    const name = buildAdvisorName(template, params);
    const tone = params.tone ?? template.defaultTone;
    const catchphrases = buildCatchphrases(template, params, research).slice(0, 3).join('\n- ');
    return `✨ ${name} (${pickEmojiForTone(tone)})
Role: ${params.role}
Focus: ${params.focus}
Tone: ${tone}
Frameworks: ${(research?.frameworks ?? template.frameworks).join(', ')}
Guards against: ${(research?.mistakes ?? template.commonMistakes).join(', ')}
Signature questions:
- ${(research?.questions ?? template.signatureQuestions).slice(0, 3).join('\n- ')}
Catchphrases:
- ${catchphrases}`;
}
function buildAdvisorName(template, params) {
    const roleChunk = params.role
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .slice(0, 2)
        .join(' ');
    return `The ${roleChunk || template.name}`;
}
function buildSystemPrompt(template, params, research) {
    const tone = params.tone ?? template.defaultTone;
    const frameworks = research?.frameworks ?? template.frameworks;
    const mistakes = research?.mistakes ?? template.commonMistakes;
    const questions = research?.questions ?? template.signatureQuestions;
    return `You are ${buildAdvisorName(template, params)} — ${template.basePrompt}

YOUR VOICE:
- ${describeTone(tone)}
- Tailored to ${params.role} work focused on ${params.focus}

YOUR TOOLBOX:
- Frameworks: ${frameworks.join(', ')}
- Questions you obsess over: ${questions.join(', ')}
- Pitfalls you watch: ${mistakes.join(', ')}

MISSION:
Help the founder with ${params.focus} as it relates to ${params.role}.`;
}
function pickEmojiForTone(tone) {
    switch (toneFallbacks[tone]) {
        case 'challenging':
            return '⚔️';
        case 'empathetic':
            return '🌱';
        case 'pragmatic':
            return '🛠️';
        case 'analytical':
            return '📊';
        case 'creative':
        default:
            return '✨';
    }
}
function describeTone(tone) {
    switch (tone) {
        case 'challenging':
            return 'Direct, cuts through fluff, prioritizes hard truths.';
        case 'empathetic':
            return 'Warm, grounded, sees the human behind the task.';
        case 'pragmatic':
            return 'Action-biased, practical, allergic to theory without execution.';
        case 'analytical':
            return 'Data-first, pattern seeking, obsessed with signal.';
        case 'creative':
        default:
            return 'Imaginative, story-driven, hunts for differentiation.';
    }
}
function buildCatchphrases(template, params, research) {
    const base = template.signatureQuestions.map((q) => `"${q}?"`);
    const mistakes = research?.mistakes ?? template.commonMistakes;
    const extras = mistakes.map((mistake) => `"${capitalize(mistake)} — not on my watch."`);
    return [...new Set([...base, ...extras])];
}
const capitalize = (input) => input.charAt(0).toUpperCase() + input.slice(1);
