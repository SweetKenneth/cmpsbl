/**
 * CORE Module Enhancements
 * FeatureFlagEngine, ConfigHotReload, EnvironmentValidator
 */

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAG ENGINE — Dynamic feature management with gradual rollout
// ═══════════════════════════════════════════════════════════════════════════════

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetedUsers?: string[];
  targetedSegments?: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

interface EvaluationResult {
  flagId: string;
  enabled: boolean;
  reason: 'global' | 'targeted' | 'rollout' | 'override';
  variant?: string;
}

export class FeatureFlagEngine {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, Map<string, boolean>> = new Map(); // userId -> flagId -> value
  private evaluationHistory: Array<{ flagId: string; userId: string; result: boolean; timestamp: number }> = [];

  /** Create or update a feature flag */
  setFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): void {
    const existing = this.flags.get(flag.id);
    
    this.flags.set(flag.id, {
      ...flag,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  }

  /** Evaluate if a feature is enabled for a user */
  evaluate(flagId: string, userId: string, userSegments: string[] = []): EvaluationResult {
    const flag = this.flags.get(flagId);
    
    if (!flag) {
      return { flagId, enabled: false, reason: 'global' };
    }

    // Check overrides first
    const userOverrides = this.overrides.get(userId);
    if (userOverrides?.has(flagId)) {
      const enabled = userOverrides.get(flagId)!;
      this.recordEvaluation(flagId, userId, enabled);
      return { flagId, enabled, reason: 'override' };
    }

    // Check if globally disabled
    if (!flag.enabled) {
      this.recordEvaluation(flagId, userId, false);
      return { flagId, enabled: false, reason: 'global' };
    }

    // Check targeted users
    if (flag.targetedUsers?.includes(userId)) {
      this.recordEvaluation(flagId, userId, true);
      return { flagId, enabled: true, reason: 'targeted' };
    }

    // Check targeted segments
    if (flag.targetedSegments) {
      const inSegment = flag.targetedSegments.some(seg => userSegments.includes(seg));
      if (inSegment) {
        this.recordEvaluation(flagId, userId, true);
        return { flagId, enabled: true, reason: 'targeted' };
      }
    }

    // Check rollout percentage
    const hash = this.hashUserFlag(userId, flagId);
    const enabled = hash < flag.rolloutPercentage;
    this.recordEvaluation(flagId, userId, enabled);
    return { flagId, enabled, reason: 'rollout' };
  }

  /** Set user-specific override */
  setOverride(userId: string, flagId: string, value: boolean): void {
    if (!this.overrides.has(userId)) {
      this.overrides.set(userId, new Map());
    }
    this.overrides.get(userId)!.set(flagId, value);
  }

  /** Remove user override */
  removeOverride(userId: string, flagId: string): void {
    this.overrides.get(userId)?.delete(flagId);
  }

  private hashUserFlag(userId: string, flagId: string): number {
    const str = `${userId}:${flagId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  private recordEvaluation(flagId: string, userId: string, result: boolean): void {
    this.evaluationHistory.push({ flagId, userId, result, timestamp: Date.now() });
    if (this.evaluationHistory.length > 10000) {
      this.evaluationHistory.shift();
    }
  }

  /** Get flag statistics */
  getStats(flagId: string): { evaluations: number; enabledRate: number } {
    const history = this.evaluationHistory.filter(e => e.flagId === flagId);
    const enabled = history.filter(e => e.result).length;
    return {
      evaluations: history.length,
      enabledRate: history.length > 0 ? enabled / history.length : 0,
    };
  }

  /** List all flags */
  listFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG HOT RELOAD — Live configuration updates without restart
// ═══════════════════════════════════════════════════════════════════════════════

interface ConfigValue {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  version: number;
  updatedAt: number;
  source: 'default' | 'env' | 'remote' | 'override';
}

interface ConfigChangeEvent {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  version: number;
  timestamp: number;
}

type ConfigListener = (event: ConfigChangeEvent) => void;

export class ConfigHotReload {
  private config: Map<string, ConfigValue> = new Map();
  private listeners: Map<string, ConfigListener[]> = new Map();
  private globalListeners: ConfigListener[] = [];
  private changeHistory: ConfigChangeEvent[] = [];

  /** Set a configuration value */
  set(key: string, value: unknown, source: ConfigValue['source'] = 'override'): void {
    const existing = this.config.get(key);
    const oldValue = existing?.value;
    const version = (existing?.version || 0) + 1;

    const configValue: ConfigValue = {
      key,
      value,
      type: this.detectType(value),
      version,
      updatedAt: Date.now(),
      source,
    };

    this.config.set(key, configValue);

    // Notify listeners
    if (oldValue !== value) {
      const event: ConfigChangeEvent = {
        key,
        oldValue,
        newValue: value,
        version,
        timestamp: Date.now(),
      };

      this.changeHistory.push(event);
      if (this.changeHistory.length > 1000) this.changeHistory.shift();

      this.notifyListeners(key, event);
    }
  }

  /** Get a configuration value */
  get<T>(key: string, defaultValue?: T): T {
    const config = this.config.get(key);
    return (config?.value as T) ?? defaultValue!;
  }

  /** Subscribe to configuration changes */
  subscribe(key: string | null, listener: ConfigListener): () => void {
    if (key === null) {
      this.globalListeners.push(listener);
      return () => {
        const idx = this.globalListeners.indexOf(listener);
        if (idx > -1) this.globalListeners.splice(idx, 1);
      };
    }

    const listeners = this.listeners.get(key) || [];
    listeners.push(listener);
    this.listeners.set(key, listeners);

    return () => {
      const list = this.listeners.get(key);
      if (list) {
        const idx = list.indexOf(listener);
        if (idx > -1) list.splice(idx, 1);
      }
    };
  }

  private notifyListeners(key: string, event: ConfigChangeEvent): void {
    // Key-specific listeners
    const keyListeners = this.listeners.get(key) || [];
    for (const listener of keyListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Config listener error for ${key}:`, error);
      }
    }

    // Global listeners
    for (const listener of this.globalListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Global config listener error:', error);
      }
    }
  }

  private detectType(value: unknown): ConfigValue['type'] {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'json';
  }

  /** Batch update configuration */
  batchSet(updates: Record<string, unknown>, source: ConfigValue['source'] = 'override'): void {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value, source);
    }
  }

  /** Get all configuration */
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, config] of this.config.entries()) {
      result[key] = config.value;
    }
    return result;
  }

  /** Get change history */
  getHistory(limit: number = 50): ConfigChangeEvent[] {
    return this.changeHistory.slice(-limit).reverse();
  }

  /** Rollback to previous version */
  rollback(key: string): boolean {
    const history = this.changeHistory.filter(e => e.key === key);
    if (history.length < 2) return false;

    const previous = history[history.length - 2];
    this.set(key, previous.oldValue, 'override');
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATOR — Runtime environment verification
// ═══════════════════════════════════════════════════════════════════════════════

interface EnvironmentCheck {
  name: string;
  check: () => Promise<{ valid: boolean; message: string }>;
  required: boolean;
  category: 'system' | 'dependency' | 'configuration' | 'security';
}

interface ValidationResult {
  valid: boolean;
  checks: Array<{
    name: string;
    category: string;
    valid: boolean;
    message: string;
    required: boolean;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class EnvironmentValidator {
  private checks: EnvironmentCheck[] = [];

  /** Register an environment check */
  registerCheck(check: EnvironmentCheck): void {
    this.checks.push(check);
  }

  /** Register common default checks */
  registerDefaults(): void {
    this.registerCheck({
      name: 'Node Environment',
      check: async () => {
        const env = typeof process !== 'undefined' ? process.env.NODE_ENV : 'browser';
        return { 
          valid: true, 
          message: `Running in ${env} mode` 
        };
      },
      required: true,
      category: 'system',
    });

    this.registerCheck({
      name: 'Memory Available',
      check: async () => {
        if (typeof performance !== 'undefined' && 'memory' in performance) {
          const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
          const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
          const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
          const percent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          return {
            valid: percent < 90,
            message: `${usedMB}MB / ${limitMB}MB (${percent.toFixed(1)}%)`,
          };
        }
        return { valid: true, message: 'Memory check not available' };
      },
      required: false,
      category: 'system',
    });

    this.registerCheck({
      name: 'Secure Context',
      check: async () => {
        const isSecure = typeof window !== 'undefined' 
          ? window.isSecureContext 
          : true;
        return {
          valid: isSecure,
          message: isSecure ? 'Running in secure context' : 'Not in secure context (HTTPS required)',
        };
      },
      required: false,
      category: 'security',
    });
  }

  /** Run all validation checks */
  async validate(): Promise<ValidationResult> {
    const results: ValidationResult['checks'] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    for (const check of this.checks) {
      try {
        const result = await check.check();
        
        results.push({
          name: check.name,
          category: check.category,
          valid: result.valid,
          message: result.message,
          required: check.required,
        });

        if (result.valid) {
          passed++;
        } else if (check.required) {
          failed++;
        } else {
          warnings++;
        }
      } catch (error) {
        results.push({
          name: check.name,
          category: check.category,
          valid: false,
          message: error instanceof Error ? error.message : 'Check failed',
          required: check.required,
        });

        if (check.required) {
          failed++;
        } else {
          warnings++;
        }
      }
    }

    return {
      valid: failed === 0,
      checks: results,
      summary: {
        total: this.checks.length,
        passed,
        failed,
        warnings,
      },
    };
  }

  /** Quick health check */
  async isHealthy(): Promise<boolean> {
    const result = await this.validate();
    return result.valid;
  }

  /** Get checks by category */
  getChecksByCategory(category: EnvironmentCheck['category']): EnvironmentCheck[] {
    return this.checks.filter(c => c.category === category);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const coreEnhancements = {
  FeatureFlagEngine,
  ConfigHotReload,
  EnvironmentValidator,
};

export type {
  FeatureFlag,
  EvaluationResult,
  ConfigValue,
  ConfigChangeEvent,
  EnvironmentCheck,
  ValidationResult,
};
