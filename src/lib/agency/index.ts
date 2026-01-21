/**
 * Agency Production — Unified exports for all production-ready agency features
 */

// Core types
export * from './agencyTypes';
export * from './agencyTasks';
export * from './agencyCommands';

// Task execution
export * from './taskExecutor';

// Skills & Primitives
export * from './skills/agentSkills';
export * from './skills/taskPrimitives';

// Free API Adapters
export * from './adapters/freeApiAdapters';

// Telemetry
export * from './telemetry/agencyTelemetry';
export { useAgencyTelemetry, useTaskArtifacts } from './hooks/useAgencyTelemetry';

// Leader Orchestration
export * from './orchestration/leaderOrchestrator';
export { useLeaderOrchestration } from './hooks/useLeaderOrchestration';

// Scheduling (recurring tasks)
export { useAgencyScheduling } from './useAgencyScheduling';
export type { ScheduledTask, CreateScheduleInput } from './useAgencyScheduling';

// Deliverables (exports, reports, emails)
export { useAgencyDeliverables } from './useAgencyDeliverables';
export type { TaskDeliverable, DeliverableFormat, ExportOptions } from './useAgencyDeliverables';

// Hybrid Dream Learning System
export * from './dream/hybridDreamSystem';
export {
  useLocalImprovements,
  useGlobalImprovements,
  useDreamConsent,
  useDreamCycleLogs,
  useDreamLearningMetrics,
} from './hooks/useHybridDream';

// Utilities
export * from './slugUtils';
