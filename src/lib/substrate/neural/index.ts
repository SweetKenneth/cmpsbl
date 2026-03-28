/**
 * BRAIN Neural Substrate Layer — Module Index
 * Exports all neural components and the unified maintenance manager
 */

// Embedding Engine
export {
  embeddingEngine,
  EMBEDDING_DIM,
  MODEL_VERSION,
  ACTIVATION_THRESHOLD as EMBEDDING_ACTIVATION_THRESHOLD,
  type EmbeddingResult,
  type EmbeddingEngineState,
} from './embedding-engine';

// Vector Similarity Index (Neural Recall)
export {
  vectorIndex,
  type NeuralRecallResult,
  type VectorIndexState,
} from './vector-index';

// Confidence Classifier (Confidence Gate)
export {
  confidenceClassifier,
  CLASSIFIER_ACTIVATION_THRESHOLD,
  type ConfidencePrediction,
  type ConfidenceRecommendation,
  type ClassifierState,
} from './confidence-classifier';

// Drift Detector
export {
  driftDetector,
  DRIFT_ACTIVATION_THRESHOLD,
  type DriftSignal,
  type DriftDetectorState,
} from './drift-detector';

// Automated Maintenance Manager
export {
  maintenanceManager,
  type MaintenanceManagerState,
  type MaintenanceTask,
} from './maintenance-manager';

// ═══════════════════════════════════════════════════════════════
// Convenience Functions
// ═══════════════════════════════════════════════════════════════

import { embeddingEngine } from './embedding-engine';
import { vectorIndex } from './vector-index';
import { confidenceClassifier } from './confidence-classifier';
import { driftDetector } from './drift-detector';
import { maintenanceManager } from './maintenance-manager';
import { startAutoTiering, stopAutoTiering } from '../brain-auto-tiering';
import { getMetaEngine } from '@/core/ascension/selfHealingConsensusEngine';

// ═══ Self-Healing Consensus — persistent background tick ══════════════════
let consensusInterval: ReturnType<typeof setInterval> | null = null;

function startConsensusEngine(): void {
  if (consensusInterval) return;
  const engine = getMetaEngine();
  // Tick every 5 s — lightweight in-memory cycle, zero API calls
  consensusInterval = setInterval(() => {
    try { engine.tick(); } catch { /* non-blocking */ }
  }, 5_000);
  console.log('[NeuralSubstrate] Self-Healing Consensus Engine → ALWAYS-ON (5 s tick)');
}

function stopConsensusEngine(): void {
  if (consensusInterval) {
    clearInterval(consensusInterval);
    consensusInterval = null;
  }
}

/**
 * Initialize the entire Neural Substrate Layer
 * Call once on application boot (e.g., in SubstrateProvider)
 */
export async function initializeNeuralSubstrate(): Promise<void> {
  await maintenanceManager.start();
  // Start automatic memory tier enforcement (every 15 min)
  startAutoTiering();
  // Start Self-Healing Consensus Meta-Engine — persistent background service
  startConsensusEngine();
}

/**
 * Shutdown the Neural Substrate Layer
 */
export function shutdownNeuralSubstrate(): void {
  maintenanceManager.stop();
  stopAutoTiering();
  stopConsensusEngine();
}

/**
 * Get unified neural substrate health status
 */
export function getNeuralSubstrateStatus() {
  const engine = getMetaEngine();
  const snap = engine.getSnapshot();
  return {
    embedding: embeddingEngine.getState(),
    vectorIndex: vectorIndex.getState(),
    classifier: confidenceClassifier.getState(),
    driftDetector: driftDetector.getState(),
    maintenance: maintenanceManager.getState(),
    consensus: {
      active: !snap.killed,
      leader: snap.leaderId,
      nodes: snap.nodes.length,
      heals: snap.totalHeals,
      failures: snap.totalFailures,
      uptimeMs: snap.uptime,
    },
  };
}

/**
 * Neural Recall — primary API for context augmentation
 * Use this from NEXUS router for semantic memory retrieval
 */
export async function neuralRecall(query: string, topK: number = 5) {
  return vectorIndex.neuralRecall(query, topK);
}

/**
 * Confidence Gate — predict action success probability
 * Use this from NEXUS router before autonomous execution
 */
export function confidenceGate(
  actionText: string,
  context?: Record<string, number>
) {
  return confidenceClassifier.predict(actionText, context);
}
