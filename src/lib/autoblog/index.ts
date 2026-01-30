/**
 * AutoBlog Primitive v1.0.0
 * Governed, bounded, observable blog automation
 * 
 * Safe defaults: enabled=false, dry_run=true
 * Modes: governed | shadow | off
 */

export { getAutoblogStatus, autoblogPlan, autoblogDraft, autoblogVerify, autoblogPublish, autoblogAbort } from './orchestrator';
export { getAutoblogSettings, updateAutoblogSettings, getAutoblogQueue, getAutoblogRuns } from './store';
export { checkAutoblogCircuit, tripAutoblogCircuit, resetAutoblogCircuit } from './circuit';
export { healAutoblog } from './heal';
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun } from './types';

export const AUTOBLOG_VERSION = '1.0.0';
