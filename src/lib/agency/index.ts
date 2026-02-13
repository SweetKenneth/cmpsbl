/**
 * Agency Production — Unified exports for all production-ready agency features
 * v9.1.0 ARCHITECT Epoch — Cognitive Agent Infrastructure
 */

// Core types
export * from './agencyTypes';
export * from './agencyTasks';
export * from './agencyCommands';

// Task execution
export * from './taskExecutor';

// Execution Layer (Web Actuator, Verification, Credit Assignment)
export * from '@/lib/execution';

// Skills & Primitives
export * from './skills/agentSkills';
export * from './skills/taskPrimitives';
export * from './specialtySkills';

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

// Agent Personalities & Avatars
export * from './agentPersonalities';

// Gamification System
export * from './gamification';

// Task Templates & Workflows
export * from './taskTemplates';

// Smart Suggestions
export * from './smartSuggestions';

// Utilities
export * from './slugUtils';

// === NEW: Agency Economics + Dream Learning ===
export * from './economy';
export * from './skills';
export * from './presets';
export * from './substrate';
