/**
 * Config Watcher — Hot-reload configuration without page refresh
 * Polls a config source and notifies subscribers of changes
 */

type ConfigValue = string | number | boolean | null;
type ConfigMap = Record<string, ConfigValue>;

const current: ConfigMap = {};
const watchers = new Map<string, Set<(val: ConfigValue, prev: ConfigValue) => void>>();
let pollTimer: ReturnType<typeof setInterval> | null = null;

export function setConfig(key: string, value: ConfigValue): void {
  const prev = current[key];
  if (prev === value) return;
  current[key] = value;
  watchers.get(key)?.forEach(fn => fn(value, prev));
  watchers.get('*')?.forEach(fn => fn(value, prev));
}

export function getConfig<T extends ConfigValue = ConfigValue>(key: string, fallback?: T): T {
  return (current[key] as T) ?? (fallback as T);
}

export function watchConfig(key: string, cb: (val: ConfigValue, prev: ConfigValue) => void): () => void {
  if (!watchers.has(key)) watchers.set(key, new Set());
  watchers.get(key)!.add(cb);
  return () => watchers.get(key)?.delete(cb);
}

export function bulkUpdate(patch: ConfigMap): string[] {
  const changed: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (current[k] !== v) {
      changed.push(k);
      setConfig(k, v);
    }
  }
  return changed;
}

export function startConfigPolling(fetchFn: () => Promise<ConfigMap>, intervalMs = 30_000): void {
  stopConfigPolling();
  const poll = async () => {
    try {
      const remote = await fetchFn();
      bulkUpdate(remote);
    } catch { /* silent */ }
  };
  poll();
  pollTimer = setInterval(poll, intervalMs);
}

export function stopConfigPolling(): void {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

export function getSnapshot(): ConfigMap {
  return { ...current };
}
