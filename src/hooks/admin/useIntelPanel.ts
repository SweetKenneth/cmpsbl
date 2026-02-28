/**
 * useIntelPanel — Hook for INTEL Panel data
 * Aggregates signals, runs ENGINEER battery, and produces cards for the Founder-only panel.
 */

import { useQuery } from '@tanstack/react-query';
import { intelAggregator } from '@/lib/control-plane/intel/aggregator';
import { engineerNode } from '@/lib/control-plane/engineer/maintenance';
import { clmTopicPipeline } from '@/lib/control-plane/clm/topic-pipeline';
import { getCrownJewelStats, getReleasedJewelIds, getGatekeptJewelIds } from '@/lib/capabilities/crown-jewel-release-gate';
import type { IntelCard, IntelExportReport, TopicMasteryHighlight } from '@/lib/control-plane/types';

export interface IntelPanelData {
  cards: IntelCard[];
  criticals: IntelCard[];
  summary: ReturnType<typeof intelAggregator.getSummary>;
  engineerStats: ReturnType<typeof engineerNode.getStats>;
  findings: ReturnType<typeof engineerNode.getFindings>;
  proposals: ReturnType<typeof engineerNode.getProposals>;
  topicMastery: TopicMasteryHighlight[];
  crownJewels: ReturnType<typeof getCrownJewelStats>;
  releasedJewels: string[];
  gatekeptJewels: string[];
  exportReport: IntelExportReport;
}

async function fetchIntelData(): Promise<IntelPanelData> {
  // Run engineer battery (non-destructive checks)
  await engineerNode.runMaintenanceBattery();
  
  const cards = intelAggregator.getCards({ limit: 50 });
  const criticals = intelAggregator.getCriticals(10);
  const summary = intelAggregator.getSummary();
  const engineerStats = engineerNode.getStats();
  const findings = engineerNode.getFindings();
  const proposals = engineerNode.getProposals();
  const topicMastery = clmTopicPipeline.getMasteryHighlights();
  const crownJewels = getCrownJewelStats();
  const releasedJewels = getReleasedJewelIds();
  const gatekeptJewels = getGatekeptJewelIds();
  
  // Compute diligence stats from actual diligence cards, not INTEL signal counts
  const diligenceCard = cards.find(c => c.source.includes('diligence') && c.category === 'diligence');
  const diligenceData = diligenceCard?.details_json as { summary?: { total: number; passed: number; minor: number; critical: number } } | undefined;
  const diligenceSummary = diligenceData?.summary;
  
  const exportReport = intelAggregator.generateExportReport(
    topicMastery,
    {
      last_run: engineerStats.last_check ?? undefined,
      passed: diligenceSummary?.passed ?? 0,
      minor: diligenceSummary?.minor ?? 0,
      critical: diligenceSummary?.critical ?? 0,
      total: diligenceSummary?.total ?? 0,
    },
    engineerStats,
  );
  
  return {
    cards, criticals, summary, engineerStats, findings, proposals,
    topicMastery, crownJewels, releasedJewels, gatekeptJewels, exportReport,
  };
}

export function useIntelPanel(enabled = true) {
  return useQuery<IntelPanelData>({
    queryKey: ['control-plane-intel'],
    queryFn: fetchIntelData,
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
    retry: 1,
  });
}
