/**
 * Minds Intelligence Layer — Session Context Windowing
 * Relevance-weighted memory prioritization.
 * Recent + high-signal > chronological.
 * Prevents runaway memory growth.
 */

import { isFeatureActive } from './featureFlags';

export interface ContextEntry {
  id: string;
  content: string;
  role: 'user' | 'mind' | 'system' | 'tool';
  timestamp: number;
  /** Relevance score: 0-1 */
  relevance: number;
  /** Signal strength: importance × recency × access_frequency */
  signal: number;
  /** Token count estimate */
  tokenEstimate: number;
  /** Associated entities */
  entities: string[];
  /** Whether this entry is pinned (always included) */
  pinned: boolean;
}

export interface ContextWindow {
  entries: ContextEntry[];
  /** Max tokens in window */
  maxTokens: number;
  /** Current token usage */
  currentTokens: number;
  /** Session start time */
  sessionStart: number;
  /** Last activity */
  lastActivity: number;
}

export interface WindowingConfig {
  maxTokens: number;
  maxEntries: number;
  recencyWeight: number;
  relevanceWeight: number;
  frequencyWeight: number;
  pinnedReserveRatio: number;
}

const DEFAULT_CONFIG: WindowingConfig = {
  maxTokens: 8192,
  maxEntries: 50,
  recencyWeight: 0.35,
  relevanceWeight: 0.45,
  frequencyWeight: 0.20,
  pinnedReserveRatio: 0.25,
};

/** Active windows per session */
const windows = new Map<string, ContextWindow>();
const accessCounts = new Map<string, number>();

/** Estimate token count from text */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/** Calculate signal score for an entry */
function calculateSignal(
  entry: ContextEntry,
  now: number,
  config: WindowingConfig
): number {
  // Recency: exponential decay over 30 minutes
  const ageMs = now - entry.timestamp;
  const recency = Math.exp(-ageMs / (30 * 60 * 1000));

  // Frequency: log-scaled access count
  const accessCount = accessCounts.get(entry.id) ?? 1;
  const frequency = Math.min(1, 0.3 + 0.1 * Math.log(accessCount));

  return (
    recency * config.recencyWeight +
    entry.relevance * config.relevanceWeight +
    frequency * config.frequencyWeight
  );
}

/** Get or create a context window */
export function getWindow(sessionId: string, config?: Partial<WindowingConfig>): ContextWindow {
  let window = windows.get(sessionId);
  if (!window) {
    window = {
      entries: [],
      maxTokens: config?.maxTokens ?? DEFAULT_CONFIG.maxTokens,
      currentTokens: 0,
      sessionStart: Date.now(),
      lastActivity: Date.now(),
    };
    windows.set(sessionId, window);
  }
  return window;
}

