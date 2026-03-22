/**
 * useDecode Hook — DECODE (Interpreter) module operations
 * Full capability surface: chat, intent, personality, admin directives, hardening diagnostics
 * Respects debugMode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import {
  issueDirective,
  acknowledgeDirective,
  getPendingDirectives,
  getDirectiveHistory,
  getSubstrateInsights,
  getSubstrateSummary,
} from '@/lib/substrate/decode/admin-directive';
import {
  disambiguateIntent,
  checkIntentRateLimit,
  getRoutingAuditChain,
  verifyRoutingChain,
} from '@/lib/substrate/decode/decode-hardening';

const decode = substrate.decode;

export interface UseDecodeReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  
  // Core Actions
  chat: ReturnType<typeof useMutation>;
  dream: ReturnType<typeof useMutation>;
  propose: ReturnType<typeof useMutation>;
  learn: ReturnType<typeof useMutation>;
  intent: ReturnType<typeof useMutation>;
  
  // Personality Subsystem
  personality: {
    list: ReturnType<typeof useMutation>;
    get: ReturnType<typeof useMutation>;
    set: ReturnType<typeof useMutation>;
    auto: ReturnType<typeof useMutation>;
    lock: ReturnType<typeof useMutation>;
    unlock: ReturnType<typeof useMutation>;
    detect: ReturnType<typeof useMutation>;
    interpret: ReturnType<typeof useMutation>;
    reset: ReturnType<typeof useMutation>;
  };

  // Admin Directives
  directive: ReturnType<typeof useMutation>;
  acknowledgeDirective: ReturnType<typeof useMutation>;
  pendingDirectives: ReturnType<typeof useMutation>;
  directiveHistory: ReturnType<typeof useMutation>;

  // Intelligence
  substrateInsights: ReturnType<typeof useMutation>;
  substrateSummary: ReturnType<typeof useMutation>;

  // Hardening & Diagnostics
  disambiguate: ReturnType<typeof useMutation>;
  rateLimit: ReturnType<typeof useMutation>;
  routingAudit: ReturnType<typeof useMutation>;
  verifyRouting: ReturnType<typeof useMutation>;
}

export function useDecode(): UseDecodeReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateDecode = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'decode'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'decode', 'status'],
    queryFn: () => decode.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const chat = useMutation({
    mutationFn: (params: { message: string; sessionId?: string }) => 
      decode.chat(params.message, params.sessionId),
  });
  
  const dream = useMutation({
    mutationFn: () => decode.dream(),
    onSuccess: invalidateDecode,
  });
  
  const propose = useMutation({
    mutationFn: (idea: string) => decode.propose(idea),
  });
  
  const learn = useMutation({
    mutationFn: (params: { content: string; source?: string }) => 
      decode.learn(params.content, params.source),
    onSuccess: invalidateDecode,
  });
  
  const intent = useMutation({
    mutationFn: (message: string) => decode.intent(message),
  });
  
  // ═══ Personality Subsystem ═══
  const personalityList = useMutation({ mutationFn: () => decode.personality.list() });
  const personalityGet = useMutation({ mutationFn: () => decode.personality.get() });
  const personalitySet = useMutation({ mutationFn: (profile: string) => decode.personality.set(profile), onSuccess: invalidateDecode });
  const personalityAuto = useMutation({ mutationFn: () => decode.personality.auto(), onSuccess: invalidateDecode });
  const personalityLock = useMutation({ mutationFn: () => decode.personality.lock(), onSuccess: invalidateDecode });
  const personalityUnlock = useMutation({ mutationFn: () => decode.personality.unlock(), onSuccess: invalidateDecode });
  const personalityDetect = useMutation({ mutationFn: (text: string) => decode.personality.detect(text) });
  const personalityInterpret = useMutation({ mutationFn: (text: string) => decode.personality.interpret(text) });
  const personalityReset = useMutation({ mutationFn: () => decode.personality.reset(), onSuccess: invalidateDecode });

  // ═══ Admin Directives ═══
  const directiveMut = useMutation({
    mutationFn: (params: Parameters<typeof issueDirective>[0]) =>
      Promise.resolve(issueDirective(params)),
    onSuccess: invalidateDecode,
  });

  const ackDirective = useMutation({
    mutationFn: (params: { directiveId: string; moduleId: string }) =>
      Promise.resolve(acknowledgeDirective(params.directiveId, params.moduleId)),
  });

  const pendingDir = useMutation({
    mutationFn: (moduleId: string) =>
      Promise.resolve(getPendingDirectives(moduleId)),
  });

  const dirHistory = useMutation({
    mutationFn: (limit?: number) =>
      Promise.resolve(getDirectiveHistory(limit)),
  });

  // ═══ Intelligence ═══
  const insights = useMutation({
    mutationFn: (sessionId?: string) =>
      Promise.resolve(getSubstrateInsights(sessionId)),
  });

  const summary = useMutation({
    mutationFn: (sessionId?: string) =>
      Promise.resolve(getSubstrateSummary(sessionId)),
  });

  // ═══ Hardening & Diagnostics ═══
  const disambiguate = useMutation({
    mutationFn: (params: { rawInput: string; candidates: Array<{ intent: string; confidence: number }> }) =>
      Promise.resolve(disambiguateIntent(params.rawInput, params.candidates)),
  });

  const rateLimit = useMutation({
    mutationFn: () => Promise.resolve(checkIntentRateLimit()),
  });

  const routingAudit = useMutation({
    mutationFn: (limit?: number) => Promise.resolve(getRoutingAuditChain(limit)),
  });

  const verifyRouting = useMutation({
    mutationFn: () => Promise.resolve(verifyRoutingChain()),
  });
  
  return {
    status,
    chat,
    dream,
    propose,
    learn,
    intent,
    personality: {
      list: personalityList,
      get: personalityGet,
      set: personalitySet,
      auto: personalityAuto,
      lock: personalityLock,
      unlock: personalityUnlock,
      detect: personalityDetect,
      interpret: personalityInterpret,
      reset: personalityReset,
    },
    directive: directiveMut,
    acknowledgeDirective: ackDirective,
    pendingDirectives: pendingDir,
    directiveHistory: dirHistory,
    substrateInsights: insights,
    substrateSummary: summary,
    disambiguate,
    rateLimit,
    routingAudit,
    verifyRouting,
  };
}

export default useDecode;
