import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RevenueMetrics {
  mrr: number;
  mrr_growth: number;
  active_subscribers: number;
  subscriber_growth: number;
  total_api_calls: number;
  api_growth: number;
  churn_rate: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  subscribers: number;
}

export interface BillingData {
  metrics: RevenueMetrics;
  chart_data: ChartDataPoint[];
}

export function useBilling() {
  const { data: billing, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('pf-admin-revenue', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (!data?.success) {
        const errorMsg = data?.error || "Failed to fetch revenue data";
        const hint = data?.hint;
        throw new Error(hint ? `${errorMsg}\n\n${hint}` : errorMsg);
      }

      return data as BillingData;
    },
    refetchInterval: 30000,
    retry: false, // Don't retry on invalid API key
    refetchOnWindowFocus: false,
  });

  return { billing, isLoading, error, refetch };
}
