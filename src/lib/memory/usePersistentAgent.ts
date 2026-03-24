/**
 * usePersistentAgent - React Hook Integration
 * 
 * Add persistent memory to any React component.
 * No provider setup required beyond import.
 * 
 * Usage:
 * ```tsx
 * import { usePersistentAgent } from '@/lib/memory';
 * 
 * function ChatComponent() {
 *   const { respond, remember, isLoading } = usePersistentAgent('my-agent');
 *   
 *   const handleSend = async (message: string) => {
 *     const response = await respond(message);
 *     // Use response...
 *   };
 *   
 *   return <div>...</div>;
 * }
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { MemoryClient } from './client';
import type { MemoryContext } from './withPersistentMemory';

export interface PersistentAgentResult {
  /** Send input and get context with automatic memory recall */
  respond: (input: string) => Promise<MemoryContext>;
  /** Manually remember something important */
  remember: (note: string) => Promise<void>;
  /** Store a workload outcome — what the agent accomplished */
  logWorkload: (summary: string) => Promise<void>;
  /** Current loading state */
  isLoading: boolean;
  /** Last error if any */
  error: Error | null;
  /** Clear any errors */
  clearError: () => void;
}

/**
 * React hook for persistent agent memory
 * 
 * FIX #17: Single client instance via stable ref — no redundant creation
 * 
 * @param agentId - Unique identifier for this agent
 * @param scope - Memory scope: 'session' or 'project' (default: 'project')
 */
export function usePersistentAgent(
  agentId: string,
  scope: 'session' | 'project' = 'project'
): PersistentAgentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<MemoryClient | null>(null);
  
  // FIX #17: Create client once on mount, recreate only when agentId/scope change
  useEffect(() => {
    clientRef.current = new MemoryClient(agentId, scope);
    return () => { clientRef.current = null; };
  }, [agentId, scope]);

  // Stable getter — never creates a new client outside of useEffect
  const getClient = useCallback((): MemoryClient => {
    if (!clientRef.current) {
      clientRef.current = new MemoryClient(agentId, scope);
    }
    return clientRef.current;
  }, [agentId, scope]);
  
  const respond = useCallback(async (input: string): Promise<MemoryContext> => {
    const client = getClient();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Run store + recall in parallel — no dependency between them
      const [, result] = await Promise.all([
        client.store(input, { type: 'user_input' }),
        client.recall(input),
      ]);
      
      // Build context string once — recall already sorted by relevance
      const contextString = client.buildContextString(result.memories);
      const memories = result.memories;
      
      return {
        memories: memories.length <= 8
          ? memories.map(m => m.content)
          : memories.slice(0, 8).map(m => m.content),
        confidence: result.confidence,
        contextString,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Memory operation failed');
      setError(error);
      console.warn(`[Memory] respond error: ${error.message}`);
      return { memories: [], confidence: 0, contextString: '' };
    } finally {
      setIsLoading(false);
    }
  }, [getClient]);
  
  const remember = useCallback(async (note: string): Promise<void> => {
    const client = getClient();
    
    setIsLoading(true);
    setError(null);
    
    try {
      await client.store(note, { type: 'manual_note' });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Memory store failed');
      setError(error);
      console.warn(`[Memory] remember error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [getClient]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const logWorkload = useCallback(async (summary: string): Promise<void> => {
    const client = getClient();
    try {
      await client.storeWorkload(summary);
    } catch (err) {
      console.warn('[Memory] Workload log failed gracefully');
    }
  }, [getClient]);
  
  return {
    respond,
    remember,
    logWorkload,
    isLoading,
    error,
    clearError
  };
}
