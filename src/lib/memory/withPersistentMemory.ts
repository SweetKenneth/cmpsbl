/**
 * withPersistentMemory - Agent Wrapper Integration
 * 
 * Add persistent memory to any agent.
 * 
 * Usage:
 * ```typescript
 * import { withPersistentMemory } from '@/lib/memory';
 * 
 * const agent = withPersistentMemory({
 *   agentId: 'my-support-agent',
 *   scope: 'project' // or 'session'
 * });
 * 
 * // Use like any async function
 * const response = await agent.respond('How do I reset my password?');
 * ```
 */

import { MemoryClient, type RecallResult } from './client';

export interface MemoryConfig {
  /** Unique identifier for this agent (required) */
  agentId: string;
  /** Memory scope: 'session' (temporary) or 'project' (persistent) */
  scope?: 'session' | 'project';
  /** Optional: Custom response handler for your agent */
  handler?: (input: string, context: MemoryContext) => Promise<string>;
}

export interface MemoryContext {
  /** Recalled memories relevant to the current input */
  memories: string[];
  /** Confidence score of recall (0-1) */
  confidence: number;
  /** Pre-built context string to append to prompts */
  contextString: string;
}

export interface PersistentMemoryAgent {
  /** Send input and get response with automatic memory recall */
  respond: (input: string) => Promise<string>;
  /** Manually remember something important */
  remember: (note: string) => Promise<void>;
  /** Get the current memory context for an input */
  getContext: (input: string) => Promise<MemoryContext>;
  /** Store a workload outcome — what the agent accomplished */
  logWorkload: (summary: string) => Promise<void>;
}

/**
 * Wrap any agent with persistent memory
 * 
 * This wrapper:
 * - Intercepts inputs automatically
 * - Recalls relevant memories
 * - Appends context to your agent
 * - Persists salient outcomes
 * 
 * This wrapper does NOT:
 * - Expose memory internals
 * - Allow custom recall policies
 * - Allow cross-agent canonization
 */
export function withPersistentMemory(config: MemoryConfig): PersistentMemoryAgent {
  const { agentId, scope = 'project', handler } = config;
  const client = new MemoryClient(agentId, scope);
  
  const getContext = async (input: string): Promise<MemoryContext> => {
    const result: RecallResult = await client.recall(input);
    
    return {
      memories: result.memories.map(m => m.content),
      confidence: result.confidence,
      contextString: client.buildContextString(result.memories)
    };
  };
  
  const respond = async (input: string): Promise<string> => {
    try {
      // Run store + recall in parallel — store doesn't block recall
      const [, context] = await Promise.all([
        client.store(input, { type: 'user_input' }),
        getContext(input),
      ]);
      
      if (handler) {
        const response = await handler(input, context);
        // Fire-and-forget — don't block response on interaction logging
        storeInteraction(input, response).catch(() => {});
        return response;
      }
      
      return context.contextString || 'No relevant memories found.';
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] respond failed: ${msg}`);
      return 'Memory unavailable — proceeding without context.';
    }
  };
  
  // FIX #16: Error handling in remember
  const remember = async (note: string): Promise<void> => {
    try {
      await client.store(note, { type: 'manual_note' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] remember failed: ${msg}`);
    }
  };
  
  // FIX #15: Only truncate if string is actually long
  const storeInteraction = async (input: string, response: string): Promise<void> => {
    try {
      const q = input.length > 100 ? `${input.slice(0, 100)}…` : input;
      const a = response.length > 200 ? `${response.slice(0, 200)}…` : response;
      const summary = `Q: ${q} A: ${a}`;
      await client.store(summary, { type: 'interaction' });
    } catch {
      // Silent — interaction logging is best-effort
    }
  };
  
  const logWorkload = async (summary: string): Promise<void> => {
    try {
      await client.storeWorkload(summary, { agentId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] logWorkload failed: ${msg}`);
    }
  };
  
  return {
    respond,
    remember,
    getContext,
    logWorkload
  };
}
