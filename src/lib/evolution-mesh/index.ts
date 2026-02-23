/**
 * Evolution Mesh — Safe Service Layer
 * All functions are explicitly invoked only. No side effects on import.
 * No intervals, no schedulers, no background loops.
 */

export { snapshotService } from './snapshot-service';
export { diffService } from './diff-service';
export { integrityService } from './integrity-service';
export { promotionService } from './promotion-service';
export { telemetryService } from './telemetry-service';
export { mutationEngine } from './mutation-engine';
