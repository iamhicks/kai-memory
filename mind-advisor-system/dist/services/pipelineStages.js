"use strict";
/**
 * PipelineStages - Project stage management
 * Chaos → Validate → Plan → Build → Review → Ship → Celebrate
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineManager = exports.PIPELINE_STAGES = void 0;
exports.PIPELINE_STAGES = [
    {
        id: 'chaos',
        name: 'Chaos',
        emoji: '🌪️',
        description: 'Ideas flying everywhere, no clear direction',
        exitCriteria: [
            'Core problem identified',
            'Target user defined',
            'Initial hypothesis formed'
        ],
        suggestedAdvisors: ['strategist', 'mindset_coach']
    },
    {
        id: 'validate',
        name: 'Validate',
        emoji: '🔍',
        description: 'Testing assumptions with real users',
        exitCriteria: [
            '10+ user interviews completed',
            'Problem validated with evidence',
            'Solution desirability confirmed'
        ],
        suggestedAdvisors: ['strategist', 'product_lead']
    },
    {
        id: 'plan',
        name: 'Plan',
        emoji: '🗺️',
        description: 'Mapping the path forward',
        exitCriteria: [
            'MVP scope defined',
            'Success metrics established',
            'Timeline committed'
        ],
        suggestedAdvisors: ['strategist', 'product_lead']
    },
    {
        id: 'build',
        name: 'Build',
        emoji: '🛠️',
        description: 'Heads down, shipping features',
        exitCriteria: [
            'Core features functional',
            'Basic user flow complete',
            'Internal testing passed'
        ],
        suggestedAdvisors: ['product_lead', 'mindset_coach']
    },
    {
        id: 'review',
        name: 'Review',
        emoji: '👀',
        description: 'Quality check before release',
        exitCriteria: [
            'Bug count below threshold',
            'Performance acceptable',
            'Documentation complete'
        ],
        suggestedAdvisors: ['product_lead']
    },
    {
        id: 'ship',
        name: 'Ship',
        emoji: '🚀',
        description: 'Release to the world',
        exitCriteria: [
            'Deployed to production',
            'Monitoring active',
            'Users can access'
        ],
        suggestedAdvisors: ['product_lead', 'strategist']
    },
    {
        id: 'celebrate',
        name: 'Celebrate',
        emoji: '🎉',
        description: 'Acknowledge the win, then plan next',
        exitCriteria: [
            'Team acknowledged success',
            'Lessons documented',
            'Next phase initiated'
        ],
        suggestedAdvisors: ['mindset_coach', 'strategist']
    }
];
class PipelineManager {
    constructor(initialStage = 'chaos') {
        this.stageConfig = new Map(exports.PIPELINE_STAGES.map(s => [s.id, s]));
        this.currentStage = 'chaos';
        this.history = [];
        this.stageCounts = new Map();
        this.currentStage = initialStage;
        this.recordEntry(initialStage);
    }
    /**
     * Get current stage config
     */
    getCurrentStage() {
        return this.stageConfig.get(this.currentStage);
    }
    /**
     * Get stage config by ID
     */
    getStage(stageId) {
        return this.stageConfig.get(stageId);
    }
    /**
     * Get all stages
     */
    getAllStages() {
        return exports.PIPELINE_STAGES;
    }
    /**
     * Move to next stage
     */
    advance(notes) {
        const stages = ['chaos', 'validate', 'plan', 'build', 'review', 'ship', 'celebrate'];
        const currentIndex = stages.indexOf(this.currentStage);
        if (currentIndex < stages.length - 1) {
            this.recordExit();
            this.currentStage = stages[currentIndex + 1];
            this.recordEntry(this.currentStage, notes);
        }
        return this.getCurrentStage();
    }
    /**
     * Move to specific stage
     */
    moveTo(stageId, notes) {
        if (stageId !== this.currentStage) {
            this.recordExit();
            this.currentStage = stageId;
            this.recordEntry(stageId, notes);
        }
        return this.getCurrentStage();
    }
    /**
     * Record stage entry
     */
    recordEntry(stage, notes) {
        this.history.push({
            stage,
            enteredAt: new Date(),
            notes
        });
        const count = this.stageCounts.get(stage) || 0;
        this.stageCounts.set(stage, count + 1);
    }
    /**
     * Record stage exit
     */
    recordExit() {
        const current = this.history[this.history.length - 1];
        if (current && !current.exitedAt) {
            current.exitedAt = new Date();
        }
    }
    /**
     * Get suggested advisors for current stage
     */
    getSuggestedAdvisors() {
        return this.getCurrentStage().suggestedAdvisors;
    }
    /**
     * Get suggested advisors for any stage
     */
    getStageAdvisors(stageId) {
        return this.stageConfig.get(stageId)?.suggestedAdvisors || [];
    }
    /**
     * Get stage visit counts
     */
    getStageCounts() {
        const counts = {};
        for (const stage of exports.PIPELINE_STAGES) {
            counts[stage.id] = this.stageCounts.get(stage.id) || 0;
        }
        return counts;
    }
    /**
     * Get time in current stage
     */
    getTimeInCurrentStage() {
        const current = this.history[this.history.length - 1];
        if (!current)
            return 0;
        return Date.now() - current.enteredAt.getTime();
    }
    /**
     * Format time duration
     */
    formatDuration(ms) {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0)
            return `${days}d ${hours}h`;
        return `${hours}h`;
    }
    /**
     * Render pipeline visualization
     */
    renderPipeline() {
        const stages = exports.PIPELINE_STAGES;
        const currentIndex = stages.findIndex(s => s.id === this.currentStage);
        const lines = ['📋 Project Pipeline\n'];
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            const marker = isCurrent ? '▶️' : isPast ? '✅' : '○';
            const name = `${stage.emoji} ${stage.name}`;
            const time = isCurrent ? ` (${this.formatDuration(this.getTimeInCurrentStage())})` : '';
            lines.push(`${marker} ${name}${time}`);
        }
        // Add suggested advisors for current stage
        const current = this.getCurrentStage();
        lines.push('\n💡 Suggested Advisors:');
        lines.push(`   ${current.suggestedAdvisors.map(a => `@${a}`).join(', ')}`);
        return lines.join('\n');
    }
    /**
     * Render stage counts
     */
    renderStageCounts() {
        const counts = this.getStageCounts();
        const lines = ['📊 Stage Visit Counts\n'];
        for (const stage of exports.PIPELINE_STAGES) {
            const count = counts[stage.id];
            const bar = '█'.repeat(count);
            lines.push(`${stage.emoji} ${stage.name.padEnd(10)} ${bar} ${count}`);
        }
        return lines.join('\n');
    }
    /**
     * Check if exit criteria are met (manual check, returns checklist)
     */
    checkExitCriteria() {
        const stage = this.getCurrentStage();
        const lines = [`✅ ${stage.name} Exit Criteria:\n`];
        for (const criterion of stage.exitCriteria) {
            lines.push(`  ☐ ${criterion}`);
        }
        return lines.join('\n');
    }
}
exports.PipelineManager = PipelineManager;
exports.default = PipelineManager;
