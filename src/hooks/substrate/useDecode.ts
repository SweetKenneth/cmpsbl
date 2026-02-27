/**
 * useDecode Hook — DECODE (Interpreter) module operations
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access decode module from substrate singleton
const decode = substrate.decode;

export interface UseDecodeReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  
  // Actions
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
  
  // Personality Subsystem
  const personalityList = useMutation({
    mutationFn: () => decode.personality.list(),
  });
  
  const personalityGet = useMutation({
    mutationFn: () => decode.personality.get(),
  });
  
  const personalitySet = useMutation({
    mutationFn: (profile: string) => decode.personality.set(profile),
    onSuccess: invalidateDecode,
  });
  
  const personalityAuto = useMutation({
    mutationFn: () => decode.personality.auto(),
    onSuccess: invalidateDecode,
  });
  
  const personalityLock = useMutation({
    mutationFn: () => decode.personality.lock(),
    onSuccess: invalidateDecode,
  });
  
  const personalityUnlock = useMutation({
    mutationFn: () => decode.personality.unlock(),
    onSuccess: invalidateDecode,
  });
  
  const personalityDetect = useMutation({
    mutationFn: (text: string) => decode.personality.detect(text),
  });
  
  const personalityInterpret = useMutation({
    mutationFn: (text: string) => decode.personality.interpret(text),
  });
  
  const personalityReset = useMutation({
    mutationFn: () => decode.personality.reset(),
    onSuccess: invalidateDecode,
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
  };
}

export default useDecode;
