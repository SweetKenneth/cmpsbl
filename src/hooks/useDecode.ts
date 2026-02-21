/**
 * promptfluid® useDecode Hook
 * vX.IDENTITY.3 — React hook for Decode interpreter primitive
 * Voice-profile locked. Depth-escalation aware.
 */

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  processDecodeInput, 
  decodeContract,
  validateOutput 
} from '@/lib/contracts/DecodeContract';
import { DecodeInput, DecodeResponse } from '@/lib/contracts/DecodeContractTypes';
import { decode } from '@/lib/substrate';
import { sanitizeClocklessTerminology } from '@/lib/substrate/decode/clockless-identity';
import {
  attachTruthBoundary,
  getInferredQualifier,
  type TruthMode,
} from '@/lib/substrate/health-registry';
import {
  queryMetricsForDecode,
  formatDecodeResponse,
  getDecodeMode,
} from '@/core/goal';
import { validateTone, enforceTone } from '@/core/decode/voiceProfile';
import { resolveDepth, type UserTier } from '@/core/decode/depthResolver';

interface UseDecodeOptions {
  /** Whether to invoke substrate modules on each query */
  invokeSubstrate?: boolean;
  /** Default intent for queries */
  defaultIntent?: DecodeInput['intent'];
  /** Session ID for context continuity */
  sessionId?: string;
}

interface UseDecodeReturn {
  /** Send a message through Decode */
  interpret: (content: string, intent?: DecodeInput['intent']) => Promise<DecodeResponse | null>;
  
  /** Current response */
  response: DecodeResponse | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Clear current response */
  clear: () => void;
  
  /** Access to raw contract */
  contract: typeof decodeContract;
  
  /** Validate output against conversational constraints */
  validate: typeof validateOutput;
}

/**
 * React hook for interacting with the Decode interpreter primitive
 */
export function useDecode(options: UseDecodeOptions = {}): UseDecodeReturn {
  const { 
    invokeSubstrate = false, 
    defaultIntent = 'interpret',
    sessionId 
  } = options;

  const [response, setResponse] = useState<DecodeResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: DecodeInput) => {
      return processDecodeInput(input);
    },
    onSuccess: (data) => {
      setResponse(data);
    }
  });

  const interpret = useCallback(async (
    content: string, 
    intent?: DecodeInput['intent']
  ): Promise<DecodeResponse | null> => {
    try {
      const result = await mutation.mutateAsync({
        content,
        intent: intent || defaultIntent,
        sessionId,
        invokeSubstrate
      });
      return result;
    } catch (error) {
      console.error('Decode interpret error:', error);
      return null;
    }
  }, [mutation, defaultIntent, sessionId, invokeSubstrate]);

  const clear = useCallback(() => {
    setResponse(null);
  }, []);

  return {
    interpret,
    response,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    clear,
    contract: decodeContract,
    validate: validateOutput
  };
}

/**
 * Simplified hook for direct Decode chat
 */
export function useDecodeChat(sessionId?: string) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }>>([]);

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return null;

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const startTime = Date.now();
      const response = await decode.chat(content, sessionId);
      const processingTime = Date.now() - startTime;

      if (response.success) {
        const data = response.data as any;
        const rawReply = data?.reply || 'I received your thought.';
        const sanitized = sanitizeClocklessTerminology(rawReply);

        // GOAL: Query metrics for telemetry-backed responses
        const metricsResponse = await queryMetricsForDecode();

        // Truth Boundary: tag infrastructure references with provenance
        const boundary = attachTruthBoundary(sanitized, 'decode');
        let reply = boundary.truth_mode === 'inferred_context'
          ? `${getInferredQualifier()} ${sanitized}`
          : sanitized;

        // Voice Profile enforcement — strip assistant tone drift
        const toneCheck = validateTone(reply);
        if (!toneCheck.valid) {
          reply = enforceTone(reply);
        }

        // Resolve depth based on user tier (default CREATOR for now)
        const userTier: UserTier = (data?.userTier as UserTier) || 'CREATOR';
        const depth = resolveDepth(userTier, getDecodeMode());

        // Apply GOAL formatting (snapshot citation in STRICT mode, mismatch warnings)
        reply = formatDecodeResponse(reply, metricsResponse);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
          metadata: {
            provider: data?.provider,
            processingTime,
            module: 'decode',
            truth_mode: boundary.truth_mode,
            attribution: boundary.attribution,
            decodeMode: getDecodeMode(),
            snapshotId: metricsResponse.snapshot?.snapshotId ?? null,
            integrityValid: metricsResponse.integrity?.valid ?? null,
            depthLevel: depth.level,
            userTier: depth.tier,
            toneValid: toneCheck.valid,
          }
        }]);
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'A moment... something shifted. Let me find my way back.',
        timestamp: new Date(),
        metadata: { module: 'fallback' }
      }]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages
  };
}

/**
 * Hook for Decode epistemic operations
 */
export function useDecodeEpistemic() {
  const { contract } = useDecode();

  return useMemo(() => ({
    describe: contract.epistemic.describe,
    interpret: contract.epistemic.interpret,
    reflect: contract.epistemic.reflect,
    pattern: contract.epistemic.pattern,
    project: contract.epistemic.project
  }), [contract]);
}

export default useDecode;