/** Add an entry to the context window with automatic prioritization */
export function addEntry(
  sessionId: string,
  content: string,
  role: ContextEntry['role'],
  options?: {
    relevance?: number;
    entities?: string[];
    pinned?: boolean;
  }
): ContextEntry {
  if (!isFeatureActive('context_windowing')) {
    // Fallback: simple FIFO
    const window = getWindow(sessionId);
    const entry: ContextEntry = {
      id: `${sessionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      role,
      timestamp: Date.now(),
      relevance: options?.relevance ?? 0.5,
      signal: 0.5,
      tokenEstimate: estimateTokens(content),
      entities: options?.entities ?? [],
      pinned: options?.pinned ?? false,
    };
    window.entries.push(entry);
    if (window.entries.length > 100) window.entries.shift();
    window.currentTokens += entry.tokenEstimate;
    window.lastActivity = Date.now();
    return entry;
  }

  const config = DEFAULT_CONFIG;
  const window = getWindow(sessionId);
  const now = Date.now();

  const entry: ContextEntry = {
    id: `${sessionId}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    role,
    timestamp: now,
    relevance: options?.relevance ?? 0.5,
    signal: 0,
    tokenEstimate: estimateTokens(content),
    entities: options?.entities ?? [],
    pinned: options?.pinned ?? false,
  };

  entry.signal = calculateSignal(entry, now, config);
  window.entries.push(entry);
  window.currentTokens += entry.tokenEstimate;
  window.lastActivity = now;

  // Enforce limits
  enforceWindowLimits(sessionId, config);

  return entry;
}

/** Enforce window size limits using signal-based eviction */
function enforceWindowLimits(sessionId: string, config: WindowingConfig): void {
  const window = windows.get(sessionId);
  if (!window) return;

  const now = Date.now();

  // Recalculate all signals
  for (const entry of window.entries) {
    entry.signal = calculateSignal(entry, now, config);
  }

  // Separate pinned and unpinned
  const pinned = window.entries.filter(e => e.pinned);
  const unpinned = window.entries.filter(e => !e.pinned);

  // Sort unpinned by signal (highest first)
  unpinned.sort((a, b) => b.signal - a.signal);

  // Budget: reserve tokens for pinned entries
  const pinnedTokens = pinned.reduce((sum, e) => sum + e.tokenEstimate, 0);
  const maxPinnedTokens = config.maxTokens * config.pinnedReserveRatio;
  const unpinnedBudget = config.maxTokens - Math.min(pinnedTokens, maxPinnedTokens);

  // Keep entries within budget
  const kept: ContextEntry[] = [...pinned];
  let usedTokens = pinnedTokens;

  for (const entry of unpinned) {
    if (usedTokens + entry.tokenEstimate <= unpinnedBudget && kept.length < config.maxEntries) {
      kept.push(entry);
      usedTokens += entry.tokenEstimate;
    }
  }

  // Sort by timestamp for display order
  kept.sort((a, b) => a.timestamp - b.timestamp);

  window.entries = kept;
  window.currentTokens = usedTokens;
}

/** Get the prioritized context for prompt assembly */
export function getPrioritizedContext(
  sessionId: string,
  maxTokens?: number
): ContextEntry[] {
  const window = windows.get(sessionId);
  if (!window) return [];

  const now = Date.now();
  const config = { ...DEFAULT_CONFIG, maxTokens: maxTokens ?? DEFAULT_CONFIG.maxTokens };

  // Recalculate signals
  for (const entry of window.entries) {
    entry.signal = calculateSignal(entry, now, config);
  }

  const pinned = window.entries.filter(e => e.pinned);
  const unpinned = [...window.entries.filter(e => !e.pinned)].sort((a, b) => b.signal - a.signal);

  const result: ContextEntry[] = [...pinned];
  let tokens = pinned.reduce((sum, e) => sum + e.tokenEstimate, 0);

  for (const entry of unpinned) {
    if (tokens + entry.tokenEstimate > config.maxTokens) break;
    result.push(entry);
    tokens += entry.tokenEstimate;
    // Track access
    accessCounts.set(entry.id, (accessCounts.get(entry.id) ?? 0) + 1);
  }

  return result.sort((a, b) => a.timestamp - b.timestamp);
}

/** Build context string for prompt injection */
export function buildContextString(sessionId: string, maxTokens?: number): string {
  const entries = getPrioritizedContext(sessionId, maxTokens);
  return entries.map(e => `[${e.role}] ${e.content}`).join('\n');
}

/** Pin an entry (always included in window) */
export function pinEntry(sessionId: string, entryId: string): boolean {
  const window = windows.get(sessionId);
  const entry = window?.entries.find(e => e.id === entryId);
  if (!entry) return false;
  entry.pinned = true;
  return true;
}

/** Get window stats */
export function getWindowStats(sessionId: string): {
  entries: number;
  tokens: number;
  pinnedCount: number;
  ageMs: number;
} | null {
  const window = windows.get(sessionId);
  if (!window) return null;
  return {
    entries: window.entries.length,
    tokens: window.currentTokens,
    pinnedCount: window.entries.filter(e => e.pinned).length,
    ageMs: Date.now() - window.sessionStart,
  };
}

/** Clear a session window */
export function clearWindow(sessionId: string): boolean {
  return windows.delete(sessionId);
}

/** Get active window count */
export function getActiveWindowCount(): number {
  return windows.size;
}

/** Cleanup stale windows (>1 hour inactive) */
export function cleanupStaleWindows(): number {
  const now = Date.now();
  const TTL = 60 * 60 * 1000;
  let cleaned = 0;
  for (const [id, window] of windows.entries()) {
    if (now - window.lastActivity > TTL) {
      windows.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}
