"use strict";
/**
 * AdvisorStatus - Visual status tracking system
 * Shows who's active, who's waiting, who's blocked
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorStatusTracker = exports.StatusLabel = exports.StatusEmoji = void 0;
exports.StatusEmoji = {
    idle: '🟢',
    reviewing: '🟡',
    waiting_for_input: '⚪',
    blocked: '🔴'
};
exports.StatusLabel = {
    idle: 'Available',
    reviewing: 'Reviewing',
    waiting_for_input: 'Waiting',
    blocked: 'Blocked'
};
class AdvisorStatusTracker {
    constructor() {
        this.statuses = new Map();
    }
    /**
     * Set an advisor's status
     */
    setStatus(advisorId, status, context, waitingOn) {
        this.statuses.set(advisorId, {
            advisorId,
            status,
            since: new Date(),
            context,
            waitingOn
        });
    }
    /**
     * Get an advisor's current status
     */
    getStatus(advisorId) {
        return this.statuses.get(advisorId);
    }
    /**
     * Get all statuses
     */
    getAllStatuses() {
        return Array.from(this.statuses.values());
    }
    /**
     * Get active advisors (reviewing status)
     */
    getActive() {
        return this.getAllStatuses().filter(s => s.status === 'reviewing');
    }
    /**
     * Get waiting advisors
     */
    getWaiting() {
        return this.getAllStatuses().filter(s => s.status === 'waiting_for_input');
    }
    /**
     * Get blocked advisors
     */
    getBlocked() {
        return this.getAllStatuses().filter(s => s.status === 'blocked');
    }
    /**
     * Format status as visual string
     */
    formatStatus(status) {
        const emoji = exports.StatusEmoji[status.status];
        const label = exports.StatusLabel[status.status];
        const context = status.context ? ` — ${status.context}` : '';
        const waiting = status.waitingOn ? ` (waiting on: ${status.waitingOn})` : '';
        return `${emoji} ${label}${context}${waiting}`;
    }
    /**
     * Get visual status board
     */
    getStatusBoard(advisorNames) {
        const lines = ['📊 Advisor Status Board\n'];
        // Active first
        const active = this.getActive();
        if (active.length > 0) {
            lines.push('🟡 Actively Working:');
            for (const status of active) {
                const name = advisorNames.get(status.advisorId) || status.advisorId;
                lines.push(`  ${name}: ${status.context || 'Reviewing'}`);
            }
            lines.push('');
        }
        // Waiting
        const waiting = this.getWaiting();
        if (waiting.length > 0) {
            lines.push('⚪ Waiting for Input:');
            for (const status of waiting) {
                const name = advisorNames.get(status.advisorId) || status.advisorId;
                lines.push(`  ${name}: ${status.waitingOn || 'Waiting'}`);
            }
            lines.push('');
        }
        // Blocked
        const blocked = this.getBlocked();
        if (blocked.length > 0) {
            lines.push('🔴 Blocked:');
            for (const status of blocked) {
                const name = advisorNames.get(status.advisorId) || status.advisorId;
                lines.push(`  ${name}: ${status.context || 'Blocked'}`);
            }
            lines.push('');
        }
        // Available
        const available = this.getAllStatuses()
            .filter(s => s.status === 'idle')
            .map(s => advisorNames.get(s.advisorId) || s.advisorId);
        if (available.length > 0) {
            lines.push(`🟢 Available: ${available.join(', ')}`);
        }
        return lines.join('\n');
    }
    /**
     * Auto-update status based on project context
     */
    autoUpdateFromProject(project, advisorIds) {
        const now = new Date();
        for (const advisorId of advisorIds) {
            const currentStatus = this.statuses.get(advisorId);
            // Check if advisor was recently consulted
            const wasConsulted = project.recentDecisions.some(d => d.advisorsConsulted.includes(advisorId));
            // Check if advisor is blocked
            const isBlocked = project.currentBlocker &&
                wasConsulted &&
                currentStatus?.status !== 'blocked';
            if (isBlocked) {
                this.setStatus(advisorId, 'blocked', project.currentBlocker?.description);
            }
            else if (wasConsulted && !currentStatus) {
                // Newly consulted advisors become reviewing
                this.setStatus(advisorId, 'reviewing');
            }
            else if (!currentStatus) {
                // Default to idle
                this.setStatus(advisorId, 'idle');
            }
        }
    }
}
exports.AdvisorStatusTracker = AdvisorStatusTracker;
exports.default = AdvisorStatusTracker;
