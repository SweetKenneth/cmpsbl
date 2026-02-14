/**
 * Intent Mesh — Module Exports
 * v10.0.0 — Emergent Module Intelligence Layer
 * 
 * The Intent Mesh enables autonomous cross-module capability discovery
 * and composition. Modules broadcast intents, the mesh routes to capable
 * resolvers, and every interaction produces an auditable receipt.
 * 
 * Kill switch: mesh.toggle (off by default)
 * Dashboard: /os → Observe → Mesh Activity
 * Terminal: mesh.status, mesh.log, mesh.toggle, mesh.broadcast
 */

// Types
export type {
  MeshResolver,
  MeshIntent,
  ResolverResponse,
  MeshResolution,
  MeshReceipt,
  MeshStatus,
} from './types';

// Manifest — the capability "phone book"
export {
  MESH_MANIFEST,
  getModuleResolvers,
  getResolversByDomain,
  getResolversByOutput,
  getMeshModules,
} from './manifest';

// Router — intent broadcasting and resolution
export {
  broadcastIntent,
  getRecentReceipts,
  getMeshStats,
} from './router';

// Toggle — kill switch
export {
  useMeshToggle,
  isMeshEnabled,
  enableMesh,
  disableMesh,
} from './toggle';

// Pipelines — crystallized mesh configurations
export {
  getSavedPipelines,
  savePipelineFromReceipt,
  runSavedPipeline,
  deletePipeline,
  type MeshSavedPipeline,
} from './pipelines';
