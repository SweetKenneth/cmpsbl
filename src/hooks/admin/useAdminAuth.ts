import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminAuth() {
  const { user, isAdmin: contextIsAdmin } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-auth", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Direct table query (most reliable)
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Admin check error:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes (increased for better persistence)
    gcTime: 60 * 60 * 1000, // 1 hour (keeps cached longer)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return { isAdmin, isLoading, user };
}
