/**
 * Support Bot React Hook
 * Governed Evolving Support System
 * 
 * Provides React integration for the support bot engine.
 * Respects debugMode — when enabled, auto-refresh is disabled.
 * Integrated with the 40-primitive / 4-category cognitive architecture.
 */

import { useState, useCallback, useEffect } from 'react';
import { supportBot, SupportBotEngine, DEFAULT_SUPPORT_BOT_CONFIG } from './index';
import { debugMode } from '@/lib/debug-mode';
import type {
  SupportBotState,
  SupportBotConfig,
  SupportResponse,
  SupportCommand,
  SupportCommandResult,
  PatternAnalysis,
  ConversationMessage,
  LearningEvent,
  UserFeedback,
  EscalationReason,
} from './types';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseSupportBotReturn {
  // State
  state: SupportBotState;
  isEnabled: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // Conversation
  messages: ConversationMessage[];
  
  // Core Actions
  ask: (question: string) => Promise<SupportResponse | null>;
  explain: (issueId: string) => Promise<{ explanation: string; sources: string[] } | null>;
  learn: (resolutionId: string) => Promise<LearningEvent | null>;
  escalate: (reason?: EscalationReason) => Promise<{ escalated: boolean; ticket_id: string } | null>;
  
  // Feedback & Patterns
  submitFeedback: (ticketId: string, feedback: UserFeedback) => Promise<boolean>;
  detectPatterns: (lookbackDays?: number) => Promise<PatternAnalysis | null>;
  
  // Session Management
  clearSession: () => void;
  getHistory: (limit?: number) => ConversationMessage[];
  
  // Configuration
  configure: (config: Partial<SupportBotConfig>) => void;
  enable: () => void;
  disable: () => void;
  
  // Low-level
  execute: (command: SupportCommand) => Promise<SupportCommandResult>;
  clearError: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSupportBot(
  config?: Partial<SupportBotConfig>
): UseSupportBotReturn {
  const [state, setState] = useState<SupportBotState>(supportBot.getState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply initial config if provided
  useEffect(() => {
    if (config) {
      supportBot.execute({ type: 'configure', config });
      setState(supportBot.getState());
    }
  }, []);

  // Refresh state periodically (respects debug mode)
  useEffect(() => {
    const interval = setInterval(() => {
      if (debugMode.allowAutoRefresh()) {
        setState(supportBot.getState());
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Wrapper for async operations
  const wrapAsync = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await fn();
      setState(supportBot.getState());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Core execute function
  const execute = useCallback(async (command: SupportCommand): Promise<SupportCommandResult> => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await supportBot.execute(command);
      setState(supportBot.getState());
      if (!result.success) {
        setError(result.error || 'Command failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return {
        success: false,
        command: command.type,
        error: message,
        duration_ms: 0,
        phase_trace: [],
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Ask a question
  const ask = useCallback(async (question: string): Promise<SupportResponse | null> => {
    return wrapAsync(async () => {
      const result = await supportBot.execute({ type: 'ask', question });
      if (result.success && result.data) {
        return result.data as SupportResponse;
      }
      throw new Error(result.error || 'Ask failed');
    });
  }, [wrapAsync]);

  // Explain an issue
  const explain = useCallback(async (issueId: string): Promise<{ explanation: string; sources: string[] } | null> => {
    return wrapAsync(async () => {
      const result = await supportBot.execute({ type: 'explain', issue_id: issueId });
      if (result.success && result.data) {
        return result.data as { explanation: string; sources: string[] };
      }
      throw new Error(result.error || 'Explain failed');
    });
  }, [wrapAsync]);

  // Learn from a resolution
  const learn = useCallback(async (resolutionId: string): Promise<LearningEvent | null> => {
    return wrapAsync(async () => {
      const result = await supportBot.execute({ type: 'learn', resolution_id: resolutionId });
      if (result.success) {
        return result.data as LearningEvent | null;
      }
      throw new Error(result.error || 'Learn failed');
    });
  }, [wrapAsync]);

  // Escalate to human
  const escalate = useCallback(async (reason?: EscalationReason): Promise<{ escalated: boolean; ticket_id: string } | null> => {
    return wrapAsync(async () => {
      const result = await supportBot.execute({ type: 'escalate', reason });
      if (result.success && result.data) {
        return result.data as { escalated: boolean; ticket_id: string };
      }
      throw new Error(result.error || 'Escalate failed');
    });
  }, [wrapAsync]);

  // Submit feedback
  const submitFeedback = useCallback(async (ticketId: string, feedback: UserFeedback): Promise<boolean> => {
    const result = await wrapAsync(async () => {
      const res = await supportBot.execute({ type: 'feedback', ticket_id: ticketId, feedback });
      if (res.success && res.data) {
        return (res.data as { recorded: boolean }).recorded;
      }
      return false;
    });
    return result ?? false;
  }, [wrapAsync]);

  // Detect patterns
  const detectPatterns = useCallback(async (lookbackDays?: number): Promise<PatternAnalysis | null> => {
    return wrapAsync(async () => {
      const result = await supportBot.execute({ type: 'patterns', lookback_days: lookbackDays });
      if (result.success && result.data) {
        return result.data as PatternAnalysis;
      }
      throw new Error(result.error || 'Pattern detection failed');
    });
  }, [wrapAsync]);

  // Session management
  const clearSession = useCallback(() => {
    supportBot.execute({ type: 'purge_session' });
    setState(supportBot.getState());
  }, []);

  const getHistory = useCallback((limit?: number): ConversationMessage[] => {
    return state.current_session?.messages.slice(-(limit || 20)) || [];
  }, [state.current_session]);

  // Configuration
  const configure = useCallback((newConfig: Partial<SupportBotConfig>) => {
    supportBot.execute({ type: 'configure', config: newConfig });
    setState(supportBot.getState());
  }, []);

  const enable = useCallback(() => {
    supportBot.enable();
    setState(supportBot.getState());
  }, []);

  const disable = useCallback(() => {
    supportBot.disable();
    setState(supportBot.getState());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    state,
    isEnabled: state.enabled,
    isProcessing,
    error,
    
    // Conversation
    messages: state.current_session?.messages || [],
    
    // Core Actions
    ask,
    explain,
    learn,
    escalate,
    
    // Feedback & Patterns
    submitFeedback,
    detectPatterns,
    
    // Session Management
    clearSession,
    getHistory,
    
    // Configuration
    configure,
    enable,
    disable,
    
    // Low-level
    execute,
    clearError,
  };
}
