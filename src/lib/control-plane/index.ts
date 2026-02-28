/**
 * CONTROL PLANE — Architecture Boundary
 * 
 * The Control Plane is a first-class layer containing:
 *   INTEL    — Aggregation + explanation (Founder-only outputs)
 *   ENGINEER — Internal maintenance node (no user UI)
 *   DECODE   — Conversational service (feeds INTEL/ENGINEER)
 *   AUDIT    — Compliance trail service (feeds INTEL/ENGINEER)
 * 
 * Single "disable control plane" toggle gates all CP behavior.
 */

export * from './types';
export { intelAggregator } from './intel/aggregator';
export { engineerNode } from './engineer/maintenance';
export { clmTopicPipeline } from './clm/topic-pipeline';
export { getControlPlaneConfig, setControlPlaneConfig, isControlPlaneEnabled } from './config';
