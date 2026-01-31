/**
 * AutoBlog Primitive v2.1.0
 * Governed, autonomous, self-learning blog automation with CLM
 */

export { getAutoblogStatus, autoblogPlan, autoblogDraft, autoblogVerify, autoblogPublish, autoblogPublishAll, autoblogAbort } from './orchestrator';
export { getAutoblogSettings, updateAutoblogSettings, getAutoblogQueue, getAutoblogRuns } from './store';
export { checkAutoblogCircuit, tripAutoblogCircuit, resetAutoblogCircuit } from './circuit';
export { healAutoblog } from './heal';
export { startAutonomousMode, stopAutonomousMode, getAutonomousState } from './autonomous-engine';
export { seedAutoblogPosts } from './seeder';
export { publishDraft, publishAllReady, assessContent } from './publisher';
export { startCLMMode, stopCLMMode, getCLMState, getCLMStatus } from './clm-engine';
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun, AutonomousState } from './types';

export const AUTOBLOG_VERSION = '2.1.0';
