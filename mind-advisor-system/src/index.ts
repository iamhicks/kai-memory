// Core types
export * from './types/advisors';

// Data
export { coreAdvisors, getAdvisorById } from './data/coreAdvisors';
export { sampleProject } from './data/sampleProject';

// Router
export { 
  ProjectContextRouter, 
  RouterOptions, 
  ConnectivityMode 
} from './router/projectContextRouter';
export * from './router/prompts';

// Services
export { SearchService } from './services/memorySearch';
export { 
  AdvisorStatusTracker, 
  StatusEmoji, 
  StatusLabel 
} from './services/advisorStatus';
export { 
  PipelineManager, 
  PIPELINE_STAGES 
} from './services/pipelineStages';
export { 
  SharedTaskManager 
} from './services/sharedTasks';

// Templates & Utils
export * from './templates/advisorTemplates';
export * from './utils/mentions';
export * from './utils/text';
export * from './utils/time';
