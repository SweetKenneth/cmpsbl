/**
 * Nexus Intelligence Feed Hook
 * Real-time AI health and learning updates
 * 
 * Respects debugMode — when enabled, auto-refresh is disabled
 */

import { useState, useEffect } from 'react';
import { getNexusStatus } from '@/lib/nexus/core';
import { getLearningInsights } from '@/lib/nexus/learning';
import { getMetricsSummary } from '@/lib/nexus/metrics';
import { debugMode } from '@/lib/debug-mode';

interface NexusFeed {
  status: any;
  learning: any;
  metrics: any;
  loading: boolean;
  error: string | null;
}

export function useNexusFeed(refreshInterval: number = 5000) {
  const [feed, setFeed] = useState<NexusFeed>({
    status: null,
    learning: null,
    metrics: null,
    loading: true,
    error: null,
  });

  const fetchNexusData = async () => {
    // Skip if debug mode is active
    if (!debugMode.allowPolling()) {
      setFeed(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const [status, learning, metrics] = await Promise.all([
        getNexusStatus(),
        getLearningInsights(),
        getMetricsSummary(),
      ]);

      setFeed({
        status,
        learning,
        metrics,
        loading: false,
        error: null,
      });
    } catch (error) {
      setFeed(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Nexus data',
      }));
    }
  };

  useEffect(() => {
    fetchNexusData();

    const interval = setInterval(() => {
      if (debugMode.allowAutoRefresh()) {
        fetchNexusData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return feed;
}
