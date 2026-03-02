/**
 * useForge Hook — FORGE module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as forgeModule from '@/lib/substrate/forge-module';

export interface UseForgeReturn {
  state: ReturnType<typeof useQuery>;
  createBlueprint: ReturnType<typeof useMutation>;
  generate: ReturnType<typeof useMutation>;
  build: ReturnType<typeof useMutation>;
}

export function useForge(): UseForgeReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'forge', 'state'],
    queryFn: () => forgeModule.getForgeState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const createBlueprint = useMutation({
    mutationFn: (params: { name: string; language: forgeModule.ForgeLanguage; artifactType: forgeModule.ForgeArtifactType; specification: string }) =>
      Promise.resolve(forgeModule.createBlueprint(params.name, params.language, params.artifactType, params.specification)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'forge'] }),
  });

  const generate = useMutation({
    mutationFn: (params: { blueprintId: string }) =>
      Promise.resolve(forgeModule.generate(params.blueprintId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'forge'] }),
  });

  const build = useMutation({
    mutationFn: (params: { artifactId: string; deployTarget?: string }) =>
      Promise.resolve(forgeModule.build(params.artifactId, params.deployTarget)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'forge'] }),
  });

  return { state, createBlueprint, generate, build };
}
