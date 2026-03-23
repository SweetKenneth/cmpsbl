/**
 * DECODE Session Memory Engine — v1.0.0
 * Persistent conversation context across sessions with semantic compression.
 * 
 * Tiers:
 *   HOT   — current session (in-memory, instant)
 *   WARM  — recent sessions (sessionStorage, fast)
 *   COLD  — persistent history (database, durable)
 * 
 * Compression: older turns are summarized into condensed context blocks
 * to stay within token budgets while preserving high-signal exchanges.
 */

// ═══ Types ════════════════════════════════════════════════════════

export interface SessionMemoryEntry {
  id: string;
  sessionId: string;
  role: 'user' | 'system' | 'module';
  content: string;
  intent?: string;
  entities?: Record<string, unknown>;
  importance: number; // 0-1, higher = more important
  timestamp: string;
  compressed?: boolean;
}

export interface CompressedBlock {
  id: string;
  sessionId: string;
  summary: string;
  turnCount: number;
  timeRange: { start: string; end: string };
  topEntities: string[];
  topIntents: string[];
  createdAt: string;
}

export interface SessionMemoryState {
  hot: SessionMemoryEntry[];
  warm: CompressedBlock[];
  cold: CompressedBlock[];
  totalTurns: number;
  lastAccess: string;
}

// ═══ Constants ════════════════════════════════════════════════════

const HOT_LIMIT = 50;
const WARM_LIMIT = 20;
const COMPRESSION_THRESHOLD = 30; // compress after this many HOT turns
const IMPORTANCE_THRESHOLD = 0.6; // keep high-importance turns uncompressed
const STORAGE_KEY_PREFIX = 'decode_session_';

// ═══ In-Memory Store ══════════════════════════════════════════════

const hotMemory = new Map<string, SessionMemoryEntry[]>();
const warmMemory = new Map<string, CompressedBlock[]>();

let idCounter = 0;
function generateId(): string {
  return `smem_${Date.now()}_${++idCounter}`;
}

// ═══ Importance Scoring ═══════════════════════════════════════════

const HIGH_SIGNAL_PATTERNS = [
  /\b(error|fail|crash|bug|broken)\b/i,
  /\b(deploy|launch|release|publish)\b/i,
  /\b(security|breach|vulnerability)\b/i,
  /\b(governor|admin|override)\b/i,
  /\b(decision|approve|reject|confirm)\b/i,
  /\/(govern|set-mode|enable|disable)\b/i,
];

export function scoreImportance(content: string, role: string, intent?: string): number {
  let score = 0.3; // baseline

  // System/module messages are generally more important
  if (role === 'system' || role === 'module') score += 0.1;

  // Check for high-signal patterns
  for (const pattern of HIGH_SIGNAL_PATTERNS) {
    if (pattern.test(content)) {
      score += 0.15;
    }
  }

  // Governor commands are high importance
  if (intent?.startsWith('governor.')) score += 0.2;

  // Longer, substantive messages score higher
  if (content.length > 200) score += 0.1;

  return Math.min(1.0, score);
}

// ═══ Compression ══════════════════════════════════════════════════

