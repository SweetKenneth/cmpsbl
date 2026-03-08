/**
 * useIdentity Hook — IDENTITY zone operations + WebAuthn Passkeys
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { debugMode } from '@/lib/debug-mode';
import * as identityModule from '@/lib/substrate/identity-module';
import { toast } from 'sonner';

export interface UseIdentityReturn {
  state: ReturnType<typeof useQuery>;
  register: ReturnType<typeof useMutation>;
  sign: ReturnType<typeof useMutation>;
  /** Register a new passkey for the current user */
  registerPasskey: (userId: string, displayName: string) => Promise<identityModule.PasskeyRegistrationResult>;
  /** Authenticate using an existing passkey */
  authenticatePasskey: () => Promise<identityModule.PasskeyAuthenticationResult>;
  /** Whether WebAuthn is supported on this device */
  webAuthnSupported: boolean;
  /** Whether passkey auth is loading */
  passkeyLoading: boolean;
}

export function useIdentity(): UseIdentityReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const state = useQuery({
    queryKey: ['substrate', 'identity', 'state'],
    queryFn: () => identityModule.getIdentityState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const register = useMutation({
    mutationFn: (params: { id: string; type: identityModule.ActorType; displayName: string }) =>
      Promise.resolve(identityModule.registerActor(params.id, params.type, params.displayName)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'identity'] }),
  });

  const sign = useMutation({
    mutationFn: (params: { actorId: string; action: string }) =>
      Promise.resolve(identityModule.signAction(params.actorId, params.action)),
  });

  const registerPasskey = useCallback(async (
    userId: string,
    displayName: string
  ): Promise<identityModule.PasskeyRegistrationResult> => {
    setPasskeyLoading(true);
    try {
      const existingIds = Array.from(identityModule.getActorPasskeys(userId));
      const result = await identityModule.registerPasskey(userId, displayName, existingIds);

      if (result.success && result.credential) {
        identityModule.addPasskeyToActor(userId, result.credential.credentialId);
        identityModule.auditPasskeyRegistered(userId, result.credential.credentialId, result.credential.deviceType);
        queryClient.invalidateQueries({ queryKey: ['substrate', 'identity'] });
        toast.success('Passkey registered — your device is now your identity');
      } else if (result.error) {
        toast.error(result.error);
      }

      return result;
    } finally {
      setPasskeyLoading(false);
    }
  }, [queryClient]);

  const authenticatePasskey = useCallback(async (): Promise<identityModule.PasskeyAuthenticationResult> => {
    setPasskeyLoading(true);
    try {
      const result = await identityModule.authenticateWithPasskey();

      if (result.success && result.credentialId) {
        identityModule.auditPasskeyAuthenticated(result.userHandle || 'unknown', result.credentialId);
        queryClient.invalidateQueries({ queryKey: ['substrate', 'identity'] });
        toast.success('Identity verified cryptographically');
      } else if (result.error) {
        identityModule.auditDeviceRejected(result.userHandle || 'unknown', result.error);
        toast.error(result.error);
      }

      return result;
    } finally {
      setPasskeyLoading(false);
    }
  }, [queryClient]);

  return {
    state,
    register,
    sign,
    registerPasskey,
    authenticatePasskey,
    webAuthnSupported: identityModule.isWebAuthnSupported(),
    passkeyLoading,
  };
}
