/**
 * Example: Knowledge Base with Learning
 * 
 * Build a searchable knowledge base that learns and evolves.
 * 
 * BYOK: You must provide your own API keys.
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!
});

interface KnowledgeEntry {
  content: string;
  type: 'fact' | 'concept' | 'procedure' | 'opinion';
  confidence: number;
  source: string;
  metadata?: Record<string, unknown>;
}

interface SearchResult {
  content: string;
  type: string;
  confidence: number;
  relevance: number;
}

class KnowledgeBase {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Add knowledge to the base
   */
  async add(entry: KnowledgeEntry): Promise<boolean> {
    const response = await substrate.brain.remember(
      entry.content,
      entry.type,
      entry.confidence,
      {
        source: entry.source,
        knowledge_base: this.name,
        ...entry.metadata
      }
    );

    if (!response.success) {
      console.error('Failed to add knowledge:', response.error);
      return false;
    }

    console.log(`✓ Added: "${entry.content.substring(0, 50)}..."`);
    return true;
  }

  /**
   * Search the knowledge base
   */
  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await substrate.brain.query(query, limit);

    if (!response.success || !response.data) {
      console.error('Search failed:', response.error);
      return [];
    }

    const data = response.data as any;
    return (data.memories || []).map((m: any) => ({
      content: m.content,
      type: m.memory_type,
      confidence: m.confidence,
      relevance: m.relevance || 1
    }));
  }

  /**
   * Learn from a document or text
   */
  async ingest(document: string, source: string): Promise<number> {
    // Split into chunks for processing
    const chunks = this.splitDocument(document);
    let added = 0;

    for (const chunk of chunks) {
      const success = await this.add({
        content: chunk,
        type: 'fact',
        confidence: 0.8,
        source
      });
      if (success) added++;
    }

    console.log(`Ingested ${added}/${chunks.length} chunks from ${source}`);
    return added;
  }

  /**
   * Get knowledge graph summary
   */
  async getGraphSummary() {
    const response = await substrate.brain.graphSummary();
    return response.data;
  }

  /**
   * Trigger reflection to consolidate knowledge
   */
  async reflect(): Promise<void> {
    console.log('Reflecting on knowledge...');
    await substrate.brain.reflect();
    console.log('Reflection complete');
  }

  /**
   * Synthesize insights from knowledge
   */
  async synthesize() {
    const response = await substrate.brain.synthesize();
    return response.data;
  }

  private splitDocument(doc: string, maxChunkSize = 500): string[] {
    const sentences = doc.split(/[.!?]+/).filter(s => s.trim());
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > maxChunkSize && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += (current ? '. ' : '') + sentence;
      }
    }

    if (current) chunks.push(current.trim());
    return chunks;
  }
}

// Usage example
async function main() {
  const kb = new KnowledgeBase('tech-knowledge');

  // Add some knowledge
  await kb.add({
    content: 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.',
    type: 'concept',
    confidence: 0.95,
    source: 'documentation'
  });

  await kb.add({
    content: 'Neural networks are computing systems inspired by biological neural networks.',
    type: 'concept',
    confidence: 0.9,
    source: 'documentation'
  });

  await kb.add({
    content: 'To train a model: 1) Prepare data 2) Define architecture 3) Train 4) Evaluate 5) Deploy',
    type: 'procedure',
    confidence: 0.85,
    source: 'tutorial'
  });

  // Search
  console.log('\nSearching for "neural networks"...');
  const results = await kb.search('neural networks', 5);
  
  for (const result of results) {
    console.log(`- [${result.type}] ${result.content.substring(0, 80)}...`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  }

  // Get graph summary
  console.log('\nKnowledge graph:');
  const graph = await kb.getGraphSummary();
  console.log(graph);

  // Reflect
  await kb.reflect();
}

main().catch(console.error);

export { KnowledgeBase, KnowledgeEntry, SearchResult };
