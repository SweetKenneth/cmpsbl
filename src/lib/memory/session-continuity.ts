/**
 * CMPSBL® — Universal Session Continuity
 * 
 * Lightweight personality layer for ANY agent that touches
 * Persistent Memory — SDK installs, Ascension exports, Agent ZIPs.
 * 
 * Features:
 *   - Named agents (identity persists across sessions)
 *   - Session bookmarks (welcome-back context)
 *   - Task ledger (lightweight todos in memory)
 *   - Pins (high-priority "come back later" captures)
 *   - Session streaks (momentum tracking)
 *   - Contextual DREAM nudge (for non-CLI environments only)
 * 
 * All state stored in WARM tier memory with reserved key prefixes.
 * Zero API cost. Zero infrastructure. Works offline.
 * 
 * NOTE: This module is for exported/SDK agents. The CLI has its
 * own richer implementation in packages/cli/src/session.ts that
 * adds DREAM-powered projections and cmpsbl next.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AgentIdentity {
  name: string;
  namedAt: string;
}

export interface SessionBookmark {
  summary: string;
  timestamp: string;
  context: Record<string, unknown>;
}

export interface TodoItem {
  id: string;
  text: string;
  createdAt: string;
  completedAt: string | null;
}

export interface PinItem {
  id: string;
  text: string;
  pinnedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalSessions: number;
}

export interface DreamNudge {
  shouldShow: boolean;
  reason: string;
  evidence: string;
}

export interface SessionContinuityState {
  identity: AgentIdentity | null;
  bookmark: SessionBookmark | null;
  todos: TodoItem[];
  pins: PinItem[];
  streak: StreakData;
}

export interface WelcomeBack {
  agentName: string;
  timeSinceLastSession: string;
  bookmark: SessionBookmark | null;
  openTodos: TodoItem[];
  pins: PinItem[];
  streak: StreakData;
  dreamNudge: DreamNudge | null;
}

// ═══════════════════════════════════════════════════════════════
// Reserved memory keys (prefixed to avoid collisions)
// ═══════════════════════════════════════════════════════════════

const KEY_IDENTITY = '_cmpsbl_agent_identity';
const KEY_BOOKMARK = '_cmpsbl_session_bookmark';
const KEY_TODOS = '_cmpsbl_task_ledger';
const KEY_PINS = '_cmpsbl_pins';
const KEY_STREAK = '_cmpsbl_streak';
const KEY_RECALL_PATTERNS = '_cmpsbl_recall_patterns';

// ═══════════════════════════════════════════════════════════════
// Storage adapter interface (works with any persistence layer)
// ═══════════════════════════════════════════════════════════════

export interface SessionStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// File-system adapter (for exports / standalone agents)
// ═══════════════════════════════════════════════════════════════

export function createFileSystemStorage(basePath: string): SessionStorage {
  const ensureDir = () => {
    try {
      const fs = require('fs') as typeof import('fs');
      const path = require('path') as typeof import('path');
      const dir = path.dirname(path.join(basePath, 'session'));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch { /* graceful fallback */ }
  };

  return {
    async get(key: string): Promise<string | null> {
      try {
        const fs = require('fs') as typeof import('fs');
        const path = require('path') as typeof import('path');
        const filePath = path.join(basePath, `${key}.json`);
        if (!fs.existsSync(filePath)) return null;
        return fs.readFileSync(filePath, 'utf-8');
      } catch {
        return null;
      }
    },
    async set(key: string, value: string): Promise<void> {
      try {
        ensureDir();
        const fs = require('fs') as typeof import('fs');
        const path = require('path') as typeof import('path');
        const filePath = path.join(basePath, `${key}.json`);
        fs.writeFileSync(filePath, value);
      } catch { /* best-effort */ }
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// In-memory adapter (for browser / React environments)
// ═══════════════════════════════════════════════════════════════

export function createInMemoryStorage(): SessionStorage {
  const store = new Map<string, string>();
  return {
    async get(key: string): Promise<string | null> {
      return store.get(key) ?? null;
    },
    async set(key: string, value: string): Promise<void> {
      store.set(key, value);
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Session Continuity Engine
// ═══════════════════════════════════════════════════════════════

export class SessionContinuity {
  private storage: SessionStorage;
  private agentId: string;

  constructor(agentId: string, storage: SessionStorage) {
    this.agentId = agentId;
    this.storage = storage;
  }

  // ── Identity ──────────────────────────────────────────────

  async getName(): Promise<string | null> {
    const raw = await this.storage.get(KEY_IDENTITY);
    if (!raw) return null;
    try {
      const identity = JSON.parse(raw) as AgentIdentity;
      return identity.name;
    } catch {
      return null;
    }
  }

  async setName(name: string): Promise<AgentIdentity> {
    const identity: AgentIdentity = { name: name.trim(), namedAt: new Date().toISOString() };
    await this.storage.set(KEY_IDENTITY, JSON.stringify(identity));
    return identity;
  }

  // ── Session Bookmarks ─────────────────────────────────────

  async saveBookmark(summary: string, context: Record<string, unknown> = {}): Promise<void> {
    const bookmark: SessionBookmark = {
      summary,
      timestamp: new Date().toISOString(),
      context,
    };
    await this.storage.set(KEY_BOOKMARK, JSON.stringify(bookmark));
  }

  async getBookmark(): Promise<SessionBookmark | null> {
    const raw = await this.storage.get(KEY_BOOKMARK);
    if (!raw) return null;
    try { return JSON.parse(raw) as SessionBookmark; } catch { return null; }
  }

  // ── Task Ledger ───────────────────────────────────────────

  private async loadTodos(): Promise<TodoItem[]> {
    const raw = await this.storage.get(KEY_TODOS);
    if (!raw) return [];
    try { return JSON.parse(raw) as TodoItem[]; } catch { return []; }
  }

  private async saveTodos(todos: TodoItem[]): Promise<void> {
    // Cap at 100
    const capped = todos.length > 100 ? todos.slice(-100) : todos;
    await this.storage.set(KEY_TODOS, JSON.stringify(capped));
  }

  async addTodo(text: string): Promise<TodoItem> {
    const todos = await this.loadTodos();
    const item: TodoItem = {
      id: `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    todos.push(item);
    await this.saveTodos(todos);
    return item;
  }

  async completeTodo(idOrIndex: string): Promise<TodoItem | null> {
    const todos = await this.loadTodos();
    const idx = parseInt(idOrIndex, 10);
    const incomplete = todos.filter(t => !t.completedAt);

    let target: TodoItem | undefined;
    if (!isNaN(idx) && idx >= 1 && idx <= incomplete.length) {
      target = incomplete[idx - 1];
    } else {
      target = todos.find(t => t.id === idOrIndex && !t.completedAt);
    }

    if (!target) return null;
    target.completedAt = new Date().toISOString();
    await this.saveTodos(todos);
    return target;
  }

  async getOpenTodos(): Promise<TodoItem[]> {
    const todos = await this.loadTodos();
    return todos.filter(t => !t.completedAt);
  }

  // ── Pins ──────────────────────────────────────────────────

  private async loadPins(): Promise<PinItem[]> {
    const raw = await this.storage.get(KEY_PINS);
    if (!raw) return [];
    try { return JSON.parse(raw) as PinItem[]; } catch { return []; }
  }

  private async savePins(pins: PinItem[]): Promise<void> {
    const capped = pins.length > 50 ? pins.slice(-50) : pins;
    await this.storage.set(KEY_PINS, JSON.stringify(capped));
  }

  async addPin(text: string): Promise<PinItem> {
    const pins = await this.loadPins();
    const pin: PinItem = {
      id: `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      text: text.trim(),
      pinnedAt: new Date().toISOString(),
    };
    pins.push(pin);
    await this.savePins(pins);
    return pin;
  }

  async removePin(idOrIndex: string): Promise<boolean> {
    const pins = await this.loadPins();
    const idx = parseInt(idOrIndex, 10);
    let targetId: string | undefined;
    if (!isNaN(idx) && idx >= 1 && idx <= pins.length) {
      targetId = pins[idx - 1]?.id;
    } else {
      targetId = idOrIndex;
    }
    const filtered = pins.filter(p => p.id !== targetId);
    if (filtered.length < pins.length) {
      await this.savePins(filtered);
      return true;
    }
    return false;
  }

  async getPins(): Promise<PinItem[]> {
    return this.loadPins();
  }

  // ── Streak ────────────────────────────────────────────────

  private async loadStreak(): Promise<StreakData> {
    const raw = await this.storage.get(KEY_STREAK);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', totalSessions: 0 };
    try { return JSON.parse(raw) as StreakData; } catch {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', totalSessions: 0 };
    }
  }

  private async saveStreak(streak: StreakData): Promise<void> {
    await this.storage.set(KEY_STREAK, JSON.stringify(streak));
  }

  async recordSession(): Promise<StreakData> {
    const streak = await this.loadStreak();
    const today = new Date().toISOString().slice(0, 10);

    if (streak.lastActiveDate === today) return streak;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = today;
    streak.totalSessions += 1;
    await this.saveStreak(streak);
    return streak;
  }

  // ── DREAM Nudge (exported agents only) ─────────────────────

  async checkDreamNudge(): Promise<DreamNudge | null> {
    // Analyze recall patterns — if recurring similar queries exist, nudge
    const raw = await this.storage.get(KEY_RECALL_PATTERNS);
    if (!raw) return null;

    try {
      const patterns = JSON.parse(raw) as Array<{ query: string; count: number }>;
      const recurring = patterns.filter(p => p.count >= 3);
      if (recurring.length === 0) return null;

      return {
        shouldShow: true,
        reason: `Your agent noticed ${recurring.length} recurring pattern${recurring.length > 1 ? 's' : ''} in your queries that could benefit from autonomous refinement.`,
        evidence: recurring.map(p => p.query).slice(0, 3).join(', '),
      };
    } catch {
      return null;
    }
  }

  async recordRecallPattern(query: string): Promise<void> {
    const raw = await this.storage.get(KEY_RECALL_PATTERNS);
    let patterns: Array<{ query: string; count: number }> = [];
    if (raw) {
      try { patterns = JSON.parse(raw); } catch { patterns = []; }
    }

    // Normalize query for pattern matching
    const normalized = query.toLowerCase().trim().slice(0, 100);
    const existing = patterns.find(p => p.query === normalized);
    if (existing) {
      existing.count += 1;
    } else {
      patterns.push({ query: normalized, count: 1 });
    }

    // Cap at 50 patterns
    if (patterns.length > 50) patterns = patterns.slice(-50);
    await this.storage.set(KEY_RECALL_PATTERNS, JSON.stringify(patterns));
  }

  // ── Welcome-Back ──────────────────────────────────────────

  async getWelcomeBack(): Promise<WelcomeBack> {
    const [name, bookmark, openTodos, pins, streak, dreamNudge] = await Promise.all([
      this.getName(),
      this.getBookmark(),
      this.getOpenTodos(),
      this.getPins(),
      this.loadStreak(),
      this.checkDreamNudge(),
    ]);

    const timeSince = bookmark?.timestamp
      ? formatTimeSince(bookmark.timestamp)
      : 'first session';

    return {
      agentName: name ?? this.agentId,
      timeSinceLastSession: timeSince,
      bookmark,
      openTodos,
      pins,
      streak,
      dreamNudge,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function formatTimeSince(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
}
