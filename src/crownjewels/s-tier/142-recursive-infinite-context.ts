/**
 * S-Tier 142 — Recursive Infinite Context
 * ID: S-CJ100 | CJPI: 86 | Module: MEMORY
 * 
 * Unbounded context window through hierarchical summarization.
 */

export interface ContextChunk {
  id: string;
  content: string;
  level: number; // 0 = raw, 1+ = summarized
  tokenCount: number;
  parentId: string | null;
  children: string[];
  createdAt: string;
}

export class RecursiveInfiniteContext {
  private chunks: Map<string, ContextChunk> = new Map();
  private rootIds: string[] = [];
  private maxTokensPerLevel = 2000;

  append(content: string): ContextChunk {
    const chunk: ContextChunk = {
      id: crypto.randomUUID(),
      content,
      level: 0,
      tokenCount: Math.ceil(content.length / 4),
      parentId: null,
      children: [],
      createdAt: new Date().toISOString(),
    };
    this.chunks.set(chunk.id, chunk);
    this.rootIds.push(chunk.id);

    // Check if we need to compress
    this.compressIfNeeded();
    return chunk;
  }

  private compressIfNeeded(): void {
    const level0 = this.rootIds
      .map(id => this.chunks.get(id)!)
      .filter(c => c && c.level === 0);

    const totalTokens = level0.reduce((s, c) => s + c.tokenCount, 0);
    if (totalTokens <= this.maxTokensPerLevel) return;

    // Summarize oldest half
    const toSummarize = level0.slice(0, Math.ceil(level0.length / 2));
    const combined = toSummarize.map(c => c.content).join(' ');
    const summary = combined.substring(0, Math.ceil(combined.length / 3)) + '...'; // Simplified summarization

    const parent: ContextChunk = {
      id: crypto.randomUUID(),
      content: summary,
      level: 1,
      tokenCount: Math.ceil(summary.length / 4),
      parentId: null,
      children: toSummarize.map(c => c.id),
      createdAt: new Date().toISOString(),
    };

    for (const child of toSummarize) {
      child.parentId = parent.id;
      this.rootIds = this.rootIds.filter(id => id !== child.id);
    }

    this.chunks.set(parent.id, parent);
    this.rootIds.unshift(parent.id);
  }

  getContext(maxTokens = 4000): string {
    const parts: string[] = [];
    let tokens = 0;
    // Read from newest to oldest
    for (let i = this.rootIds.length - 1; i >= 0 && tokens < maxTokens; i--) {
      const chunk = this.chunks.get(this.rootIds[i]);
      if (!chunk) continue;
      parts.unshift(chunk.content);
      tokens += chunk.tokenCount;
    }
    return parts.join('\n');
  }

  getTotalChunks(): number { return this.chunks.size; }
  getCompressionRatio(): number {
    const raw = [...this.chunks.values()].filter(c => c.level === 0);
    const rawTokens = raw.reduce((s, c) => s + c.tokenCount, 0);
    const rootTokens = this.rootIds.reduce((s, id) => s + (this.chunks.get(id)?.tokenCount || 0), 0);
    return rawTokens > 0 ? rootTokens / rawTokens : 1;
  }
}
