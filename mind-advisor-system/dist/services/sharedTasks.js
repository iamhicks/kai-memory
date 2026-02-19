"use strict";
/**
 * SharedTasks - AI and user task management
 * AI can create tasks with 🤖 badge
 * Triggers: blocker detected, opportunity, accountability nudge
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedTaskManager = void 0;
class SharedTaskManager {
    constructor() {
        this.tasks = new Map();
        this.idCounter = 0;
    }
    /**
     * Generate unique task ID
     */
    generateId() {
        this.idCounter++;
        return `task-${Date.now()}-${this.idCounter}`;
    }
    /**
     * Create a task (user or AI)
     */
    createTask(params) {
        const task = {
            id: this.generateId(),
            title: params.title,
            description: params.description,
            createdBy: params.createdBy,
            createdAt: new Date(),
            priority: params.priority || 'medium',
            status: 'open',
            trigger: params.trigger,
            assignedTo: params.assignedTo,
            relatedBlocker: params.relatedBlocker,
            relatedDecision: params.relatedDecision,
            dueDate: params.dueDate
        };
        this.tasks.set(task.id, task);
        return task;
    }
    /**
     * AI creates a task with 🤖 badge
     */
    createAITask(trigger, title, description, options) {
        return this.createTask({
            title,
            description,
            createdBy: 'ai',
            trigger,
            priority: options?.priority || this.inferPriority(trigger),
            assignedTo: options?.assignedTo,
            relatedBlocker: options?.relatedBlocker,
            relatedDecision: options?.relatedDecision
        });
    }
    /**
     * Infer priority from trigger type
     */
    inferPriority(trigger) {
        switch (trigger) {
            case 'blocker_detected':
                return 'high';
            case 'accountability_nudge':
                return 'medium';
            case 'opportunity':
                return 'medium';
            default:
                return 'low';
        }
    }
    /**
     * Auto-create tasks based on project context
     */
    autoCreateTasks(context) {
        const newTasks = [];
        // Blocker detected → create unblock task
        if (context.currentBlocker) {
            const existing = this.getByBlocker(context.currentBlocker.id);
            if (existing.length === 0) {
                newTasks.push(this.createAITask('blocker_detected', `Unblock: ${context.currentBlocker.description.substring(0, 50)}...`, `A ${context.currentBlocker.severity} severity blocker needs resolution.`, {
                    priority: context.currentBlocker.severity === 'high' ? 'urgent' : 'high',
                    relatedBlocker: context.currentBlocker.id,
                    assignedTo: ['strategist', 'product_lead']
                }));
            }
        }
        // Low velocity → accountability nudge
        if (context.velocity && context.velocity.shipsLast30Days < 2) {
            const recentNudges = this.getRecentByTrigger('accountability_nudge', 7);
            if (recentNudges.length === 0) {
                newTasks.push(this.createAITask('accountability_nudge', 'Shipping velocity check-in', `Only ${context.velocity.shipsLast30Days} ships in last 30 days. What's blocking forward progress?`, {
                    priority: 'medium',
                    assignedTo: ['product_lead', 'mindset_coach']
                }));
            }
        }
        // Opportunities from recent decisions
        const lastDecision = context.recentDecisions[context.recentDecisions.length - 1];
        if (lastDecision) {
            const recentOpportunities = this.getRecentByTrigger('opportunity', 3);
            if (recentOpportunities.length === 0) {
                newTasks.push(this.createAITask('opportunity', `Follow up: ${lastDecision.topic}`, `Decision was made. Are there implementation opportunities to capture?`, {
                    priority: 'medium',
                    relatedDecision: lastDecision.id,
                    assignedTo: ['strategist']
                }));
            }
        }
        return newTasks;
    }
    /**
     * Get tasks by blocker
     */
    getByBlocker(blockerId) {
        return this.getAll().filter(t => t.relatedBlocker === blockerId);
    }
    /**
     * Get recent tasks by trigger
     */
    getRecentByTrigger(trigger, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.getAll().filter(t => t.trigger === trigger && t.createdAt >= cutoff);
    }
    /**
     * Get task by ID
     */
    getTask(id) {
        return this.tasks.get(id);
    }
    /**
     * Get all tasks
     */
    getAll() {
        return Array.from(this.tasks.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /**
     * Get tasks by status
     */
    getByStatus(status) {
        return this.getAll().filter(t => t.status === status);
    }
    /**
     * Get tasks by priority
     */
    getByPriority(priority) {
        return this.getAll().filter(t => t.priority === priority);
    }
    /**
     * Get AI-created tasks
     */
    getAICreated() {
        return this.getAll().filter(t => t.createdBy === 'ai');
    }
    /**
     * Update task status
     */
    updateStatus(id, status) {
        const task = this.tasks.get(id);
        if (task) {
            task.status = status;
            if (status === 'done') {
                task.completedAt = new Date();
            }
        }
        return task;
    }
    /**
     * Complete a task
     */
    complete(id) {
        return this.updateStatus(id, 'done');
    }
    /**
     * Get summary stats
     */
    getSummary() {
        const all = this.getAll();
        const now = new Date();
        return {
            total: all.length,
            open: all.filter(t => t.status === 'open').length,
            inProgress: all.filter(t => t.status === 'in_progress').length,
            blocked: all.filter(t => t.status === 'blocked').length,
            done: all.filter(t => t.status === 'done').length,
            aiCreated: all.filter(t => t.createdBy === 'ai').length,
            overdue: all.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length
        };
    }
    /**
     * Format task for display
     */
    formatTask(task, advisorNames) {
        const aiBadge = task.createdBy === 'ai' ? '🤖 ' : '';
        const priorityEmoji = {
            low: '🔹',
            medium: '🔸',
            high: '🔺',
            urgent: '🚨'
        };
        const statusEmoji = {
            open: '⭕',
            in_progress: '🔄',
            blocked: '🚫',
            done: '✅'
        };
        const lines = [
            `${aiBadge}${priorityEmoji[task.priority]} ${task.title}`,
            `   ${statusEmoji[task.status]} ${task.status} | Created: ${task.createdAt.toLocaleDateString()}`
        ];
        if (task.assignedTo && task.assignedTo.length > 0) {
            const names = task.assignedTo.map(id => advisorNames?.get(id) || `@${id}`);
            lines.push(`   Assigned: ${names.join(', ')}`);
        }
        if (task.trigger) {
            lines.push(`   Trigger: ${task.trigger}`);
        }
        return lines.join('\n');
    }
    /**
     * Render task board
     */
    renderBoard(advisorNames) {
        const summary = this.getSummary();
        const lines = [
            '📋 Shared Task Board\n',
            `Stats: ${summary.total} total | ${summary.open} open | ${summary.inProgress} in progress | ${summary.aiCreated} AI-created\n`
        ];
        // Group by status
        const byStatus = {
            open: this.getByStatus('open'),
            in_progress: this.getByStatus('in_progress'),
            blocked: this.getByStatus('blocked'),
            done: this.getByStatus('done')
        };
        const statusLabels = {
            open: '📥 Open',
            in_progress: '🔄 In Progress',
            blocked: '🚫 Blocked',
            done: '✅ Done'
        };
        for (const [status, tasks] of Object.entries(byStatus)) {
            if (tasks.length > 0) {
                lines.push(statusLabels[status] + ':');
                for (const task of tasks.slice(0, 5)) { // Show top 5
                    lines.push('  ' + this.formatTask(task, advisorNames).split('\n')[0]);
                }
                if (tasks.length > 5) {
                    lines.push(`  ... and ${tasks.length - 5} more`);
                }
                lines.push('');
            }
        }
        return lines.join('\n');
    }
}
exports.SharedTaskManager = SharedTaskManager;
exports.default = SharedTaskManager;
