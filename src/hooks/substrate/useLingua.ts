/**
 * useLingua Hook — LINGUA module operations
 * Universal Translation & Cross-Modal Communication
 * Full capability surface: translate, schema mapping, bridges, CLM, hardening
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initLingua,
  translate,
  mapSchema,
  getLinguaState,
  getLinguaHealth,
  getLinguaResilience,
  getLinguaHardening,
  upgradeLinguaEngine,
  type Modality,
  type TranslationQuality,
  type FieldMapping,
} from '@/lib/substrate/lingua-module';
import { runLinguaCLM } from '@/lib/substrate/lingua/clm';

export interface UseLinguaReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;

  // Lifecycle
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;

  // Core operations
  translate: ReturnType<typeof useMutation>;
  mapSchema: ReturnType<typeof useMutation>;
}

export function useLingua(): UseLinguaReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'lingua'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'lingua', 'state'],
    queryFn: () => Promise.resolve(getLinguaState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'lingua', 'health'],
    queryFn: () => Promise.resolve(getLinguaHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'lingua', 'resilience'],
    queryFn: () => Promise.resolve(getLinguaResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'lingua', 'hardening'],
    queryFn: () => Promise.resolve(getLinguaHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initLingua()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeLinguaEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => {
      const s = getLinguaState();
      return Promise.resolve(runLinguaCLM(s));
    },
  });

  // ═══ CORE OPERATIONS ═══

  const translateMut = useMutation({
    mutationFn: (params: { content: string; from: Modality; to: Modality; quality?: TranslationQuality }) =>
      Promise.resolve(translate(params.content, params.from, params.to, params.quality)),
    onSuccess: invalidate,
  });

  const mapSchemaMut = useMutation({
    mutationFn: (params: { sourceSchema: string; targetSchema: string; fieldMappings: FieldMapping[] }) =>
      Promise.resolve(mapSchema(params.sourceSchema, params.targetSchema, params.fieldMappings)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    translate: translateMut, mapSchema: mapSchemaMut,
  };
}

export default useLingua;
