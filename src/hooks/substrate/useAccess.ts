/**
 * useAccess Hook
 * v7.0.0 — Dedicated hook for ACCESS (Identity & Billing) module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { access } from '@/lib/substrate';

export interface UseAccessReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  
  // Identity
  identity: ReturnType<typeof useQuery>;
  developer: (developerId?: string) => ReturnType<typeof useQuery>;
  subscription: ReturnType<typeof useQuery>;
  entitlements: ReturnType<typeof useQuery>;
  products: (category?: string) => ReturnType<typeof useQuery>;
  
  // Keys
  listKeys: ReturnType<typeof useQuery>;
  quota: ReturnType<typeof useQuery>;
  
  // Actions
  bootstrap: ReturnType<typeof useMutation>;
  register: ReturnType<typeof useMutation>;
  createKey: ReturnType<typeof useMutation>;
  validateKey: ReturnType<typeof useMutation>;
  revokeKey: ReturnType<typeof useMutation>;
  getUsage: ReturnType<typeof useMutation>;
}

export function useAccess(): UseAccessReturn {
  const queryClient = useQueryClient();
  
  const status = useQuery({
    queryKey: ['substrate', 'access', 'status'],
    queryFn: () => access.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'access', 'pulse'],
    queryFn: () => access.pulse(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const identity = useQuery({
    queryKey: ['substrate', 'access', 'identity'],
    queryFn: () => access.identity(),
    staleTime: 60000,
  });
  
  const developer = (developerId?: string) => useQuery({
    queryKey: ['substrate', 'access', 'developer', developerId],
    queryFn: () => access.developer(developerId),
    staleTime: 60000,
  });
  
  const subscription = useQuery({
    queryKey: ['substrate', 'access', 'subscription'],
    queryFn: () => access.subscription(),
    staleTime: 60000,
  });
  
  const entitlements = useQuery({
    queryKey: ['substrate', 'access', 'entitlements'],
    queryFn: () => access.entitlements(),
    staleTime: 60000,
  });
  
  const products = (category?: string) => useQuery({
    queryKey: ['substrate', 'access', 'products', category],
    queryFn: () => access.products(category),
    staleTime: 120000,
  });
  
  const listKeys = useQuery({
    queryKey: ['substrate', 'access', 'list_keys'],
    queryFn: () => access.listKeys(),
    staleTime: 30000,
  });
  
  const quota = useQuery({
    queryKey: ['substrate', 'access', 'quota'],
    queryFn: () => access.checkQuota(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const bootstrap = useMutation({
    mutationFn: (displayName?: string) => access.bootstrap(displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'access', 'identity'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'access', 'developer'] });
    },
  });
  
  const register = useMutation({
    mutationFn: (displayName?: string) => access.register(displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'access', 'developer'] });
    },
  });
  
  const createKey = useMutation({
    mutationFn: (options: {
      developer_id?: string;
      name?: string;
      scopes?: string[];
      rate_limit_per_minute?: number;
      rate_limit_per_day?: number;
    }) => access.createKey(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'access', 'list_keys'] });
    },
  });
  
  const validateKey = useMutation({
    mutationFn: (apiKey: string) => access.validateKey(apiKey),
  });
  
  const revokeKey = useMutation({
    mutationFn: (keyId: string) => access.revokeKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'access', 'list_keys'] });
    },
  });
  
  const getUsage = useMutation({
    mutationFn: (options?: {
      api_key_id?: string;
      developer_id?: string;
      product_code?: string;
      days?: number;
    }) => access.getUsage(options),
  });
  
  return {
    status,
    pulse,
    identity,
    developer,
    subscription,
    entitlements,
    products,
    listKeys,
    quota,
    bootstrap,
    register,
    createKey,
    validateKey,
    revokeKey,
    getUsage,
  };
}

export default useAccess;
