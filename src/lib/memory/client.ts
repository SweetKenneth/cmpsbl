/**
 * Memory Client - Internal memory operations
 * 
 * All internals are hidden from users:
 * - vectorization
 * - salience scoring
 * - decay logic
 * - recall heuristics
 */

import { supabase } from '@/integrations/supabase/client';

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  relevance?: number;
}

export interface RecallResult {
  memories: MemoryEntry[];
  confidence: number;
}

export class MemoryClient {
  private agentId: string;
  private scope: 'session' | 'project';
  private sessionId: string;
  
  constructor(agentId: string, scope: 'session' | 'project' = 'project') {
    this.agentId = agentId;
    this.scope = scope;
    this.sessionId = this.generateSessionId();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Extract discrete facts from text using pattern matching
   * Returns clean fact strings suitable for storage
   */
  private extractFacts(text: string): string[] {
    const patterns = [
      /\bmy\s+(\w[\w\s]{0,30}?)\s+(?:is|are|was|were)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi(?:'m|\s+am)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi\s+(?:like|love|hate|prefer|enjoy|want|need)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\b(?:my\s+name\s+is|call\s+me|i'm\s+called)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi\s+(?:live\s+in|am\s+from|come\s+from)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\b(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)(.+?)(?:\.|$)/gi,
    ];
    
    const facts: string[] = [];
    for (const pattern of patterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        let fact = match[0].trim()
          .replace(/^(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)/i, '')
          .trim();
        if (fact.length > 3 && fact.length < 200) {
          facts.push(fact);
        }
      }
    }
    return [...new Set(facts)];
  }

  /**
   * Store a memory (internal - hidden from users)
   * Handles: fact extraction, salience scoring, bounded storage
   */
  async store(content: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      // Auto-extract facts for high-fidelity recall
      const facts = this.extractFacts(content);
      
      // Store each fact individually with high confidence
      if (facts.length > 0) {
        for (const fact of facts) {
          await supabase.functions.invoke('pf-substrate', {
            body: {
              module: 'brain',
              action: 'remember',
              content: fact,
              memory_type: 'user_fact',
              confidence: 0.95,
              metadata: {
                agentId: this.agentId,
                scope: this.scope,
                sessionId: this.scope === 'session' ? this.sessionId : undefined,
                source: 'memory_sdk_auto_extract',
                ...metadata
              }
            }
          });
        }
      }
      
      // Also store the full content as context
      const response = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'remember',
          content,
          memory_type: facts.length > 0 ? 'conversation_with_facts' : 'persistent_memory',
          metadata: {
            agentId: this.agentId,
            scope: this.scope,
            sessionId: this.scope === 'session' ? this.sessionId : undefined,
            source: 'memory_sdk',
            facts_extracted: facts.length,
            ...metadata
          }
        }
      });
      
      if (response.error) {
        console.warn('[Memory] Store operation gracefully degraded');
      }
    } catch (error) {
      // Fail silently - memory is enhancement, not requirement
      console.warn('[Memory] Store failed gracefully');
    }
  }
  
  /**
   * Recall relevant memories (internal - hidden from users)
   * Handles: vector search, decay, recall heuristics
   */
  async recall(query: string, limit: number = 5): Promise<RecallResult> {
    try {
      const response = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'query',
          query_text: query,
          limit,
          filters: {
            memory_type: 'persistent_memory',
            'metadata.agentId': this.agentId,
            ...(this.scope === 'session' ? { 'metadata.sessionId': this.sessionId } : {})
          }
        }
      });
      
      if (response.error || !response.data) {
        return { memories: [], confidence: 0 };
      }
      
      const memories = (response.data.memories || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        timestamp: m.created_at,
        relevance: m.relevance_score
      }));
      
      return {
        memories,
        confidence: memories.length > 0 ? 0.8 : 0
      };
    } catch (error) {
      return { memories: [], confidence: 0 };
    }
  }
  
  /**
   * Build context string from recalled memories
   */
  buildContextString(memories: MemoryEntry[]): string {
    if (memories.length === 0) return '';
    
    const contextLines = memories
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 5)
      .map(m => `- ${m.content}`);
    
    return `\n\n[Relevant context from memory]\n${contextLines.join('\n')}`;
  }
}
