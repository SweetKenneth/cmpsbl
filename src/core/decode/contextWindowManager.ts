/**
 * DECODE Context Window Manager — v1.0.0
 * Intelligent context pruning and prioritization when conversation
 * history exceeds token limits.
 * 
 * Strategy:
 *   1. Preserve system instructions (always)
 *   2. Keep most recent N turns (recency bias)
 *   3. Keep high-importance turns (signal preservation)
 *   4. Summarize middle section (compression)
 *   5. Drop low-signal old turns (pruning)
 */

// ═══ Types ════════════════════════════════════════════════════════

export interface ContextItem {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'module';
  content: string;
  importance: number; // 0-1
  tokenEstimate: number;
  timestamp: string;
  pinned?: boolean;
}

export interface ContextWindowConfig {
  maxTokens: number;
  reservedForSystem: number;
  reservedForResponse: number;
  recencyBias: number; // 0-1, higher = more recent turns preserved
  importanceThreshold: number; // below this → candidate for pruning
}

export interface ManagedWindow {
  items: ContextItem[];
  totalTokens: number;
  prunedCount: number;
  summarizedCount: number;
  utilization: number; // 0-1
}

// ═══ Defaults ═════════════════════════════════════════════════════

const DEFAULT_CONFIG: ContextWindowConfig = {
  maxTokens: 8000,
  reservedForSystem: 1000,
  reservedForResponse: 2000,
  recencyBias: 0.7,
  importanceThreshold: 0.4,
};

// ═══ Token Estimation ═════════════════════════════════════════════

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

// ═══ Core Algorithm ═══════════════════════════════════════════════

/**
 * Manage context window — prune, prioritize, and fit within budget
 */
export function manageContextWindow(
  items: ContextItem[],
  config: Partial<ContextWindowConfig> = {},
): ManagedWindow {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const availableTokens = cfg.maxTokens - cfg.reservedForSystem - cfg.reservedForResponse;

  if (availableTokens <= 0) {
    return { items: [], totalTokens: 0, prunedCount: items.length, summarizedCount: 0, utilization: 0 };
  }

  // Step 1: Separate pinned items (always included)
  const pinned = items.filter(i => i.pinned);
  const unpinned = items.filter(i => !i.pinned);

  let pinnedTokens = pinned.reduce((s, i) => s + i.tokenEstimate, 0);
  const remainingBudget = availableTokens - pinnedTokens;

  if (remainingBudget <= 0) {
    // Even pinned items exceed budget — trim pinned
    const trimmedPinned = fitToBudget(pinned, availableTokens);
    return {
      items: trimmedPinned,
      totalTokens: trimmedPinned.reduce((s, i) => s + i.tokenEstimate, 0),
      prunedCount: items.length - trimmedPinned.length,
      summarizedCount: 0,
      utilization: 1,
    };
  }

  // Step 2: Score and sort unpinned items
  const scored = unpinned.map((item, idx) => {
    const recencyScore = idx / Math.max(1, unpinned.length - 1); // 0=oldest, 1=newest
    const compositeScore = item.importance * (1 - cfg.recencyBias) + recencyScore * cfg.recencyBias;
    return { item, compositeScore };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Step 3: Fill budget with highest-scoring items
  const selected: ContextItem[] = [];
  let usedTokens = 0;
  let prunedCount = 0;
  let summarizedCount = 0;

  for (const { item } of scored) {
    if (usedTokens + item.tokenEstimate <= remainingBudget) {
      selected.push(item);
      usedTokens += item.tokenEstimate;
    } else if (item.importance >= cfg.importanceThreshold) {
      // High importance but won't fit — summarize
      const summarized = summarizeItem(item, Math.floor((remainingBudget - usedTokens) * 0.5));
      if (summarized.tokenEstimate > 0 && usedTokens + summarized.tokenEstimate <= remainingBudget) {
        selected.push(summarized);
        usedTokens += summarized.tokenEstimate;
        summarizedCount++;
      } else {
        prunedCount++;
      }
    } else {
      prunedCount++;
    }
  }

  // Step 4: Re-sort by timestamp for chronological order
  selected.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const finalItems = [...pinned, ...selected];
  const totalTokens = pinnedTokens + usedTokens;

  return {
    items: finalItems,
    totalTokens,
    prunedCount,
    summarizedCount,
    utilization: totalTokens / availableTokens,
  };
}

// ═══ Helpers ══════════════════════════════════════════════════════

function fitToBudget(items: ContextItem[], maxTokens: number): ContextItem[] {
  const result: ContextItem[] = [];
  let used = 0;
  // Prioritize most recent
  for (let i = items.length - 1; i >= 0; i--) {
    if (used + items[i].tokenEstimate <= maxTokens) {
      result.unshift(items[i]);
      used += items[i].tokenEstimate;
    }
  }
  return result;
}

function summarizeItem(item: ContextItem, maxTokens: number): ContextItem {
  const maxChars = maxTokens * 4;
  if (maxChars <= 20) {
    return { ...item, content: '', tokenEstimate: 0 };
  }

  // Extract first sentence + key phrases
  const firstSentence = item.content.match(/^[^.!?]+[.!?]/)?.[0] || '';
  const truncated = firstSentence.length > maxChars
    ? firstSentence.slice(0, maxChars) + '…'
    : firstSentence;

  return {
    ...item,
    content: `[Summary] ${truncated}`,
    tokenEstimate: estimateTokens(truncated) + 3,
  };
}

/**
 * Create a context item from raw data
 */
export function createContextItem(
  role: ContextItem['role'],
  content: string,
  options?: { importance?: number; pinned?: boolean },
): ContextItem {
  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    importance: options?.importance ?? 0.5,
    tokenEstimate: estimateTokens(content),
    timestamp: new Date().toISOString(),
    pinned: options?.pinned,
  };
}
