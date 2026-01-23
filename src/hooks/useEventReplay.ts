import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReplaySession {
  id: string;
  name: string;
  description: string | null;
  developer_id: string;
  app_id: string | null;
  entity_id: string | null;
  start_time: string;
  end_time: string | null;
  event_count: number;
  status: string;
  filters: Record<string, unknown> | null;
  created_at: string;
}

export interface ReplayEvent {
  id: string;
  session_id: string;
  sequence_number: number;
  event_type: string;
  module: string;
  action: string;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  latency_ms: number | null;
  timestamp: string;
}

export function useReplaySessions(limit = 20) {
  return useQuery({
    queryKey: ["replay-sessions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_replay_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as ReplaySession[];
    },
  });
}

export function useReplayEvents(sessionId?: string) {
  return useQuery({
    queryKey: ["replay-events", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_replay_events")
        .select("*")
        .eq("session_id", sessionId!)
        .order("sequence_number", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ReplayEvent[];
    },
  });
}

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, entityId, appId }: { name: string; entityId?: string; appId?: string }) => {
      const { data, error } = await supabase
        .from("event_replay_sessions")
        .insert({
          name,
          entity_id: entityId,
          app_id: appId,
          developer_id: "system",
          status: "recording",
          start_time: new Date().toISOString(),
          event_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ReplaySession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replay-sessions"] });
    },
  });
}

export function useStopRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("event_replay_sessions")
        .update({ status: "completed", end_time: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replay-sessions"] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await supabase.from("event_replay_events").delete().eq("session_id", sessionId);
      const { error } = await supabase.from("event_replay_sessions").delete().eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replay-sessions"] });
    },
  });
}
