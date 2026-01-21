/**
 * Hooks to fetch the current user's owned agencies
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserAgency {
  id: string;
  name: string;
  slug: string | null;
  status: string | null;
  description: string | null;
}

/**
 * Fetch all agencies owned by the current user
 */
export function useUserAgencies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-agencies', user?.id],
    queryFn: async (): Promise<UserAgency[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, slug, status, description')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user agencies:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single agency (first one) - for backwards compatibility
 */
export function useUserAgency() {
  const { data: agencies, ...rest } = useUserAgencies();
  
  return {
    ...rest,
    data: agencies?.[0] || null,
  };
}
