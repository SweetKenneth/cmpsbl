/**
 * CMPSBL® Ascension Node System — Public API
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Central barrel export for the entire Ingest → Node → Chain system.
 *
 * © CMPSBL® — All rights reserved.
 */

// Primitive Extraction
export {
  extractPrimitives,
  buildPrimitiveHandler,
  type ExtractedPrimitive,
  type ExtractionResult,
  type ExtractionStats,
  type PrimitiveCategory,
} from './primitive-extractor';

// Node Registry
export {
  listNodes,
  getNode,
  extractAndAttachPrimitives,
  updateNode,
  deleteNode,
  recordRunParticipation,
  type AscensionNode,
  type NodeStatus,
  type NodeMode,
  type NodeListFilters,
  type NodeUpdatePayload,
} from './node-registry';

// Chain Injection
export {
  buildNodeEffect,
  injectNodeIntoChain,
  registerNodeEffect,
  getNodeEffect,
  clearNodeEffects,
  getRegisteredNodeCount,
  type InjectionResult,
  type ChainParticipation,
} from './chain-injection';

// Brain Learning Bridge
export {
  recordExtractionLearning,
  recordChainLearning,
  recordLifecycleEvent,
  getPatternInsights,
  getLearningHistory,
  type LearningEvent,
  type PatternFrequency,
} from './brain-learning-bridge';

// Audit Trail
export {
  logUpload,
  logExtraction,
  logNodeCreated,
  logChainParticipation,
  logStatusChange,
  logDeletion,
  getAuditTrail,
  type AuditEvent,
  type AuditEventType,
} from './ingest-audit';
