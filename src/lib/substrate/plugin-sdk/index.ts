/**
 * Substrate Plugin SDK
 * v1.0.0 — Extension framework for third-party substrate plugins
 * 
 * Provides lifecycle hooks, capability registration, and sandboxed
 * execution for external plugins integrating with the cognitive substrate.
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  requiredTier: 'free' | 'builder' | 'pro' | 'enterprise';
  permissions: PluginPermission[];
  capabilities: string[];
  engines: string[];
}

export type PluginPermission =
  | 'memory:read'
  | 'memory:write'
  | 'events:subscribe'
  | 'events:publish'
  | 'engine:register'
  | 'pipeline:create'
  | 'config:read';

export type PluginStatus = 'registered' | 'installed' | 'active' | 'suspended' | 'uninstalled';

export interface PluginInstance {
  manifest: PluginManifest;
  status: PluginStatus;
  installedAt: number;
  activatedAt: number | null;
  errors: string[];
  metrics: {
    invocations: number;
    failures: number;
    lastInvokedAt: number | null;
  };
}

export interface PluginHook {
  event: string;
  pluginId: string;
  handler: string;
  priority: number;
}

const plugins = new Map<string, PluginInstance>();
const hooks = new Map<string, PluginHook[]>();

/**
 * Register a plugin from its manifest
 */
export function registerPlugin(manifest: PluginManifest): PluginInstance {
  const instance: PluginInstance = {
    manifest,
    status: 'registered',
    installedAt: Date.now(),
    activatedAt: null,
    errors: [],
    metrics: { invocations: 0, failures: 0, lastInvokedAt: null },
  };
  plugins.set(manifest.id, instance);
  return instance;
}

/**
 * Install and activate a plugin
 */
export function activatePlugin(pluginId: string): boolean {
  const instance = plugins.get(pluginId);
  if (!instance || instance.status === 'active') return false;

  instance.status = 'active';
  instance.activatedAt = Date.now();
  return true;
}

/**
 * Suspend a plugin
 */
export function suspendPlugin(pluginId: string, reason: string): boolean {
  const instance = plugins.get(pluginId);
  if (!instance || instance.status !== 'active') return false;

  instance.status = 'suspended';
  instance.errors.push(`Suspended: ${reason}`);
  return true;
}

/**
 * Uninstall a plugin
 */
export function uninstallPlugin(pluginId: string): boolean {
  const instance = plugins.get(pluginId);
  if (!instance) return false;

  instance.status = 'uninstalled';
  // Remove hooks
  for (const [event, hookList] of hooks) {
    hooks.set(event, hookList.filter(h => h.pluginId !== pluginId));
  }
  return true;
}

/**
 * Register a hook for a plugin
 */
export function registerHook(pluginId: string, event: string, handler: string, priority: number = 10): PluginHook | null {
  const instance = plugins.get(pluginId);
  if (!instance || instance.status !== 'active') return null;

  const hook: PluginHook = { event, pluginId, handler, priority };
  const existing = hooks.get(event) ?? [];
  existing.push(hook);
  existing.sort((a, b) => a.priority - b.priority);
  hooks.set(event, existing);
  return hook;
}

/**
 * Get hooks for an event
 */
export function getHooksForEvent(event: string): PluginHook[] {
  return hooks.get(event) ?? [];
}

/**
 * Check if plugin has a specific permission
 */
export function hasPermission(pluginId: string, permission: PluginPermission): boolean {
  const instance = plugins.get(pluginId);
  if (!instance) return false;
  return instance.manifest.permissions.includes(permission);
}

/** Get plugin */
export function getPlugin(pluginId: string): PluginInstance | undefined {
  return plugins.get(pluginId);
}

/** List all plugins */
export function listPlugins(): PluginInstance[] {
  return Array.from(plugins.values());
}

/** Get active plugins */
export function getActivePlugins(): PluginInstance[] {
  return Array.from(plugins.values()).filter(p => p.status === 'active');
}
