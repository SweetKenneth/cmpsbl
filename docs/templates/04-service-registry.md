# Service Registry

> Zero-dependency, drop-in service discovery engine with dependency resolution, health monitoring, lifecycle management, and topological ordering.

## What It Does

A complete service registry for managing entities (services, modules, capabilities) with dependency-aware activation, automated health checks, lifecycle events, circular dependency detection, and topological boot ordering.

## Use Cases

- **Microservice discovery** — Register, discover, and monitor services
- **Plugin systems** — Dependency-aware loading with lifecycle hooks
- **Module management** — Boot ordering, health tracking, graceful degradation
- **IoT device management** — Register devices with health monitoring

## Drop-In Instructions

1. Copy into `src/lib/service-registry.ts`
2. Register entities with dependencies
3. Activate in dependency order

```typescript
import { createServiceRegistry } from './service-registry';

const registry = createServiceRegistry();

// Register with dependencies
registry.register({ id: 'database', type: 'module', tags: ['storage'] });
registry.register({ id: 'cache', type: 'module', tags: ['performance'] });
registry.register({
  id: 'api-server',
  type: 'module',
  dependencies: ['database', 'cache'],
  healthCheck: async () => {
    const res = await fetch('/health');
    return res.ok ? 1.0 : 0.0;
  },
});

// Activate in dependency order
const bootOrder = registry.resolveDependencyOrder();
// → ['database', 'cache', 'api-server']

for (const id of bootOrder) {
  registry.activate(id);
}

// Discover services
const active = registry.discover({ status: 'active', minHealth: 0.5 });

// Listen for lifecycle events
registry.on('*', (entity, event) => {
  console.log(`${entity.id}: ${event}`);
});

// Periodic health checks
setInterval(() => registry.runHealthChecks(), 30000);
```

## Full Source

```typescript
/**
 * Service Registry — Dependency-aware service discovery + health monitoring
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type EntityStatus = 'registered' | 'active' | 'degraded' | 'decommissioned';
type EntityType = 'module' | 'capability' | 'pipeline' | 'connector' | 'config';

interface RegistryEntity {
  id: string;
  type: EntityType;
  status: EntityStatus;
  version: string;
  metadata: Record<string, unknown>;
  dependencies: string[];
  healthScore: number;
  registeredAt: number;
  lastHealthCheck: number;
  tags: string[];
}

interface DiscoveryQuery {
  type?: EntityType;
  status?: EntityStatus;
  tags?: string[];
  minHealth?: number;
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createServiceRegistry() {
  const entities = new Map<string, RegistryEntity>();
  const healthChecks = new Map<string, () => Promise<number> | number>();
  const listeners = new Map<string, Array<(entity: RegistryEntity, event: string) => void>>();

  function emit(entityId: string, event: string) {
    const entity = entities.get(entityId);
    if (!entity) return;
    for (const listener of listeners.get('*') ?? []) listener(entity, event);
    for (const listener of listeners.get(entityId) ?? []) listener(entity, event);
  }

  function register(params: {
    id: string;
    type: EntityType;
    version?: string;
    metadata?: Record<string, unknown>;
    dependencies?: string[];
    tags?: string[];
    healthCheck?: () => Promise<number> | number;
  }): RegistryEntity {
    if (entities.has(params.id)) throw new Error(`Entity '${params.id}' already registered.`);
    const entity: RegistryEntity = {
      id: params.id,
      type: params.type,
      status: 'registered',
      version: params.version ?? '1.0.0',
      metadata: params.metadata ?? {},
      dependencies: params.dependencies ?? [],
      healthScore: 1.0,
      registeredAt: Date.now(),
      lastHealthCheck: Date.now(),
      tags: params.tags ?? [],
    };
    entities.set(params.id, entity);
    if (params.healthCheck) healthChecks.set(params.id, params.healthCheck);
    emit(params.id, 'registered');
    return entity;
  }

  function activate(id: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    for (const dep of entity.dependencies) {
      const d = entities.get(dep);
      if (!d || d.status !== 'active')
        throw new Error(`Cannot activate '${id}': dependency '${dep}' not active`);
    }
    entity.status = 'active';
    emit(id, 'activated');
    return true;
  }

  function degrade(id: string, reason?: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    entity.status = 'degraded';
    entity.metadata._degradeReason = reason;
    emit(id, 'degraded');
    return true;
  }

  function decommission(id: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    for (const [, e] of entities) {
      if (e.status === 'active' && e.dependencies.includes(id))
        throw new Error(`Cannot decommission '${id}': '${e.id}' depends on it`);
    }
    entity.status = 'decommissioned';
    emit(id, 'decommissioned');
    return true;
  }

  function discover(query: DiscoveryQuery): RegistryEntity[] {
    let results = [...entities.values()];
    if (query.type) results = results.filter((e) => e.type === query.type);
    if (query.status) results = results.filter((e) => e.status === query.status);
    if (query.minHealth !== undefined) results = results.filter((e) => e.healthScore >= query.minHealth!);
    if (query.tags?.length) results = results.filter((e) => query.tags!.some((t) => e.tags.includes(t)));
    return results;
  }

  async function runHealthChecks(): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    for (const [id, check] of healthChecks) {
      try {
        const score = await check();
        const entity = entities.get(id);
        if (entity) {
          entity.healthScore = Math.max(0, Math.min(1, score));
          entity.lastHealthCheck = Date.now();
          if (score < 0.3 && entity.status === 'active') degrade(id, 'Health below threshold');
        }
        results.set(id, score);
      } catch {
        const entity = entities.get(id);
        if (entity) { entity.healthScore = 0; degrade(id, 'Health check failed'); }
        results.set(id, 0);
      }
    }
    return results;
  }

  function resolveDependencyOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visiting = new Set<string>();
    function visit(id: string) {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`Circular dependency detected involving '${id}'`);
      visiting.add(id);
      const entity = entities.get(id);
      if (entity) for (const dep of entity.dependencies) visit(dep);
      visiting.delete(id);
      visited.add(id);
      order.push(id);
    }
    for (const id of entities.keys()) visit(id);
    return order;
  }

  function getDependents(id: string): string[] {
    return [...entities.values()].filter((e) => e.dependencies.includes(id)).map((e) => e.id);
  }

  function on(key: string, listener: (entity: RegistryEntity, event: string) => void) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key)!.push(listener);
  }

  function getStats() {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalHealth = 0;
    for (const e of entities.values()) {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
      totalHealth += e.healthScore;
    }
    return {
      total: entities.size,
      byType,
      byStatus,
      avgHealth: entities.size > 0 ? totalHealth / entities.size : 0,
    };
  }

  return {
    register,
    activate,
    degrade,
    decommission,
    discover,
    runHealthChecks,
    resolveDependencyOrder,
    getDependents,
    on,
    getStats,
    get: (id: string) => entities.get(id),
    has: (id: string) => entities.has(id),
    all: () => [...entities.values()],
    size: () => entities.size,
  };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `register(params)` | Register a new entity with dependencies and health check |
| `activate(id)` | Activate — fails if dependencies aren't active |
| `decommission(id)` | Remove — fails if other active entities depend on it |
| `discover(query)` | Find entities by type, status, tags, health |
| `resolveDependencyOrder()` | Topological sort for boot ordering |
| `runHealthChecks()` | Execute all health checks, auto-degrade unhealthy |
| `getDependents(id)` | Find all entities that depend on this one |
| `on(key, listener)` | Listen for lifecycle events (`*` for all) |

## License

MIT — Drop in anywhere.
