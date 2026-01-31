/**
 * AutoBlog Primitive v2.0.0
 * Governed, autonomous, self-learning blog automation
 */

export { getAutoblogStatus, autoblogPlan, autoblogDraft, autoblogVerify, autoblogPublish, autoblogAbort } from './orchestrator';
export { getAutoblogSettings, updateAutoblogSettings, getAutoblogQueue, getAutoblogRuns } from './store';
export { checkAutoblogCircuit, tripAutoblogCircuit, resetAutoblogCircuit } from './circuit';
export { healAutoblog } from './heal';
export { startAutonomousMode, stopAutonomousMode, getAutonomousState } from './autonomous-engine';
export { seedAutoblogPosts } from './seeder';
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun, AutonomousState } from './types';

export const AUTOBLOG_VERSION = '2.0.0';
