/**
 * useLingua Hook — LINGUA module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as linguaModule from '@/lib/substrate/lingua-module';

export interface UseLinguaReturn {
  state: ReturnType<typeof useQuery>;
  translate: ReturnType<typeof useMutation>;
  mapSchema: ReturnType<typeof useMutation>;
}

export function useLingua(): UseLinguaReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'lingua', 'state'],
    queryFn: () => linguaModule.getLinguaState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const translate = useMutation({
    mutationFn: (params: { content: string; from: linguaModule.Modality; to: linguaModule.Modality; quality?: linguaModule.TranslationQuality }) =>
      Promise.resolve(linguaModule.translate(params.content, params.from, params.to, params.quality)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'lingua'] }),
  });

  const mapSchema = useMutation({
    mutationFn: (params: { sourceSchema: string; targetSchema: string; fieldMappings: linguaModule.FieldMapping[] }) =>
      Promise.resolve(linguaModule.mapSchema(params.sourceSchema, params.targetSchema, params.fieldMappings)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'lingua'] }),
  });

  return { state, translate, mapSchema };
}
