export type AdvisorCategory = 'core' | 'specialist' | 'custom';
export type AdvisorTone = 'challenging' | 'empathetic' | 'pragmatic' | 'analytical' | 'creative';
export type ProjectPhase = 'chaos' | 'clarity' | 'action' | 'shipped';

export interface AdvisorMetadata {
  specialties: string[];
  tone: AdvisorTone;
  frameworks?: string[];
  catchphrases: string[];
}

export interface ProgressionThresholds {
  interview: number;
  ramping: number;
  trusted: number;
  veteran: number;
}

export type RelationshipStage = 'interview' | 'ramping' | 'trusted' | 'veteran';

export interface ProgressionConfig {
  thresholds: ProgressionThresholds;
  currentStage: RelationshipStage;
  interactionCount: number;
  relationshipNotes: string[];
}

export interface Advisor {
  id: string;
  name: string;
  emoji: string;
  category: AdvisorCategory;
  unlocked: boolean;
  createdBy?: string;
  systemPrompt: string;
  metadata: AdvisorMetadata;
  progression: ProgressionConfig;
}

export interface Decision {
  id: string;
  timestamp: Date;
  topic: string;
  decision: string;
  reasoning: string;
  advisorsConsulted: string[];
}

export interface Blocker {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  since: Date;
}

export interface VelocityMetrics {
  tasksPerWeek: number;
  shipsLast30Days: number;
}

export interface ProjectContext {
  id: string;
  name: string;
  userId: string;
  hiredAdvisors: string[];
  phase: ProjectPhase;
  createdAt: Date;
  shippedAt?: Date;
  recentDecisions: Decision[];
  currentBlocker?: Blocker;
  velocity: VelocityMetrics;
  lastShipDate?: Date;
}

export interface Message {
  role: 'user' | 'assistant' | 'advisor';
  content: string;
  timestamp: Date;
}

export type RoutingDecisionType = 'synthesis' | 'direct' | 'multi' | 'create_advisor' | 'execute_task';

export interface RoutingDecision {
  type: RoutingDecisionType;
  advisors?: string[];
  prompt?: string;
  task?: TaskDefinition;
  templateId?: string;
  creationPreview?: string;
}

export interface TaskDefinition {
  intent: string;
  parameters: Record<string, string>;
}

export interface CreationParams {
  role: string;
  focus: string;
  tone: AdvisorTone;
  preferredEmoji?: string;
}

export interface ResearchResult {
  frameworks: string[];
  mistakes: string[];
  metrics: string[];
  questions: string[];
  concepts: string[];
  trends?: string[];
}
