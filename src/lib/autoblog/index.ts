/**
 * AutoBlog Primitive v3.0.0
 * Governed, autonomous, self-learning blog automation with intelligent content
 */

// Core orchestration
export { getAutoblogStatus, autoblogPlan, autoblogDraft, autoblogVerify, autoblogPublish, autoblogPublishAll, autoblogAbort } from './orchestrator';
export { getAutoblogSettings, updateAutoblogSettings, getAutoblogQueue, getAutoblogRuns } from './store';

// Circuit breaker & healing
export { checkAutoblogCircuit, tripAutoblogCircuit, resetAutoblogCircuit } from './circuit';
export { healAutoblog } from './heal';

// Autonomous modes
export { startAutonomousMode, stopAutonomousMode, getAutonomousState } from './autonomous-engine';
export { startCLMMode, stopCLMMode, getCLMState, getCLMStatus } from './clm-engine';
export { startFullAuto, stopAuto, getAutoStatus, getAutoState } from './autonomous-controller';

// Content generation
export { seedAutoblogPosts, quickSeed } from './seeder';
export { publishDraft, publishAllReady, assessContent } from './publisher';
export { generateInsightfulContent, pickOptimalTopic, getTopicInventory, DEEP_TOPICS } from './content-intelligence';

// Types
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun, AutonomousState } from './types';

export const AUTOBLOG_VERSION = '3.0.0';