export function compressTurns(turns: SessionMemoryEntry[]): CompressedBlock {
  if (turns.length === 0) {
    return {
      id: generateId(),
      sessionId: '',
      summary: 'Empty block',
      turnCount: 0,
      timeRange: { start: '', end: '' },
      topEntities: [],
      topIntents: [],
      createdAt: new Date().toISOString(),
    };
  }

  // Extract top entities and intents
  const entityCounts = new Map<string, number>();
  const intentCounts = new Map<string, number>();

  for (const turn of turns) {
    if (turn.entities) {
      for (const key of Object.keys(turn.entities)) {
        entityCounts.set(key, (entityCounts.get(key) || 0) + 1);
      }
    }
    if (turn.intent) {
      intentCounts.set(turn.intent, (intentCounts.get(turn.intent) || 0) + 1);
    }
  }

  const topEntities = [...entityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const topIntents = [...intentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  // Build summary from high-importance turns
  const highSignal = turns
    .filter(t => t.importance >= IMPORTANCE_THRESHOLD)
    .slice(0, 5);

  const summaryParts = highSignal.map(t => {
    const prefix = t.role === 'user' ? 'User' : 'System';
    const truncated = t.content.length > 80 ? t.content.slice(0, 80) + '…' : t.content;
    return `${prefix}: ${truncated}`;
  });

  const summary = summaryParts.length > 0
    ? summaryParts.join(' | ')
    : `${turns.length} turns covering: ${topIntents.join(', ') || 'general'}`;

  return {
    id: generateId(),
    sessionId: turns[0].sessionId,
    summary,
    turnCount: turns.length,
    timeRange: {
      start: turns[0].timestamp,
      end: turns[turns.length - 1].timestamp,
    },
    topEntities,
    topIntents,
    createdAt: new Date().toISOString(),
  };
}

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record a turn into session memory
 */
export function recordTurn(
  sessionId: string,
  role: 'user' | 'system' | 'module',
  content: string,
  intent?: string,
  entities?: Record<string, unknown>,
): SessionMemoryEntry {
  const entry: SessionMemoryEntry = {
    id: generateId(),
    sessionId,
    role,
    content,
    intent,
    entities,
    importance: scoreImportance(content, role, intent),
    timestamp: new Date().toISOString(),
  };

  // Add to HOT
  let hot = hotMemory.get(sessionId) || [];
  hot.push(entry);

  // Compress if over threshold
  if (hot.length > COMPRESSION_THRESHOLD) {
    const toCompress = hot.slice(0, hot.length - HOT_LIMIT);
    const toKeep = hot.slice(hot.length - HOT_LIMIT);

    // Keep high-importance turns in HOT
    const preserved = toCompress.filter(t => t.importance >= IMPORTANCE_THRESHOLD);
    const compressed = toCompress.filter(t => t.importance < IMPORTANCE_THRESHOLD);

    if (compressed.length > 0) {
      const block = compressTurns(compressed);
      const warmBlocks = warmMemory.get(sessionId) || [];
      warmBlocks.push(block);

      // Limit warm blocks
      if (warmBlocks.length > WARM_LIMIT) {
        warmBlocks.shift();
      }
      warmMemory.set(sessionId, warmBlocks);

      // Persist warm to sessionStorage
      persistWarm(sessionId, warmBlocks);
    }

    hot = [...preserved, ...toKeep];
  }

  hotMemory.set(sessionId, hot);
  return entry;
}

/**
 * Retrieve full session memory state
 */
export function getSessionMemory(sessionId: string): SessionMemoryState {
  const hot = hotMemory.get(sessionId) || [];
  const warm = warmMemory.get(sessionId) || loadWarm(sessionId);

  return {
    hot,
    warm,
    cold: [], // cold tier requires database — stub for now
    totalTurns: hot.length + warm.reduce((s, b) => s + b.turnCount, 0),
    lastAccess: new Date().toISOString(),
  };
}

/**
 * Build context payload for LLM with token budget
 */
export function buildContextPayload(
  sessionId: string,
  maxTokenEstimate: number = 4000,
): { recent: SessionMemoryEntry[]; summaries: string[]; tokenEstimate: number } {
  const state = getSessionMemory(sessionId);
  const recent: SessionMemoryEntry[] = [];
  const summaries: string[] = [];
  let tokenEstimate = 0;

  // Add warm summaries first (oldest context)
  for (const block of state.warm) {
    const blockTokens = Math.ceil(block.summary.length / 4);
    if (tokenEstimate + blockTokens > maxTokenEstimate * 0.3) break;
    summaries.push(block.summary);
    tokenEstimate += blockTokens;
  }

  // Add HOT turns (newest, most relevant)
  const sortedHot = [...state.hot].reverse();
  for (const turn of sortedHot) {
    const turnTokens = Math.ceil(turn.content.length / 4);
    if (tokenEstimate + turnTokens > maxTokenEstimate) break;
    recent.unshift(turn);
    tokenEstimate += turnTokens;
  }

  return { recent, summaries, tokenEstimate };
}

/**
 * Clear session memory
 */
export function clearSessionMemory(sessionId: string): void {
  hotMemory.delete(sessionId);
  warmMemory.delete(sessionId);
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
  } catch { /* SSR safe */ }
}

/**
 * Get all active session IDs
 */
export function getActiveSessionIds(): string[] {
  return [...hotMemory.keys()];
}

// ═══ Persistence Helpers ══════════════════════════════════════════

function persistWarm(sessionId: string, blocks: CompressedBlock[]): void {
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY_PREFIX}${sessionId}`,
      JSON.stringify(blocks),
    );
  } catch { /* SSR safe / quota exceeded */ }
}

function loadWarm(sessionId: string): CompressedBlock[] {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    if (raw) {
      const blocks = JSON.parse(raw);
      warmMemory.set(sessionId, blocks);
      return blocks;
    }
  } catch { /* SSR safe */ }
  return [];
}
