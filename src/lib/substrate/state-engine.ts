/**
 * CMPSBL® State Engine
 * Canonical State Contract Layer
 * 
 * The State Engine enforces shared state schemas and contracts across all engines.
 * All state reads and writes must route through state_engine.get() and state_engine.set().
 * 
 * Responsibilities:
 * - Define canonical state schemas
 * - Validate all state reads and writes
 * - Enforce versioned state contracts
 * - Provide safe defaults for missing fields
 * - Emit non-fatal validation warnings on contract mismatch
 */

import { telemetryEngine } from './telemetry-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type StateSchemaName = 
  | 'memory_state'
  | 'learning_state'
  | 'imagination_state'
  | 'reasoning_state'
  | 'governance_state'
  | 'evolution_state'
  | 'inclusive_state'
  | 'telemetry_state';

export interface StateField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: unknown;
  validator?: (value: unknown) => boolean;
}

export interface StateSchema {
  name: StateSchemaName;
  version: string;
  fields: StateField[];
  description: string;
}

export interface StateValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  sanitized: Record<string, unknown>;
}

export interface StateEngineState {
  initialized: boolean;
  schemasLoaded: number;
  totalReads: number;
  totalWrites: number;
  validationWarnings: number;
  validationErrors: number;
  lastAccess: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANONICAL STATE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const SCHEMAS: Record<StateSchemaName, StateSchema> = {
  memory_state: {
    name: 'memory_state',
    version: '1.0.0',
    description: 'Memory core lifecycle state',
    fields: [
      { name: 'tier', type: 'string', required: true, default: 'warm' },
      { name: 'count', type: 'number', required: true, default: 0 },
      { name: 'limit', type: 'number', required: true, default: 500 },
      { name: 'lastAccess', type: 'string', required: false, default: null },
      { name: 'health', type: 'number', required: true, default: 100 },
      { name: 'overflow', type: 'boolean', required: true, default: false },
    ],
  },
  learning_state: {
    name: 'learning_state',
    version: '1.0.0',
    description: 'Learning engine lifecycle state',
    fields: [
      { name: 'stage', type: 'string', required: true, default: 'idle' },
      { name: 'learningRate', type: 'number', required: true, default: 0.01 },
      { name: 'epochsCompleted', type: 'number', required: true, default: 0 },
      { name: 'lastTrainedAt', type: 'string', required: false, default: null },
      { name: 'stabilized', type: 'boolean', required: true, default: false },
      { name: 'momentum', type: 'number', required: true, default: 0 },
    ],
  },
  imagination_state: {
    name: 'imagination_state',
    version: '1.0.0',
    description: 'Imagination engine lifecycle state',
    fields: [
      { name: 'stage', type: 'string', required: true, default: 'dormant' },
      { name: 'dreamsGenerated', type: 'number', required: true, default: 0 },
      { name: 'synthesisCount', type: 'number', required: true, default: 0 },
      { name: 'latentDimension', type: 'number', required: true, default: 64 },
      { name: 'lastDreamAt', type: 'string', required: false, default: null },
      { name: 'creativityIndex', type: 'number', required: true, default: 0.5 },
    ],
  },
  reasoning_state: {
    name: 'reasoning_state',
    version: '1.0.0',
    description: 'Reasoning engine lifecycle state',
    fields: [
      { name: 'stage', type: 'string', required: true, default: 'idle' },
      { name: 'hypothesesGenerated', type: 'number', required: true, default: 0 },
      { name: 'hypothesesValidated', type: 'number', required: true, default: 0 },
      { name: 'causalLinksFound', type: 'number', required: true, default: 0 },
      { name: 'reasoningDepth', type: 'string', required: true, default: 'standard' },
      { name: 'confidenceThreshold', type: 'number', required: true, default: 0.7 },
    ],
  },
  governance_state: {
    name: 'governance_state',
    version: '1.0.0',
    description: 'Governance guard lifecycle state',
    fields: [
      { name: 'mode', type: 'string', required: true, default: 'strict' },
      { name: 'blockedCount', type: 'number', required: true, default: 0 },
      { name: 'overrideCount', type: 'number', required: true, default: 0 },
      { name: 'coherenceScore', type: 'number', required: true, default: 100 },
      { name: 'ethicalCompliance', type: 'boolean', required: true, default: true },
      { name: 'lastCheckAt', type: 'string', required: false, default: null },
    ],
  },
  modernizer_state: {
    name: 'modernizer_state',
    version: '1.0.0',
    description: 'Evolution cycle state',
    fields: [
      { name: 'phase', type: 'string', required: true, default: 'idle' },
      { name: 'activePlanId', type: 'string', required: false, default: null },
      { name: 'shortId', type: 'string', required: false, default: null },
      { name: 'scanComplete', type: 'boolean', required: true, default: false },
      { name: 'shadowApplied', type: 'boolean', required: true, default: false },
      { name: 'productionApplied', type: 'boolean', required: true, default: false },
      { name: 'verified', type: 'boolean', required: true, default: false },
      { name: 'failsafeBackupId', type: 'string', required: false, default: null },
    ],
  },
  inclusive_state: {
    name: 'inclusive_state',
    version: '1.0.0',
    description: 'Inclusive accessibility pipeline state',
    fields: [
      { name: 'lastScanTarget', type: 'string', required: false, default: null },
      { name: 'lastScanScore', type: 'number', required: false, default: null },
      { name: 'totalScans', type: 'number', required: true, default: 0 },
      { name: 'issuesFound', type: 'number', required: true, default: 0 },
      { name: 'issuesRepaired', type: 'number', required: true, default: 0 },
      { name: 'wcagLevel', type: 'string', required: true, default: 'AA' },
    ],
  },
  telemetry_state: {
    name: 'telemetry_state',
    version: '1.0.0',
    description: 'Telemetry engine state',
    fields: [
      { name: 'sessionId', type: 'string', required: true, default: '' },
      { name: 'totalEvents', type: 'number', required: true, default: 0 },
      { name: 'errorCount', type: 'number', required: true, default: 0 },
      { name: 'warningCount', type: 'number', required: true, default: 0 },
      { name: 'lastEventAt', type: 'string', required: false, default: null },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE ENGINE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class StateEngineClient {
  private static instance: StateEngineClient;
  private stateStore: Record<StateSchemaName, Record<string, unknown>> = {} as any;
  private engineState: StateEngineState = {
    initialized: false,
    schemasLoaded: 0,
    totalReads: 0,
    totalWrites: 0,
    validationWarnings: 0,
    validationErrors: 0,
    lastAccess: null,
  };

  private constructor() {
    this.initializeState();
  }

  static getInstance(): StateEngineClient {
    if (!StateEngineClient.instance) {
      StateEngineClient.instance = new StateEngineClient();
    }
    return StateEngineClient.instance;
  }

  private initializeState(): void {
    // Initialize all schemas with defaults
    for (const [name, schema] of Object.entries(SCHEMAS)) {
      this.stateStore[name as StateSchemaName] = this.getDefaultState(schema);
    }
    this.engineState.schemasLoaded = Object.keys(SCHEMAS).length;
    this.engineState.initialized = true;
  }

  private getDefaultState(schema: StateSchema): Record<string, unknown> {
    const state: Record<string, unknown> = {};
    for (const field of schema.fields) {
      state[field.name] = field.default;
    }
    return state;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE GET/SET METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get state value by schema and optional field
   */
  get<T = unknown>(schema: StateSchemaName, field?: string): T {
    this.engineState.totalReads++;
    this.engineState.lastAccess = new Date().toISOString();

    // Emit telemetry (non-blocking)
    telemetryEngine.emitStateRead(schema, field);

    const schemaState = this.stateStore[schema];
    if (!schemaState) {
      // Return empty object for unknown schema
      return {} as T;
    }

    if (field) {
      return schemaState[field] as T;
    }

    return { ...schemaState } as T;
  }

  /**
   * Set state value with validation
   */
  set<T = unknown>(
    schema: StateSchemaName,
    field: string,
    value: T
  ): StateValidationResult {
    this.engineState.totalWrites++;
    this.engineState.lastAccess = new Date().toISOString();

    const result = this.validateField(schema, field, value);

    if (result.valid) {
      // Apply sanitized value
      if (!this.stateStore[schema]) {
        this.stateStore[schema] = this.getDefaultState(SCHEMAS[schema]);
      }
      this.stateStore[schema][field] = result.sanitized[field] ?? value;
    } else {
      // Still apply value but track warning/error
      if (result.warnings.length > 0) {
        this.engineState.validationWarnings++;
      }
      if (result.errors.length > 0) {
        this.engineState.validationErrors++;
      }
      // Apply anyway to preserve backward compatibility
      if (!this.stateStore[schema]) {
        this.stateStore[schema] = this.getDefaultState(SCHEMAS[schema]);
      }
      this.stateStore[schema][field] = value;
    }

    // Emit telemetry (non-blocking)
    telemetryEngine.emitStateWrite(schema, field, result.valid);

    return result;
  }

  /**
   * Set multiple fields at once
   */
  setMany(
    schema: StateSchemaName,
    values: Record<string, unknown>
  ): StateValidationResult {
    const allWarnings: string[] = [];
    const allErrors: string[] = [];
    const sanitized: Record<string, unknown> = {};
    let allValid = true;

    for (const [field, value] of Object.entries(values)) {
      const result = this.set(schema, field, value);
      allWarnings.push(...result.warnings);
      allErrors.push(...result.errors);
      Object.assign(sanitized, result.sanitized);
      if (!result.valid) allValid = false;
    }

    return {
      valid: allValid,
      warnings: allWarnings,
      errors: allErrors,
      sanitized,
    };
  }

  /**
   * Reset schema state to defaults
   */
  reset(schema: StateSchemaName): void {
    this.stateStore[schema] = this.getDefaultState(SCHEMAS[schema]);
  }

  /**
   * Reset all state to defaults
   */
  resetAll(): void {
    this.initializeState();
    this.engineState.totalReads = 0;
    this.engineState.totalWrites = 0;
    this.engineState.validationWarnings = 0;
    this.engineState.validationErrors = 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate a field value against schema
   */
  validateField(
    schemaName: StateSchemaName,
    fieldName: string,
    value: unknown
  ): StateValidationResult {
    const schema = SCHEMAS[schemaName];
    if (!schema) {
      return {
        valid: false,
        warnings: [],
        errors: [`Unknown schema: ${schemaName}`],
        sanitized: {},
      };
    }

    const field = schema.fields.find(f => f.name === fieldName);
    if (!field) {
      // Unknown field - warn but allow (backward compatibility)
      return {
        valid: true,
        warnings: [`Unknown field '${fieldName}' in schema '${schemaName}' (allowing for compatibility)`],
        errors: [],
        sanitized: { [fieldName]: value },
      };
    }

    const warnings: string[] = [];
    const errors: string[] = [];
    let sanitizedValue = value;

    // Type validation
    const actualType = this.getValueType(value);
    if (actualType !== field.type && value !== null && value !== undefined) {
      warnings.push(`Field '${fieldName}' expected type '${field.type}' but got '${actualType}'`);
      // Attempt coercion
      sanitizedValue = this.coerceValue(value, field.type, field.default);
    }

    // Required validation
    if (field.required && (value === null || value === undefined)) {
      if (field.default !== undefined) {
        sanitizedValue = field.default;
        warnings.push(`Field '${fieldName}' is required; using default value`);
      } else {
        errors.push(`Field '${fieldName}' is required but missing`);
      }
    }

    // Custom validator
    if (field.validator && !field.validator(sanitizedValue)) {
      warnings.push(`Field '${fieldName}' failed custom validation`);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      sanitized: { [fieldName]: sanitizedValue },
    };
  }

  /**
   * Validate entire state object
   */
  validateState(
    schemaName: StateSchemaName,
    state: Record<string, unknown>
  ): StateValidationResult {
    const allWarnings: string[] = [];
    const allErrors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(state)) {
      const result = this.validateField(schemaName, field, value);
      allWarnings.push(...result.warnings);
      allErrors.push(...result.errors);
      Object.assign(sanitized, result.sanitized);
    }

    return {
      valid: allErrors.length === 0,
      warnings: allWarnings,
      errors: allErrors,
      sanitized,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHEMA INSPECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get schema definition
   */
  getSchema(name: StateSchemaName): StateSchema | null {
    return SCHEMAS[name] || null;
  }

  /**
   * Get all schema names
   */
  getSchemaNames(): StateSchemaName[] {
    return Object.keys(SCHEMAS) as StateSchemaName[];
  }

  /**
   * Get engine state
   */
  getState(): StateEngineState {
    return { ...this.engineState };
  }

  /**
   * Get full state snapshot
   */
  snapshot(): Record<StateSchemaName, Record<string, unknown>> {
    const snap: Record<string, Record<string, unknown>> = {};
    for (const [name, state] of Object.entries(this.stateStore)) {
      snap[name] = { ...state };
    }
    return snap as Record<StateSchemaName, Record<string, unknown>>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private getValueType(value: unknown): string {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  }

  private coerceValue(value: unknown, targetType: string, defaultValue?: unknown): unknown {
    try {
      switch (targetType) {
        case 'string':
          return String(value);
        case 'number':
          const num = Number(value);
          return isNaN(num) ? (defaultValue ?? 0) : num;
        case 'boolean':
          return Boolean(value);
        case 'object':
          return typeof value === 'object' ? value : (defaultValue ?? {});
        case 'array':
          return Array.isArray(value) ? value : (defaultValue ?? []);
        default:
          return value;
      }
    } catch {
      return defaultValue ?? value;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const stateEngine = StateEngineClient.getInstance();
export { StateEngineClient };
