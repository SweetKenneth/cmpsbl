/**
 * Terminal Registry Validator
 * Ensures all 500+ commands are properly wired
 */

import { log } from '@/lib/system/log';

export interface CommandDefinition {
  name: string;
  module: string;
  description: string;
  hasHandler: boolean;
  emitsEvents: boolean;
  isWired: boolean;
}

export interface ValidationResult {
  valid: boolean;
  totalCommands: number;
  wiredCommands: number;
  unwiredCommands: string[];
  missingHandlers: string[];
  missingEventEmission: string[];
  warnings: string[];
}

// Track registered handlers
const registeredHandlers = new Map<string, () => Promise<unknown>>();

export function registerHandler(commandName: string, handler: () => Promise<unknown>): void {
  registeredHandlers.set(commandName.toLowerCase(), handler);
}

export function hasHandler(commandName: string): boolean {
  return registeredHandlers.has(commandName.toLowerCase());
}

export function getHandler(commandName: string): (() => Promise<unknown>) | undefined {
  return registeredHandlers.get(commandName.toLowerCase());
}

export function validateRegistry(commands: CommandDefinition[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    totalCommands: commands.length,
    wiredCommands: 0,
    unwiredCommands: [],
    missingHandlers: [],
    missingEventEmission: [],
    warnings: [],
  };

  for (const cmd of commands) {
    const handlerExists = hasHandler(cmd.name);
    
    if (!handlerExists) {
      result.missingHandlers.push(cmd.name);
      result.unwiredCommands.push(cmd.name);
      result.valid = false;
    } else {
      result.wiredCommands++;
    }

    if (!cmd.emitsEvents) {
      result.missingEventEmission.push(cmd.name);
      result.warnings.push(`${cmd.name}: does not emit events`);
    }

    if (!cmd.isWired) {
      if (!result.unwiredCommands.includes(cmd.name)) {
        result.unwiredCommands.push(cmd.name);
      }
    }
  }

  if (result.unwiredCommands.length > 0) {
    log.warn('terminal', `${result.unwiredCommands.length} commands are not properly wired`, {
      commands: result.unwiredCommands,
    });
  }

  return result;
}

// Standard command shape validator
export function validateCommandOutput(output: unknown): { valid: boolean; reason?: string } {
  if (output === null || output === undefined) {
    return { valid: false, reason: 'Output is null/undefined' };
  }

  if (typeof output === 'object') {
    const obj = output as Record<string, unknown>;
    
    // Check for error indicators
    if (obj.error && typeof obj.error === 'string') {
      return { valid: true }; // Error responses are valid
    }

    // Check for success indicators
    if ('success' in obj || 'data' in obj || 'result' in obj) {
      return { valid: true };
    }
  }

  // Primitive outputs are valid
  if (typeof output === 'string' || typeof output === 'number' || typeof output === 'boolean') {
    return { valid: true };
  }

  return { valid: true }; // Default to valid for unknown shapes
}

// Get registration stats
export function getRegistrationStats(): { registered: number; commands: string[] } {
  return {
    registered: registeredHandlers.size,
    commands: Array.from(registeredHandlers.keys()),
  };
}

// Clear all handlers (for testing)
export function clearHandlers(): void {
  registeredHandlers.clear();
}
