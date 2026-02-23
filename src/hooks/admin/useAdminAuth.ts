import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ["admin-auth", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Use security-definer RPC to bypass RLS
      const { data, error } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error("Admin check error:", error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Keep loading true until BOTH auth session AND role query are resolved
  const isLoading = authLoading || (!!user?.id && roleLoading);

  return { isAdmin, isLoading, user };
}
