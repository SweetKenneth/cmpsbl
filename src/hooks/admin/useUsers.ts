import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at?: string;
  roles?: { role: string }[];
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get user roles as proxy for users
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform to User format
      return (data || []).map(item => ({
        id: item.user_id,
        email: `user-${item.user_id.substring(0, 8)}@promptfluid.com`,
        display_name: `User ${item.user_id.substring(0, 8)}`,
        created_at: item.created_at,
        roles: [{ role: item.role }]
      })) as User[];
    },
    refetchInterval: 30000,
  });

  // Real-time subscription for user changes
  useEffect(() => {
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: role as any });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  return { users, isLoading, updateRole };
}
