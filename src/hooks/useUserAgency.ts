/**
 * Hook to fetch the current user's owned agency
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

export function useUserAgency() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-agency', user?.id],
    queryFn: async (): Promise<UserAgency | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, slug, status, description')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user agency:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
