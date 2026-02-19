/**
 * AdvisorStatus - Visual status tracking system
 * Shows who's active, who's waiting, who's blocked
 */

export type AdvisorStatusType = 
  | 'idle'           // 🟢 Available
  | 'reviewing'      // 🟡 Actively working
  | 'waiting_for_input'  // ⚪ Waiting for user
  | 'blocked';       // 🔴 Blocked

export interface AdvisorStatus {
  advisorId: string;
  status: AdvisorStatusType;
  since: Date;
  context?: string;     // What they're working on
  waitingOn?: string;   // What they're waiting for
  estimatedDone?: Date;
}

export const StatusEmoji: Record<AdvisorStatusType, string> = {
  idle: '🟢',
  reviewing: '🟡',
  waiting_for_input: '⚪',
  blocked: '🔴'
};

export const StatusLabel: Record<AdvisorStatusType, string> = {
  idle: 'Available',
  reviewing: 'Reviewing',
  waiting_for_input: 'Waiting',
  blocked: 'Blocked'
};

export class AdvisorStatusTracker {
  private statuses: Map<string, AdvisorStatus> = new Map();

  /**
   * Set an advisor's status
   */
  setStatus(
    advisorId: string, 
    status: AdvisorStatusType, 
    context?: string,
    waitingOn?: string
  ): void {
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
  getStatus(advisorId: string): AdvisorStatus | undefined {
    return this.statuses.get(advisorId);
  }

  /**
   * Get all statuses
   */
  getAllStatuses(): AdvisorStatus[] {
    return Array.from(this.statuses.values());
  }

  /**
   * Get active advisors (reviewing status)
   */
  getActive(): AdvisorStatus[] {
    return this.getAllStatuses().filter(s => s.status === 'reviewing');
  }

  /**
   * Get waiting advisors
   */
  getWaiting(): AdvisorStatus[] {
    return this.getAllStatuses().filter(s => s.status === 'waiting_for_input');
  }

  /**
   * Get blocked advisors
   */
  getBlocked(): AdvisorStatus[] {
    return this.getAllStatuses().filter(s => s.status === 'blocked');
  }

  /**
   * Format status as visual string
   */
  formatStatus(status: AdvisorStatus): string {
    const emoji = StatusEmoji[status.status];
    const label = StatusLabel[status.status];
    const context = status.context ? ` — ${status.context}` : '';
    const waiting = status.waitingOn ? ` (waiting on: ${status.waitingOn})` : '';
    return `${emoji} ${label}${context}${waiting}`;
  }

  /**
   * Get visual status board
   */
  getStatusBoard(advisorNames: Map<string, string>): string {
    const lines: string[] = ['📊 Advisor Status Board\n'];
    
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
  autoUpdateFromProject(project: {
    currentBlocker?: { description: string };
    recentDecisions: Array<{ advisorsConsulted: string[] }>;
  }, advisorIds: string[]): void {
    const now = new Date();
    
    for (const advisorId of advisorIds) {
      const currentStatus = this.statuses.get(advisorId);
      
      // Check if advisor was recently consulted
      const wasConsulted = project.recentDecisions.some(
        d => d.advisorsConsulted.includes(advisorId)
      );

      // Check if advisor is blocked
      const isBlocked = project.currentBlocker && 
        wasConsulted && 
        currentStatus?.status !== 'blocked';

      if (isBlocked) {
        this.setStatus(advisorId, 'blocked', project.currentBlocker?.description);
      } else if (wasConsulted && !currentStatus) {
        // Newly consulted advisors become reviewing
        this.setStatus(advisorId, 'reviewing');
      } else if (!currentStatus) {
        // Default to idle
        this.setStatus(advisorId, 'idle');
      }
    }
  }
}

export default AdvisorStatusTracker;
