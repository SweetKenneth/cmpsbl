/**
 * Atlas Control Plane
 * Single-source-of-truth substrate interface
 * 
 * The Atlas provides:
 * - Unified registry for all 38 nodes across 12 sectors (CORE·SYSTEM·CCR·OCG·Execution·ESZ·EPZ·EMZ·CSZ·Fields·Plane·Shell)
 * - Orchestration of 675+ capabilities, 76 engines, 24 meta-engines
 * - SEBA, Autoblog, and Test adapters
 * - Capability toggles with persistence
 * - Full audit trail with secret redaction
 * - Governed execution with dry-run support
 */

// Types
export * from './types';

// Core
export { 
  listCapabilities, 
  getCapability, 
  setCapability, 
  checkOpAllowed,
  isCapabilityEnabled,
  initCapabilityCache,
} from './capabilities';

export {
  writeAuditEntry,
  queryAuditLog,
  redactSecrets,
  generateTraceId,
} from './audit';

export {
  getRegistry,
  getModule,
  getAction,
  listActions,
  getModulesByLayer,
  MODULE_REGISTRY,
} from './registry';

export {
  runAction,
  validateArgs,
  type RunActionOptions,
  type RunActionResult,
} from './runner';

// Adapters
export { 
  executeSEBACommand, 
  getSEBAStatus,
} from './adapters/seba';

export { 
  executeAutoblogCommand, 
  getAutoblogStatusSummary,
} from './adapters/autoblog';

export { 
  executeTestCommand,
} from './adapters/tests';

export { 
  gatherIntel,
} from './adapters/intel';

// Main Atlas executor
import { checkOpAllowed, initCapabilityCache, listCapabilities, setCapability, isCapabilityEnabled } from './capabilities';
import { queryAuditLog, writeAuditEntry, generateTraceId, redactSecrets } from './audit';
import { getRegistry } from './registry';
import { runAction } from './runner';
import { executeSEBACommand, getSEBAStatus } from './adapters/seba';
import { executeAutoblogCommand, getAutoblogStatusSummary } from './adapters/autoblog';
import { executeTestCommand } from './adapters/tests';
import { gatherIntel } from './adapters/intel';
import type { AtlasRequest, AtlasResponse, AtlasOp } from './types';

/**
 * Main Atlas request handler
 */
export async function executeAtlasRequest(
  request: AtlasRequest,
  actor?: string,
  actor_role?: string
): Promise<AtlasResponse> {
  const startTime = performance.now();
  const trace_id = request.trace_id ?? generateTraceId();
  
  // Initialize capability cache
  await initCapabilityCache();
  
  // Check master toggle
  if (!isCapabilityEnabled('atlas.enabled')) {
    return {
      ok: false,
      op: request.op,
      dry_run: request.dry_run ?? false,
      error: 'Atlas control plane is disabled',
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
  
  try {
    switch (request.op) {
      case 'registry':
        return {
          ok: true,
          op: 'registry',
          dry_run: false,
          output: { modules: getRegistry() },
          trace_id,
          execution_ms: performance.now() - startTime,
        };
        
      case 'run_action': {
        const { module, action, ...args } = request.payload ?? {};
        const result = await runAction({
          module: module as string,
          action: action as string,
          args,
          dry_run: request.dry_run,
          actor,
          actor_role,
        });
        return {
          ok: result.ok,
          op: 'run_action',
          target: `${module}.${action}`,
          dry_run: result.dry_run,
          output: result.output,
          warnings: result.warnings,
          error: result.error,
          trace_id: result.trace_id,
          execution_ms: result.execution_ms,
        };
      }
        
      case 'seba': {
        const { cmd, ...args } = request.payload ?? {};
        const result = await executeSEBACommand(cmd as any, args, actor, actor_role);
        return {
          ok: result.ok,
          op: 'seba',
          target: cmd as string,
          dry_run: false,
          output: result.data,
          error: result.error,
          trace_id: result.trace_id,
          execution_ms: result.execution_ms,
        };
      }
        
      case 'autoblog': {
        const { cmd, ...args } = request.payload ?? {};
        const result = await executeAutoblogCommand(cmd as any, args, actor, actor_role);
        return {
          ok: result.ok,
          op: 'autoblog',
          target: cmd as string,
          dry_run: false,
          output: result.data,
          error: result.error,
          trace_id: result.trace_id,
          execution_ms: result.execution_ms,
        };
      }
        
      case 'tests': {
        const { cmd, target, depth } = request.payload ?? {};
        const result = await executeTestCommand(cmd as any, { target: target as string, depth: depth as any }, actor, actor_role);
        return {
          ok: result.ok,
          op: 'tests',
          target: target as string,
          dry_run: false,
          output: result.result,
          error: result.error,
          trace_id: result.trace_id,
          execution_ms: result.execution_ms,
        };
      }
        
      case 'intel': {
        const result = await gatherIntel(actor, actor_role);
        return {
          ok: result.ok,
          op: 'intel',
          dry_run: false,
          output: { summaries: result.summaries },
          error: result.error,
          trace_id: result.trace_id,
          execution_ms: result.execution_ms,
        };
      }
        
      case 'capabilities': {
        const { action, key, enabled, notes } = request.payload ?? {};
        
        if (action === 'set' && key) {
          const success = await setCapability(key as string, enabled as boolean, actor, notes as string);
          return {
            ok: success,
            op: 'capabilities',
            target: key as string,
            dry_run: false,
            output: { key, enabled },
            trace_id,
            execution_ms: performance.now() - startTime,
          };
        }
        
        // Default: list capabilities
        const caps = await listCapabilities();
        return {
          ok: true,
          op: 'capabilities',
          dry_run: false,
          output: { capabilities: caps },
          trace_id,
          execution_ms: performance.now() - startTime,
        };
      }
        
      case 'audit': {
        const entries = await queryAuditLog(request.payload as any ?? {});
        return {
          ok: true,
          op: 'audit',
          dry_run: false,
          output: { entries },
          trace_id,
          execution_ms: performance.now() - startTime,
        };
      }
        
      case 'dialogue': {
        // Dialogue routes through brain/decode - simple passthrough for now
        const { input } = request.payload ?? {};
        return {
          ok: true,
          op: 'dialogue',
          dry_run: false,
          output: {
            response: `Atlas received: "${input}"`,
            suggestion: 'Use specific operations (seba, autoblog, tests) for actions',
          },
          trace_id,
          execution_ms: performance.now() - startTime,
        };
      }
        
      default:
        return {
          ok: false,
          op: request.op,
          dry_run: false,
          error: `Unknown operation: ${request.op}`,
          trace_id,
          execution_ms: performance.now() - startTime,
        };
    }
  } catch (err) {
    return {
      ok: false,
      op: request.op,
      dry_run: request.dry_run ?? false,
      error: err instanceof Error ? err.message : 'Unknown error',
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
}
