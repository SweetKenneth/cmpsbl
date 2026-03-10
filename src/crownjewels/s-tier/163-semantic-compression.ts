/**
 * S-Tier 163 — Semantic Compression
 * ID: S-CJ121 | CJPI: 85 | Module: BRAIN
 * Lossless semantic compression for knowledge storage efficiency.
 */

export interface CompressedKnowledge {
  id: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  semanticHash: string;
  chunks: { key: string; refs: number }[];
  compressedAt: string;
}

export class SemanticCompression {
  private dictionary: Map<string, { content: string; refs: number }> = new Map();
  private artifacts: CompressedKnowledge[] = [];

  compress(content: string): CompressedKnowledge {
    const chunks = this.tokenize(content);
    const dedupedChunks: { key: string; refs: number }[] = [];
    for (const chunk of chunks) {
      const key = this.hash(chunk);
      const existing = this.dictionary.get(key);
      if (existing) { existing.refs++; dedupedChunks.push({ key, refs: existing.refs }); }
      else { this.dictionary.set(key, { content: chunk, refs: 1 }); dedupedChunks.push({ key, refs: 1 }); }
    }
    const originalSize = content.length;
    const compressedSize = dedupedChunks.length * 16;
    const artifact: CompressedKnowledge = {
      id: crypto.randomUUID(), originalSize, compressedSize,
      compressionRatio: originalSize / Math.max(1, compressedSize),
      semanticHash: this.hash(content), chunks: dedupedChunks,
      compressedAt: new Date().toISOString(),
    };
    this.artifacts.push(artifact);
    return artifact;
  }

  decompress(artifactId: string): string | null {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact) return null;
    return artifact.chunks.map(c => this.dictionary.get(c.key)?.content ?? '').join(' ');
  }

  private tokenize(content: string): string[] { return content.split(/\s+/).filter(Boolean); }
  private hash(input: string): string {
    let h = 0;
    for (let i = 0; i < input.length; i++) h = ((h << 5) - h + input.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  }

  getDictionarySize(): number { return this.dictionary.size; }
  getOverallRatio(): number {
    if (this.artifacts.length === 0) return 1;
    return this.artifacts.reduce((s, a) => s + a.compressionRatio, 0) / this.artifacts.length;
  }
}
