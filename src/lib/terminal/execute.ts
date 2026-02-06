/**
 * Terminal Execution Wrapper
 * v7.5.3 — Governed command execution with tracing and redaction
 */

import { generateTraceId } from '@/lib/system/trace';
import { emit, emitStarted, emitSucceeded, emitFailed } from '@/lib/substrate/events/emit';
import { redactSecrets } from '@/lib/defense/redact';
import { log } from '@/lib/system/log';
import { createAppError, fromError, type AppError } from '@/lib/system/errors';
import { withRetry, RetryPresets } from '@/lib/system/retry';
import { getHandler, validateCommandOutput } from './validate-registry';
import { checkGate, type GateResult } from '@/lib/atlas/capability-gate';

export interface ExecuteOptions {
  dryRun?: boolean;
  skipApproval?: boolean;
  retryable?: boolean;
  traceId?: string;
}

export interface CommandResult {
  success: boolean;
  trace_id: string;
  output?: unknown;
  output_redacted?: unknown;
  error?: AppError;
  executionTimeMs: number;
  dryRun: boolean;
  gateResult?: GateResult;
}

export async function executeCommand(
  commandName: string,
  args: Record<string, unknown> = {},
  options: ExecuteOptions = {}
): Promise<CommandResult> {
  const startTime = Date.now();
  const trace_id = options.traceId || generateTraceId();
  const commandLower = commandName.toLowerCase();

  // Parse module from command name (e.g., "brain.status" -> "brain")
  const [module] = commandLower.split('.');

  log.debug('terminal', `Executing: ${commandName}`, { args: redactSecrets(args) }, trace_id);

  // Check governance gate
  const gateResult = await checkGate({
    module: module || 'terminal',
    action: commandName,
    payload: args,
    dryRun: options.dryRun,
    skipApproval: options.skipApproval,
    traceId: trace_id,
  });

  // Dry run mode - return preview
  if (options.dryRun) {
    return {
      success: true,
      trace_id,
      output: gateResult.preview,
      output_redacted: gateResult.preview,
      executionTimeMs: Date.now() - startTime,
      dryRun: true,
      gateResult,
    };
  }

  // Check if allowed
  if (!gateResult.allowed) {
    return {
      success: false,
      trace_id,
      error: createAppError('GOVERNANCE_BLOCKED', gateResult.reason || 'Command blocked', {
        command: commandName,
      }, trace_id),
      executionTimeMs: Date.now() - startTime,
      dryRun: false,
      gateResult,
    };
  }

  // Get handler
  const handler = getHandler(commandLower);
  
  if (!handler) {
    const error = createAppError('NOT_FOUND', `Command not found: ${commandName}`, {
      command: commandName,
    }, trace_id);

    await emitFailed('terminal', commandName, 'Command not found', { command: commandName }, trace_id);

    return {
      success: false,
      trace_id,
      error,
      executionTimeMs: Date.now() - startTime,
      dryRun: false,
    };
  }

  try {
    await emitStarted('terminal', commandName, { args: redactSecrets(args) }, trace_id);

    // Execute with optional retry
    const executor = async () => handler();
    const output = options.retryable 
      ? await withRetry(executor, RetryPresets.fast, trace_id)
      : await executor();

    // Validate output shape
    const validation = validateCommandOutput(output);
    if (!validation.valid) {
      log.warn('terminal', `Command output validation warning: ${validation.reason}`, { command: commandName }, trace_id);
    }

    const output_redacted = redactSecrets(output);

    await emitSucceeded('terminal', commandName, { output: output_redacted }, trace_id);

    return {
      success: true,
      trace_id,
      output,
      output_redacted,
      executionTimeMs: Date.now() - startTime,
      dryRun: false,
    };
  } catch (error) {
    const appError = fromError(error, 'MODULE_ERROR', trace_id);
    
    await emitFailed('terminal', commandName, appError.safe_message, { 
      command: commandName,
      error_code: appError.code,
    }, trace_id);

    log.error('terminal', `Command failed: ${commandName}`, { 
      error: appError.safe_message,
      code: appError.code,
    }, trace_id);

    return {
      success: false,
      trace_id,
      error: appError,
      executionTimeMs: Date.now() - startTime,
      dryRun: false,
    };
  }
}

// Quick helpers for common patterns
export const dryRunCommand = (command: string, args?: Record<string, unknown>) =>
  executeCommand(command, args, { dryRun: true });

export const executeWithApproval = (command: string, args?: Record<string, unknown>) =>
  executeCommand(command, args, { skipApproval: false });

export const executeImmediate = (command: string, args?: Record<string, unknown>) =>
  executeCommand(command, args, { skipApproval: true });
