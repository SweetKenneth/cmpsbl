/**
 * CMPSBL® Persistent Memory Adapter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * File-system-backed StorageAdapter with tiered memory (HOT/WARM/COLD)
 * for Forge Super Agent exports. Zero external dependencies.
 *
 * Memory tiers mirror the substrate's MEMORY primitive:
 *   - HOT:  < 24h old — kept in-memory + disk (instant recall)
 *   - WARM: 1–7 days — disk-only (fast recall)
 *   - COLD: 7–90 days — compressed archive (deep recall)
 *   - Expired: > 90 days — auto-purged (configurable via env)
 *
 * Scoping:
 *   - Default: per-agent isolation (~/.cmpsbl/memory/<agent-id>/)
 *   - Shared:  sharedMemory: true → ~/.cmpsbl/memory/_shared/
 *
 * © CMPSBL® — All rights reserved.
 */

// This generates the SOURCE CODE string that gets bundled into export ZIPs.
// It does NOT run at build time — it produces the adapter users run locally.

/**
 * Generate the persistent memory adapter source code for inclusion in exports.
 * Pure TypeScript, zero dependencies beyond Node.js built-ins.
 */
export function generatePersistentMemoryAdapter(): string {
  return `/**
 * CMPSBL® Persistent Memory Adapter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * File-backed tiered storage for Super Agent memory persistence.
 * Implements the StorageAdapter interface from Mini-Runtime™.
 *
 * Tiers: HOT (in-memory + disk) → WARM (disk) → COLD (compressed) → Expired (purged)
 *
 * Zero external dependencies. Uses Node.js fs/path/zlib.
 * © CMPSBL® — All rights reserved.
 */

import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { gzipSync, gunzipSync } from 'zlib';
import type { StorageAdapter } from './standalone-runtime';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface PersistentMemoryConfig {
  /** Agent identifier — used for directory scoping */
  agentId: string;
  /** Base directory for all memory (default: ~/.cmpsbl/memory) */
  baseDir?: string;
  /** Enable shared memory pool across agents (default: false) */
  sharedMemory?: boolean;
  /** HOT tier max age in hours (default: 24) */
  hotMaxHours?: number;
  /** WARM tier max age in days (default: 7) */
  warmMaxDays?: number;
  /** COLD tier max age in days (default: 90, or CMPSBL_MEMORY_TTL_DAYS env) */
  coldMaxDays?: number;
  /** Run tier compaction on every write (default: true) */
  autoCompact?: boolean;
}

type MemoryTier = 'hot' | 'warm' | 'cold';

interface MemoryEnvelope<T = unknown> {
  id: string;
  data: T;
  tier: MemoryTier;
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ADAPTER FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createPersistentStorage(config: PersistentMemoryConfig): StorageAdapter {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  const baseDir = config.baseDir || join(homeDir, '.cmpsbl', 'memory');
  const scope = config.sharedMemory ? '_shared' : config.agentId;
  const root = resolve(baseDir, scope);

  const hotMaxMs = (config.hotMaxHours ?? 24) * 60 * 60 * 1000;
  const warmMaxMs = (config.warmMaxDays ?? 7) * 24 * 60 * 60 * 1000;
  const coldMaxMs = (config.coldMaxDays ?? parseInt(process.env.CMPSBL_MEMORY_TTL_DAYS || '90', 10)) * 24 * 60 * 60 * 1000;
  const autoCompact = config.autoCompact !== false;

  // In-memory HOT cache
  const hotCache = new Map<string, Map<string, MemoryEnvelope>>();

  // Ensure directory structure
  function ensureDir(dir: string): void {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  function collectionDir(collection: string, tier: MemoryTier): string {
    const dir = join(root, tier, collection);
    ensureDir(dir);
    return dir;
  }

  function itemPath(collection: string, id: string, tier: MemoryTier): string {
    const ext = tier === 'cold' ? '.json.gz' : '.json';
    return join(collectionDir(collection, tier), id + ext);
  }

  // ── SERIALIZATION ──

  function writeItem(collection: string, envelope: MemoryEnvelope): void {
    const tier = envelope.tier;
    const path = itemPath(collection, envelope.id, tier);
    const json = JSON.stringify(envelope, null, tier === 'hot' ? 2 : 0);
    if (tier === 'cold') {
      writeFileSync(path, gzipSync(Buffer.from(json, 'utf-8')));
    } else {
      writeFileSync(path, json, 'utf-8');
    }
  }

  function readItem(collection: string, id: string, tier: MemoryTier): MemoryEnvelope | null {
    const path = itemPath(collection, id, tier);
    if (!existsSync(path)) return null;
    try {
      const raw = tier === 'cold'
        ? gunzipSync(readFileSync(path)).toString('utf-8')
        : readFileSync(path, 'utf-8');
      return JSON.parse(raw) as MemoryEnvelope;
    } catch { return null; }
  }

  function deleteItem(collection: string, id: string, tier: MemoryTier): void {
    const path = itemPath(collection, id, tier);
    if (existsSync(path)) unlinkSync(path);
  }

  // ── TIER CLASSIFICATION ──

  function classifyTier(createdAt: string): MemoryTier {
    const age = Date.now() - new Date(createdAt).getTime();
    if (age < hotMaxMs) return 'hot';
    if (age < warmMaxMs) return 'warm';
    return 'cold';
  }

  // ── COMPACTION — migrate items between tiers, purge expired ──

  function compactCollection(collection: string): void {
    for (const tier of ['hot', 'warm', 'cold'] as MemoryTier[]) {
      const dir = join(root, tier, collection);
      if (!existsSync(dir)) continue;

      for (const file of readdirSync(dir)) {
        const id = file.replace(/\\.json(\\.gz)?$/, '');
        const envelope = readItem(collection, id, tier);
        if (!envelope) continue;

        const age = Date.now() - new Date(envelope.createdAt).getTime();

        // Purge expired
        if (age > coldMaxMs) {
          deleteItem(collection, id, tier);
          hotCache.get(collection)?.delete(id);
          continue;
        }

        const correctTier = classifyTier(envelope.createdAt);
        if (correctTier !== tier) {
          // Migrate to correct tier
          deleteItem(collection, id, tier);
          envelope.tier = correctTier;
          writeItem(collection, envelope);
          // Remove from HOT cache if demoted
          if (correctTier !== 'hot') {
            hotCache.get(collection)?.delete(id);
          }
        }
      }
    }
  }

  // ── FIND ACROSS TIERS ──

  function findItem(collection: string, id: string): MemoryEnvelope | null {
    // Check HOT cache first
    const cached = hotCache.get(collection)?.get(id);
    if (cached) return cached;

    // Search tiers in order
    for (const tier of ['hot', 'warm', 'cold'] as MemoryTier[]) {
      const item = readItem(collection, id, tier);
      if (item) {
        // Promote to HOT cache on access
        item.lastAccessedAt = new Date().toISOString();
        item.accessCount++;
        if (!hotCache.has(collection)) hotCache.set(collection, new Map());
        hotCache.get(collection)!.set(id, item);
        return item;
      }
    }
    return null;
  }

  function listAll(collection: string): MemoryEnvelope[] {
    const results = new Map<string, MemoryEnvelope>();

    for (const tier of ['hot', 'warm', 'cold'] as MemoryTier[]) {
      const dir = join(root, tier, collection);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        const id = file.replace(/\\.json(\\.gz)?$/, '');
        if (results.has(id)) continue;
        const item = readItem(collection, id, tier);
        if (item) results.set(id, item);
      }
    }
    return Array.from(results.values());
  }

  // ── STORAGE ADAPTER IMPLEMENTATION ──

  return {
    async get<T>(collection: string, id: string): Promise<T | null> {
      const envelope = findItem(collection, id);
      return envelope ? (envelope.data as T) : null;
    },

    async list<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]> {
      const items = listAll(collection).map(e => e.data as T);
      if (!filter) return items;
      return items.filter(item => {
        for (const [key, value] of Object.entries(filter)) {
          if ((item as any)[key] !== value) return false;
        }
        return true;
      });
    },

    async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
      const existing = findItem(collection, item.id);
      const now = new Date().toISOString();
      const envelope: MemoryEnvelope = {
        id: item.id,
        data: item,
        tier: 'hot',
        createdAt: existing?.createdAt || now,
        lastAccessedAt: now,
        accessCount: (existing?.accessCount || 0) + 1,
      };

      // Write to HOT tier (disk + cache)
      writeItem(collection, envelope);
      if (!hotCache.has(collection)) hotCache.set(collection, new Map());
      hotCache.get(collection)!.set(item.id, envelope);

      if (autoCompact) compactCollection(collection);
    },

    async putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void> {
      for (const item of items) {
        const now = new Date().toISOString();
        const envelope: MemoryEnvelope = {
          id: item.id, data: item, tier: 'hot',
          createdAt: now, lastAccessedAt: now, accessCount: 1,
        };
        writeItem(collection, envelope);
        if (!hotCache.has(collection)) hotCache.set(collection, new Map());
        hotCache.get(collection)!.set(item.id, envelope);
      }
      if (autoCompact) compactCollection(collection);
    },

    async delete(collection: string, id: string): Promise<void> {
      for (const tier of ['hot', 'warm', 'cold'] as MemoryTier[]) {
        deleteItem(collection, id, tier);
      }
      hotCache.get(collection)?.delete(id);
    },

    async count(collection: string): Promise<number> {
      return listAll(collection).length;
    },
  };
}
`;
}

/**
 * Generate a quickstart memory configuration snippet for Forge agent exports.
 * This is the code users see in their quickstart.ts file.
 */
export function generateMemoryQuickstart(agentId: string, agentName: string): string {
  return `// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CONFIGURATION — ${agentName}
// ═══════════════════════════════════════════════════════════════════════════════
// Persistent memory is enabled by default. Your agent remembers across sessions.
//
// Memory tiers:
//   HOT   — last 24h, instant recall (in-memory + disk)
//   WARM  — 1–7 days, fast recall (disk)
//   COLD  — 7–90 days, deep recall (compressed)
//
// Override defaults via environment variables:
//   CMPSBL_MEMORY_TTL_DAYS=90   — max memory retention (default: 90)
//   CMPSBL_MEMORY_SHARED=true   — share memory across all agents
//
// Memory location: ~/.cmpsbl/memory/${agentId}/

import { createPersistentStorage } from './_runtime/persistent-memory';

const storage = createPersistentStorage({
  agentId: '${agentId}',
  sharedMemory: process.env.CMPSBL_MEMORY_SHARED === 'true',
});

// Pass to Mini-Runtime™ init:
// const instance = init({ storage });
`;
}
