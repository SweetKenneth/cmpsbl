/**
 * CORE Module — Configuration Management
 * Runtime config, feature flags, and environment management
 */

import { supabase } from '@/integrations/supabase/client';
import { type SubstrateModuleName } from './index';
import { safeParse, withTimeout, validateStringInput } from '@/lib/system/hardening';

// ============ Types ============\

export interface ConfigValue {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  source: 'default' | 'database' | 'environment' | 'runtime';
  last_modified: string;
  description?: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rollout_percentage: number;
  conditions?: Record<string, unknown>;
  expires_at?: string;
  description?: string;
}

export interface ModuleConfig {
  module: SubstrateModuleName;
  settings: Record<string, unknown>;
  overrides: Record<string, unknown>;
  version: string;
}

export interface ConfigSnapshot {
  id: string;
  timestamp: string;
  configs: Record<string, ConfigValue>;
  flags: Record<string, FeatureFlag>;
  description?: string;
}

// ============ State ============\

const configs: Map<string, ConfigValue> = new Map();
const featureFlags: Map<string, FeatureFlag> = new Map();
const moduleConfigs: Map<SubstrateModuleName, ModuleConfig> = new Map();
const snapshots: ConfigSnapshot[] = [];

// ============ Default Configs ============\

const DEFAULT_CONFIGS: Record<string, Omit<ConfigValue, 'last_modified'>> = {
  'substrate.version': { key: 'substrate.version', value: '7.5.0', type: 'string', source: 'default', description: 'Substrate version' },
  'substrate.debug_mode': { key: 'substrate.debug_mode', value: false, type: 'boolean', source: 'default', description: 'Enable debug logging' },
  'substrate.max_retries': { key: 'substrate.max_retries', value: 3, type: 'number', source: 'default', description: 'Max retry attempts' },
  'substrate.timeout_ms': { key: 'substrate.timeout_ms', value: 30000, type: 'number', source: 'default', description: 'Default timeout' },
  'brain.memory_decay_rate': { key: 'brain.memory_decay_rate', value: 0.1, type: 'number', source: 'default', description: 'Memory decay rate per day' },
  'nexus.default_provider': { key: 'nexus.default_provider', value: 'groq', type: 'string', source: 'default', description: 'Default AI provider' },
  'defense.enforcement_mode': { key: 'defense.enforcement_mode', value: 'observe', type: 'string', source: 'default', description: 'Defense enforcement mode' },
  'vision.metrics_retention_days': { key: 'vision.metrics_retention_days', value: 30, type: 'number', source: 'default', description: 'Days to retain metrics' },
};

// Initialize defaults
Object.entries(DEFAULT_CONFIGS).forEach(([key, config]) => {
  configs.set(key, { ...config, last_modified: new Date().toISOString() });
});

// ============ Config Operations ============\

/**
 * Get a config value
 */
export function getConfig<T = unknown>(key: string): T | undefined {
  const config = configs.get(key);
  return config?.value as T | undefined;
}

/**
 * Set a config value
 */
export function setConfig(
  key: string,
  value: unknown,
  options?: { source?: ConfigValue['source']; description?: string }
): void {
  const existing = configs.get(key);
  const type = inferType(value);
  
  configs.set(key, {
    key,
    value,
    type,
    source: options?.source || 'runtime',
    last_modified: new Date().toISOString(),
    description: options?.description || existing?.description,
  });
}

/**
 * Delete a config
 */
export function deleteConfig(key: string): boolean {
  return configs.delete(key);
}

/**
 * Get all configs
 */
export function getAllConfigs(): ConfigValue[] {
  return Array.from(configs.values());
}

/**
 * Get configs by prefix
 */
export function getConfigsByPrefix(prefix: string): ConfigValue[] {
  return getAllConfigs().filter(c => c.key.startsWith(prefix));
}

// ============ Feature Flags ============\

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(key: string, context?: Record<string, unknown>): boolean {
  const flag = featureFlags.get(key);
  if (!flag) return false;
  
  // Check expiration
  if (flag.expires_at && new Date() > new Date(flag.expires_at)) {
    return false;
  }
  
  // Check rollout percentage — hash only the key for deterministic bucketing
  if (flag.rollout_percentage < 100) {
    const hash = simpleHash(key);
    if ((hash % 100) >= flag.rollout_percentage) {
      return false;
    }
  }
  
  // Check conditions
  if (flag.conditions && context) {
    for (const [condKey, condValue] of Object.entries(flag.conditions)) {
      if (context[condKey] !== condValue) {
        return false;
      }
    }
  }
  
  return flag.enabled;
}

/**
 * Set feature flag
 */
export function setFeatureFlag(flag: FeatureFlag): void {
  featureFlags.set(flag.key, flag);
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Array.from(featureFlags.values());
}

/**
 * Toggle feature flag
 */
export function toggleFeatureFlag(key: string): boolean {
  const flag = featureFlags.get(key);
  if (!flag) return false;
  
  flag.enabled = !flag.enabled;
  featureFlags.set(key, flag);
  return flag.enabled;
}

// ============ Module Configs ============\

/**
 * Get module config
 */
export function getModuleConfig(module: SubstrateModuleName): ModuleConfig | undefined {
  return moduleConfigs.get(module);
}

/**
 * Set module config
 */
export function setModuleConfig(module: SubstrateModuleName, settings: Record<string, unknown>): void {
  const existing = moduleConfigs.get(module);
  
  moduleConfigs.set(module, {
    module,
    settings: { ...existing?.settings, ...settings },
    overrides: existing?.overrides || {},
    version: new Date().toISOString(),
  });
}

