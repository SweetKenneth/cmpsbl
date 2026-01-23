import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Type assertions needed until Supabase types sync
const db = supabase as any;

export interface DebuggerSession {
  id: string;
  name: string;
  developer_id: string;
  app_id: string | null;
  entity_id: string | null;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  trace_count: number;
  avg_latency_ms: number | null;
  error_count: number;
  config: Record<string, unknown> | null;
}

export interface DebuggerTrace {
  id: string;
  session_id: string;
  trace_id: string;
  parent_trace_id: string | null;
  module: string;
  action: string;
  status: string;
  latency_ms: number | null;
  memory_mb: number | null;
  input_preview: string | null;
  output_preview: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useDebuggerSessions(limit = 10) {
  return useQuery({
    queryKey: ["debugger-sessions", limit],
    queryFn: async () => {
      const { data, error } = await db.from("debugger_sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as DebuggerSession[];
    },
  });
}

export function useActiveDebuggerSession() {
  return useQuery({
    queryKey: ["active-debugger-session"],
    queryFn: async () => {
      const { data, error } = await db.from("debugger_sessions")
        .select("*")
        .eq("is_active", true)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DebuggerSession | null;
    },
    refetchInterval: 5000,
  });
}

export function useDebuggerTraces(sessionId?: string) {
  return useQuery({
    queryKey: ["debugger-traces", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await db.from("debugger_traces")
        .select("*")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as DebuggerTrace[];
    },
    refetchInterval: 2000,
  });
}

export function useStartDebugger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, appId, entityId }: { name: string; appId?: string; entityId?: string }) => {
      const { data, error } = await db.from("debugger_sessions")
        .insert({
          name,
          app_id: appId,
          entity_id: entityId,
          developer_id: "system",
          is_active: true,
          started_at: new Date().toISOString(),
          trace_count: 0,
          error_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DebuggerSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debugger-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-debugger-session"] });
    },
  });
}

export function useStopDebugger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await db.from("debugger_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debugger-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-debugger-session"] });
    },
  });
}

export function useFlameGraphData(sessionId?: string) {
  const { data: traces } = useDebuggerTraces(sessionId);

  const flameData = traces?.reduce((acc, trace) => {
    if (!trace.parent_trace_id) {
      acc.push({
        name: `${trace.module}.${trace.action}`,
        value: trace.latency_ms || 1,
        status: trace.status,
        trace_id: trace.trace_id,
        children: traces
          .filter((t) => t.parent_trace_id === trace.trace_id)
          .map((child) => ({
            name: `${child.module}.${child.action}`,
            value: child.latency_ms || 1,
            status: child.status,
            trace_id: child.trace_id,
            children: [],
          })),
      });
    }
    return acc;
  }, [] as FlameNode[]);

  return flameData || [];
}

export interface FlameNode {
  name: string;
  value: number;
  status: string;
  trace_id: string;
  children: FlameNode[];
}
