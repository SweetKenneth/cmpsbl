/**
 * Hook for Promotion Pipeline dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { getRecentPromotions, getMetricsHistory, getLatestScan, getScanFindings } from '@/lib/substrate/promotion-pipeline';
import type { ProductionPromotion, SystemMetricsPoint, IntegrityScanRun, IntegrityFinding } from '@/lib/substrate/promotion-pipeline/types';

export interface PromotionDashboardData {
  promotions: ProductionPromotion[];
  metricsHistory24h: SystemMetricsPoint[];
  metricsHistory7d: SystemMetricsPoint[];
  metricsHistory30d: SystemMetricsPoint[];
  latestScan: IntegrityScanRun | null;
  latestFindings: IntegrityFinding[];
}

export function usePromotionDashboard(enabled = true) {
  return useQuery<PromotionDashboardData>({
    queryKey: ['promotion-dashboard'],
    queryFn: async () => {
      const [promotions, h24, h7d, h30d, latestScan] = await Promise.all([
        getRecentPromotions(20),
        getMetricsHistory(24),
        getMetricsHistory(168),
        getMetricsHistory(720),
        getLatestScan(),
      ]);

      let latestFindings: IntegrityFinding[] = [];
      if (latestScan) {
        latestFindings = await getScanFindings(latestScan.id);
      }

      return {
        promotions,
        metricsHistory24h: h24,
        metricsHistory7d: h7d,
        metricsHistory30d: h30d,
        latestScan,
        latestFindings,
      };
    },
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
