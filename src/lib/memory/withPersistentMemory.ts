/**
 * withPersistentMemory - Agent Wrapper Integration
 * 
 * Add persistent memory to any agent in 10 minutes.
 * 
 * Usage:
 * ```typescript
 * import { withPersistentMemory } from '@cmpsbl/memory';
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
    // 1. Auto-store the user's input (extracts facts automatically via client)
    await client.store(input, { type: 'user_input' });
    
    // 2. Recall relevant memories
    const context = await getContext(input);
    
    // 3. If custom handler provided, use it
    if (handler) {
      const response = await handler(input, context);
      
      // 4. Store the interaction outcome
      await storeInteraction(input, response);
      
      return response;
    }
    
    // 3. Default: return context for manual integration
    return context.contextString || 'No relevant memories found.';
  };
  
  const remember = async (note: string): Promise<void> => {
    await client.store(note, { type: 'manual_note' });
  };
  
  const storeInteraction = async (input: string, response: string): Promise<void> => {
    // Store condensed interaction summary
    const summary = `Q: ${input.slice(0, 100)}... A: ${response.slice(0, 200)}...`;
    await client.store(summary, { type: 'interaction' });
  };
  
  const logWorkload = async (summary: string): Promise<void> => {
    await client.storeWorkload(summary, { agentId });
  };
  
  return {
    respond,
    remember,
    getContext,
    logWorkload
  };
}