/**
 * Set module config override
 */
export function setModuleConfigOverride(
  module: SubstrateModuleName,
  key: string,
  value: unknown
): void {
  const config = moduleConfigs.get(module) || {
    module,
    settings: {},
    overrides: {},
    version: new Date().toISOString(),
  };
  
  config.overrides[key] = value;
  config.version = new Date().toISOString();
  moduleConfigs.set(module, config);
}

// ============ Snapshots ============\

/**
 * Create config snapshot
 */
export function createSnapshot(description?: string): ConfigSnapshot {
  // Deep-clone configs and flags to prevent mutation after snapshot
  const snapshot: ConfigSnapshot = {
    id: `snap_${Date.now()}`,
    timestamp: new Date().toISOString(),
    configs: JSON.parse(JSON.stringify(Object.fromEntries(configs))),
    flags: JSON.parse(JSON.stringify(Object.fromEntries(featureFlags))),
    description,
  };
  
  snapshots.push(snapshot);
  
  // Keep last 10 snapshots
  if (snapshots.length > 10) {
    snapshots.shift();
  }
  
  return snapshot;
}

/**
 * Restore from snapshot
 */
export function restoreSnapshot(snapshotId: string): boolean {
  const snapshot = snapshots.find(s => s.id === snapshotId);
  if (!snapshot) return false;
  
  // Clear current
  configs.clear();
  featureFlags.clear();
  moduleConfigs.clear();
  
  // Restore configs
  Object.entries(snapshot.configs).forEach(([key, value]) => {
    configs.set(key, value);
  });
  
  // Restore flags
  Object.entries(snapshot.flags).forEach(([key, value]) => {
    featureFlags.set(key, value);
  });
  
  return true;
}

/**
 * Get snapshots
 */
export function getSnapshots(): ConfigSnapshot[] {
  return [...snapshots].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============ Sync Operations ============\

/**
 * Load configs from database
 */
export async function loadConfigsFromDatabase(): Promise<number> {
  try {
    const result = await withTimeout(async () => {
      const { data } = await supabase
        .from('atlas_capabilities')
        .select('key, enabled, metadata')
        .limit(100);
      return data;
    }, 15_000, 'loadConfigsFromDatabase');
    
    if (!result) return 0;
    
    let loaded = 0;
    result.forEach(row => {
      if (row.metadata && typeof row.metadata === 'object') {
        const meta = row.metadata as Record<string, unknown>;
        if ('configValue' in meta) {
          setConfig(row.key, meta.configValue, { source: 'database' });
          loaded++;
        }
      }
    });
    
    return loaded;
  } catch (error) {
    console.error('[ConfigManagement] Failed to load configs from database:', error);
    return 0;
  }
}

/**
 * Export all configs as JSON
 */
export function exportConfigs(): string {
  return JSON.stringify({
    configs: Object.fromEntries(configs),
    flags: Object.fromEntries(featureFlags),
    moduleConfigs: Object.fromEntries(moduleConfigs),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import configs from JSON
 */
export function importConfigs(json: string): { imported: number; errors: string[] } {
  let imported = 0;
  const errors: string[] = [];

  // Size guard — reject payloads > 500KB
  if (typeof json !== 'string' || json.length > 500_000) {
    errors.push('Import payload too large (max 500KB)');
    return { imported, errors };
  }
  
  try {
    const data = safeParse(json, 500_000);
    if (!data || typeof data !== 'object') {
      errors.push('Invalid JSON payload');
      return { imported, errors };
    }
    
    const typedData = data as Record<string, unknown>;

    if (typedData.configs && typeof typedData.configs === 'object') {
      const configEntries = Object.entries(typedData.configs as Record<string, unknown>);
      // Cap at 500 configs to prevent DoS
      for (const [key, value] of configEntries.slice(0, 500)) {
        const validKey = validateStringInput(key, { maxLength: 200 });
        if (!validKey) { errors.push(`Invalid config key: ${key}`); continue; }
        try {
          configs.set(validKey, value as ConfigValue);
          imported++;
        } catch (e) {
          errors.push(`Config ${validKey}: ${e}`);
        }
      }
    }
    
    if (typedData.flags && typeof typedData.flags === 'object') {
      const flagEntries = Object.entries(typedData.flags as Record<string, unknown>);
      for (const [key, value] of flagEntries.slice(0, 200)) {
        const validKey = validateStringInput(key, { maxLength: 200 });
        if (!validKey) { errors.push(`Invalid flag key: ${key}`); continue; }
        try {
          featureFlags.set(validKey, value as FeatureFlag);
          imported++;
        } catch (e) {
          errors.push(`Flag ${validKey}: ${e}`);
        }
      }
    }
  } catch (e) {
    errors.push(`Import error: ${e}`);
  }
  
  return { imported, errors };
}

// ============ Validation ============\

/**
 * Validate config value against type
 */
export function validateConfig(key: string, value: unknown): { valid: boolean; error?: string } {
  const config = configs.get(key);
  if (!config) {
    return { valid: true }; // New config, no validation
  }
  
  const actualType = inferType(value);
  if (actualType !== config.type) {
    return { valid: false, error: `Expected ${config.type}, got ${actualType}` };
  }
  
  return { valid: true };
}

// ============ Helpers ============\

function inferType(value: unknown): ConfigValue['type'] {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  return 'json';
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
