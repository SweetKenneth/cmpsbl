/**
 * usePersistentAgent - React Hook Integration
 * 
 * Add persistent memory to any React component in minutes.
 * No provider setup required beyond import.
 * 
 * Usage:
 * ```tsx
 * import { usePersistentAgent } from '@cmpsbl/memory';
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
 * Works with:
 * - Existing components
 * - Existing agent calls
 * - No provider setup required
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
  
  // Initialize client on mount
  useEffect(() => {
    clientRef.current = new MemoryClient(agentId, scope);
  }, [agentId, scope]);
  
  const respond = useCallback(async (input: string): Promise<MemoryContext> => {
    if (!clientRef.current) {
      clientRef.current = new MemoryClient(agentId, scope);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const client = clientRef.current;
      
      // Auto-store user input first (extracts facts automatically)
      await client.store(input, { type: 'user_input' });
      
      // Then recall relevant memories
      const result = await client.recall(input);
      
      const context: MemoryContext = {
        memories: result.memories.map(m => m.content),
        confidence: result.confidence,
        contextString: client.buildContextString(result.memories)
      };
      
      return context;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Memory operation failed');
      setError(error);
      // Return empty context on error - memory is enhancement, not requirement
      return { memories: [], confidence: 0, contextString: '' };
    } finally {
      setIsLoading(false);
    }
  }, [agentId, scope]);
  
  const remember = useCallback(async (note: string): Promise<void> => {
    if (!clientRef.current) {
      clientRef.current = new MemoryClient(agentId, scope);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await clientRef.current.store(note, { type: 'manual_note' });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Memory store failed');
      setError(error);
      // Fail silently - memory is enhancement
    } finally {
      setIsLoading(false);
    }
  }, [agentId, scope]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    respond,
    remember,
    isLoading,
    error,
    clearError
  };
}
