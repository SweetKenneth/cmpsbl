/**
 * ENCODE Orchestration Layer
 * Bidirectional Conversation Lane, Execution Lock, Audit Mode,
 * Architecture Contract, Rolling Buffer, Surgical Patch, Role Enforcement,
 * Resilience Baseline, and CLI endpoint.
 *
 * Governs all ENCODE execution: no code generation without architecture
 * snapshot + user approval.
 */

import { emit } from '../events';
import { log } from '@/lib/system/log';
import { SYSTEM_MODULES } from '@/lib/codeagent/encoded/system-manifest';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ROLE DEFINITIONS (hardcoded, non-overridable)
// ═══════════════════════════════════════════════════════════════════════════════

export const ROLES = {
  USER: {
    id: 'user',
    label: 'Strategic Authority',
    permissions: ['approve', 'reject', 'direct', 'audit', 'rollback'],
    restrictions: [],
  },
  DECODE: {
    id: 'decode',
    label: 'Intent Translator',
    permissions: ['parse_intent', 'relay_messages', 'clarify', 'route_to_encode'],
    restrictions: ['cannot_generate_code', 'cannot_mutate_architecture'],
  },
  ENCODE: {
    id: 'encode',
    label: 'Execution Engine',
    permissions: ['analyze', 'generate_code', 'patch', 'refactor', 'guard'],
    restrictions: [
      'cannot_redefine_architecture',
      'cannot_import_without_approval',
      'cannot_expose_service_keys',
      'must_follow_project_conventions',
      'cannot_execute_without_approval',
    ],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CONVERSATION RELAY LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export type ConversationRole = 'user' | 'decode' | 'encode' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  version?: number;
}

export interface EncodeReviewResponse {
  analysis_summary: string;
  architectural_understanding: Record<string, string>;
  clarification_questions: string[];
  execution_plan?: string[];
  risk_assessment?: string;
}

export interface ConversationState {
  sessionId: string;
  messages: ConversationMessage[];
  execution_locked: boolean;
  user_approval: boolean;
  architecture_map_exists: boolean;
  current_mode: EncodeMode;
  version_counter: number;
}

let conversationState: ConversationState = createFreshSession();

function createFreshSession(): ConversationState {
  return {
    sessionId: `session-${Date.now()}`,
    messages: [],
    execution_locked: true,
    user_approval: false,
    architecture_map_exists: false,
    current_mode: 'conversation',
    version_counter: 0,
  };
}

/** Append message — never mutate prior messages */
export function appendMessage(role: ConversationRole, content: string, metadata?: Record<string, unknown>): ConversationMessage {
  const msg: ConversationMessage = {
    id: `msg-${Date.now()}-${conversationState.version_counter}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    metadata,
    version: ++conversationState.version_counter,
  };
  conversationState.messages.push(msg);
  emit({ module: 'encode', event_type: 'conversation_message', outcome: 'succeeded', data: { role, messageId: msg.id } });
  return msg;
}

/** USER → DECODE → ENCODE review request flow */
export function submitIntentForReview(userIntent: string): EncodeReviewResponse {
  // Step 1: User message recorded
  appendMessage('user', userIntent);

  // Step 2: DECODE parses intent
  appendMessage('decode', `[DECODE] Parsed intent: "${userIntent}"`);

  // Step 3: ENCODE must respond with analysis, NOT code
  const review = encodeReviewRequest(userIntent);
  appendMessage('encode', JSON.stringify(review), { type: 'review_response' });

  return review;
}

function encodeReviewRequest(intent: string): EncodeReviewResponse {
  const snapshot = getArchitectureSnapshot();

  return {
    analysis_summary: `ENCODE received intent: "${intent.slice(0, 120)}". Analyzing against ${snapshot ? 'existing' : 'MISSING'} architecture snapshot.`,
    architectural_understanding: snapshot
      ? {
          modules_known: `${snapshot.module_registry.length} modules`,
          dependencies_mapped: `${snapshot.dependency_graph.length} edges`,
          utilities_indexed: `${snapshot.shared_utilities_index.length} utils`,
        }
      : { status: 'NO_SNAPSHOT — audit_mode required before execution' },
    clarification_questions: snapshot
      ? [`Confirm target module for: "${intent.slice(0, 60)}"?`, 'Any constraints on this change?']
      : ['Architecture snapshot missing. Run `audit` first?', `Confirm intent: "${intent.slice(0, 60)}"?`],
    risk_assessment: snapshot ? 'low' : 'high — no architecture context',
  };
}

/** User approves ENCODE to proceed */
export function approveExecution(): { success: boolean; reason?: string } {
  if (!conversationState.architecture_map_exists) {
    return { success: false, reason: 'EXECUTION_LOCK_ACTIVE: Architecture snapshot required. Run audit first.' };
  }
  conversationState.user_approval = true;
  conversationState.execution_locked = false;
  appendMessage('system', '[SYSTEM] Execution approved. ENCODE may now generate code.');
  emit({ module: 'encode', event_type: 'execution_unlocked', outcome: 'succeeded', data: {} });
  return { success: true };
}

/** Reset session safely */
export function clearSession(): ConversationState {
  const old = conversationState;
  conversationState = createFreshSession();
  emit({ module: 'encode', event_type: 'session_cleared', outcome: 'succeeded', data: { previousMessages: old.messages.length } });
  return conversationState;
}

export function getConversationState(): ConversationState {
  return { ...conversationState, messages: [...conversationState.messages] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EXECUTION LOCK PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExecutionContext {
  architecture_map_exists: boolean;
  user_approval: boolean;
}

export function checkExecutionLock(context?: Partial<ExecutionContext>): { allowed: boolean; error?: string } {
  const ctx: ExecutionContext = {
    architecture_map_exists: context?.architecture_map_exists ?? conversationState.architecture_map_exists,
    user_approval: context?.user_approval ?? conversationState.user_approval,
  };

  if (!ctx.architecture_map_exists) {
    return { allowed: false, error: 'EXECUTION_LOCK_ACTIVE: context.architecture_map_exists === false. Run audit mode first.' };
  }
  if (!ctx.user_approval) {
    return { allowed: false, error: 'EXECUTION_LOCK_ACTIVE: context.user_approval === false. User must approve execution.' };
  }
  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. REPO + DB AUDIT MODE (Architecture Snapshot)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArchitectureSnapshot {
  snapshot_id: string;
  created_at: string;
  module_registry: ModuleRegistryEntry[];
  dependency_graph: DependencyEdge[];
  shared_utilities_index: UtilityEntry[];
  escalation_paths: EscalationPath[];
  db_schema_summary?: string;
}

export interface ModuleRegistryEntry {
  name: string;
  path: string;
  layer: 'core' | 'module' | 'hook' | 'component' | 'page' | 'edge' | 'lib';
  exports: string[];
  imports_from: string[];
  line_count?: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'event' | 'memory' | 'pipeline';
}

export interface UtilityEntry {
  name: string;
  path: string;
  used_by: string[];
}

export interface EscalationPath {
  module: string;
  escalates_to: string;
  condition: string;
}

let architectureSnapshot: ArchitectureSnapshot | null = null;

/** Run audit mode — scans known substrate structure and produces snapshot */
export function runAuditMode(): ArchitectureSnapshot {
  const snapshotId = `snapshot-${Date.now()}`;

  // Build module registry from system manifest (single source of truth)
  const moduleRegistry: ModuleRegistryEntry[] = Object.values(SYSTEM_MODULES).map(mod => ({
    name: mod.id,
    path: mod.corePath,
    layer: mod.layer === 'kernel' ? 'core'
      : mod.layer === 'mesh-overlay' ? 'lib'
      : 'module',
    exports: [],
    imports_from: mod.dependencies,
  }));

  // Build dependency graph from manifest
  const dependencyGraph: DependencyEdge[] = [];
  for (const mod of Object.values(SYSTEM_MODULES)) {
    for (const dep of mod.dependencies) {
      dependencyGraph.push({ from: mod.id, to: dep, type: 'import' });
    }
    for (const dependent of mod.dependents) {
      dependencyGraph.push({ from: mod.id, to: dependent, type: 'pipeline' });
    }
  }

  // Shared utilities
  const sharedUtilities: UtilityEntry[] = [
    { name: 'emit', path: 'src/lib/substrate/events/emit.ts', used_by: ['encode', 'decode', 'brain-transfer', 'intent-mesh', 'governance'] },
    { name: 'memoryCore', path: 'src/lib/substrate/memory-core.ts', used_by: ['encode', 'decode', 'brain-transfer', 'memory'] },
    { name: 'log', path: 'src/lib/system/log.ts', used_by: ['encode', 'decode', 'governance', 'defense'] },
    { name: 'engineBus', path: 'src/lib/substrate/engine-bus.ts', used_by: ['substrate-core', 'intent-mesh'] },
    { name: 'correlationId', path: 'src/lib/substrate/correlation-id/', used_by: ['encode', 'audit', 'relay'] },
  ];

  // Escalation paths
  const escalationPaths: EscalationPath[] = [
    { module: 'encode', escalates_to: 'governance', condition: 'destructive_change_detected' },
    { module: 'encode', escalates_to: 'defense', condition: 'injection_pattern_detected' },
    { module: 'decode', escalates_to: 'encode', condition: 'code_generation_required' },
    { module: 'sandbox', escalates_to: 'encode', condition: 'test_failure_needs_repair' },
    { module: 'intent-mesh', escalates_to: 'governance', condition: 'unknown_intent_pattern' },
  ];

  architectureSnapshot = {
    snapshot_id: snapshotId,
    created_at: new Date().toISOString(),
    module_registry: moduleRegistry,
    dependency_graph: dependencyGraph,
    shared_utilities_index: sharedUtilities,
    escalation_paths: escalationPaths,
  };

  // Mark architecture as available — partially unlocks execution
  conversationState.architecture_map_exists = true;

  appendMessage('system', `[AUDIT] Architecture snapshot ${snapshotId} created: ${moduleRegistry.length} modules, ${dependencyGraph.length} deps, ${sharedUtilities.length} utils, ${escalationPaths.length} escalation paths.`);
  emit({ module: 'encode', event_type: 'audit_completed', outcome: 'succeeded', data: { snapshotId, modules: moduleRegistry.length } });

  log.info('encode', `Audit mode complete: snapshot ${snapshotId}`);
  return architectureSnapshot;
}

export function getArchitectureSnapshot(): ArchitectureSnapshot | null {
  return architectureSnapshot;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ARCHITECTURAL AWARENESS CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArchitecturalAwarenessContract {
  target_module: string;
  target_path: string;
  called_by: string[];
  calls_to: string[];
  expected_inputs: Record<string, string>;
  expected_outputs: Record<string, string>;
  failure_states: string[];
  logging_strategy: string;
  escalation_route: string;
}

export function buildAwarenessContract(targetModule: string): ArchitecturalAwarenessContract | { error: string } {
  const snapshot = getArchitectureSnapshot();
  if (!snapshot) {
    return { error: 'ARCHITECTURE_INCOMPLETE: No snapshot. Run audit first.' };
  }

  const module = snapshot.module_registry.find(m => m.name === targetModule);
  if (!module) {
    return { error: `ARCHITECTURE_INCOMPLETE: Module "${targetModule}" not found in registry.` };
  }

  const calledBy = snapshot.dependency_graph
    .filter(e => e.to === targetModule)
    .map(e => e.from);

  const callsTo = snapshot.dependency_graph
    .filter(e => e.from === targetModule)
    .map(e => e.to);

  const escalation = snapshot.escalation_paths.find(p => p.module === targetModule);

  return {
    target_module: module.name,
    target_path: module.path,
    called_by: calledBy,
    calls_to: callsTo,
    expected_inputs: { intent: 'string', context: 'object' },
    expected_outputs: { result: 'EncodeTaskResult', artifacts: 'EncodeArtifact[]' },
    failure_states: ['EXECUTION_LOCK_ACTIVE', 'ARCHITECTURE_INCOMPLETE', 'PRODUCTION_STANDARD_FAIL'],
    logging_strategy: `emit({ module: '${targetModule}', event_type: '...', outcome: '...' })`,
    escalation_route: escalation ? `${escalation.escalates_to} on ${escalation.condition}` : 'none',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ENCODE MODES
// ═══════════════════════════════════════════════════════════════════════════════

export type EncodeMode = 'conversation' | 'audit' | 'surgical' | 'generation';

export function setEncodeMode(mode: EncodeMode): { success: boolean; error?: string } {
  if (mode === 'generation') {
    const lock = checkExecutionLock();
    if (!lock.allowed) return { success: false, error: lock.error };
  }
  conversationState.current_mode = mode;
  appendMessage('system', `[MODE] ENCODE mode set to: ${mode}`);
  return { success: true };
}

export function getEncodeMode(): EncodeMode {
  return conversationState.current_mode;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SURGICAL PATCH MODE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SurgicalPatch {
  id: string;
  file: string;
  function_name?: string;
  operation: 'modify' | 'add_guard' | 'refactor' | 'delete';
  before: string;
  after: string;
  rationale: string;
  applied: boolean;
  created_at: string;
  version: number;
}

const patchHistory: SurgicalPatch[] = [];

export function createSurgicalPatch(params: {
  file: string;
  function_name?: string;
  operation: SurgicalPatch['operation'];
  before: string;
  after: string;
  rationale: string;
}): SurgicalPatch | { error: string } {
  // Enforce surgical mode
  if (conversationState.current_mode !== 'surgical') {
    return { error: 'Must be in surgical mode. Call setEncodeMode("surgical") first.' };
  }

  // Enforce execution lock
  const lock = checkExecutionLock();
  if (!lock.allowed) return { error: lock.error! };

  // Validate file path against safe paths
  const SAFE_PREFIXES = ['src/', 'supabase/functions/', 'docs/', 'public/'];
  const BLOCKED = ['src/integrations/supabase/client.ts', 'src/integrations/supabase/types.ts', '.env', 'supabase/config.toml', 'node_modules/'];
  if (params.file.startsWith('/') || params.file.includes('..') || params.file.includes('//')) {
    return { error: `Dangerous path pattern in: "${params.file}"` };
  }
  if (!SAFE_PREFIXES.some(p => params.file.startsWith(p))) {
    return { error: `Unsafe path: "${params.file}" — must start with: ${SAFE_PREFIXES.join(', ')}` };
  }
  if (BLOCKED.some(b => params.file.startsWith(b))) {
    return { error: `Blocked path: "${params.file}" — this file is read-only` };
  }

  const patch: SurgicalPatch = {
    id: `patch-${Date.now()}-${patchHistory.length}`,
    ...params,
    applied: false,
    created_at: new Date().toISOString(),
    version: conversationState.version_counter,
  };

  patchHistory.push(patch);
  appendMessage('encode', `[PATCH] Created ${patch.id}: ${params.operation} on ${params.file}${params.function_name ? `::${params.function_name}` : ''}`, { patchId: patch.id });

  emit({ module: 'encode', event_type: 'surgical_patch_created', outcome: 'succeeded', data: { patchId: patch.id, operation: params.operation } });
  return patch;
}

export function applyPatch(patchId: string): { success: boolean; error?: string } {
  const patch = patchHistory.find(p => p.id === patchId);
  if (!patch) return { success: false, error: `Patch ${patchId} not found` };
  if (patch.applied) return { success: false, error: `Patch ${patchId} already applied` };

  const lock = checkExecutionLock();
  if (!lock.allowed) return { success: false, error: lock.error };

  patch.applied = true;
  appendMessage('system', `[APPLY] Patch ${patchId} applied to ${patch.file}`);
  emit({ module: 'encode', event_type: 'patch_applied', outcome: 'succeeded', data: { patchId } });
  return { success: true };
}

export function getPatchHistory(): SurgicalPatch[] {
  return [...patchHistory];
}

export function getPatchDiff(patchId: string): { before: string; after: string; rationale: string } | null {
  const patch = patchHistory.find(p => p.id === patchId);
  if (!patch) return null;
  return { before: patch.before, after: patch.after, rationale: patch.rationale };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. RESILIENCE BASELINE (production standard enforcement)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResilienceCheck {
  has_input_validation: boolean;
  has_structured_error_codes: boolean;
  has_retry_wrapper: boolean;
  has_timeout_guard: boolean;
  has_correlation_id: boolean;
  has_deterministic_repair: boolean;
}

export function validateResilienceBaseline(codeSnippet: string): { pass: boolean; missing: string[] } {
  const checks: Record<keyof ResilienceCheck, RegExp> = {
    has_input_validation: /z\.(string|object|number|array)|typeof\s+\w+\s*[!=]==|validate|schema/i,
    has_structured_error_codes: /error_code|ErrorCode|EXECUTION_LOCK|ARCHITECTURE_INCOMPLETE|code:\s*['"][A-Z_]+['"]/,
    has_retry_wrapper: /retry|withRetry|retryable|attempt.*<|maxRetries/i,
    has_timeout_guard: /timeout|AbortController|signal|setTimeout.*reject|timeoutMs/i,
    has_correlation_id: /correlationId|correlation_id|traceId|trace_id|requestId/i,
    has_deterministic_repair: /repair|deterministicRepair|fallback|graceful/i,
  };

  const missing: string[] = [];
  for (const [key, regex] of Object.entries(checks)) {
    if (!regex.test(codeSnippet)) {
      missing.push(key);
    }
  }

  return { pass: missing.length === 0, missing };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. LIGHTWEIGHT CLI MODE
// ═══════════════════════════════════════════════════════════════════════════════

export type CLICommand = 'scan' | 'patch' | 'refactor' | 'guard' | 'audit' | 'status' | 'approve' | 'clear' | 'history' | 'diff';

export interface CLIResult {
  success: boolean;
  command: string;
  data: unknown;
  apply_patch?: boolean;
  error?: string;
}

export function executeEncodeCLI(command: CLICommand, target?: string): CLIResult {
  switch (command) {
    case 'scan':
    case 'audit': {
      const snapshot = runAuditMode();
      return { success: true, command, data: { snapshot_id: snapshot.snapshot_id, modules: snapshot.module_registry.length, dependencies: snapshot.dependency_graph.length, utilities: snapshot.shared_utilities_index.length, escalation_paths: snapshot.escalation_paths.length } };
    }

    case 'status': {
      const state = getConversationState();
      return {
        success: true,
        command,
        data: {
          session: state.sessionId,
          mode: state.current_mode,
          execution_locked: state.execution_locked,
          user_approval: state.user_approval,
          architecture_exists: state.architecture_map_exists,
          messages: state.messages.length,
          patches: patchHistory.length,
          snapshot: architectureSnapshot?.snapshot_id ?? 'none',
        },
      };
    }

    case 'approve': {
      const result = approveExecution();
      return { success: result.success, command, data: result, error: result.reason };
    }

    case 'clear': {
      clearSession();
      return { success: true, command, data: { message: 'Session cleared' } };
    }

    case 'history': {
      return { success: true, command, data: { patches: patchHistory.map(p => ({ id: p.id, file: p.file, operation: p.operation, applied: p.applied, created_at: p.created_at })) } };
    }

    case 'diff': {
      if (!target) return { success: false, command, data: null, error: 'Usage: diff <patch_id>' };
      const diff = getPatchDiff(target);
      if (!diff) return { success: false, command, data: null, error: `Patch ${target} not found` };
      return { success: true, command, data: diff };
    }

    case 'patch': {
      if (!target) return { success: false, command, data: null, error: 'Usage: patch <file_path>' };
      const contract = buildAwarenessContract('encode');
      return { success: true, command, data: { target_file: target, contract, mode: 'surgical', apply_patch: false }, apply_patch: false };
    }

    case 'refactor': {
      if (!target) return { success: false, command, data: null, error: 'Usage: refactor <file_path>' };
      const contract = buildAwarenessContract('encode');
      return { success: true, command, data: { target_file: target, contract, mode: 'surgical', apply_patch: false }, apply_patch: false };
    }

    case 'guard': {
      if (!target) return { success: false, command, data: null, error: 'Usage: guard <function_name>' };
      return { success: true, command, data: { target_function: target, guard_type: 'input_validation + error_boundary', apply_patch: false }, apply_patch: false };
    }

    default:
      return { success: false, command: command as string, data: null, error: `Unknown command: ${command}. Available: scan, patch, refactor, guard, audit, status, approve, clear, history, diff` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export {
  conversationState as _conversationState, // internal access for testing
};
