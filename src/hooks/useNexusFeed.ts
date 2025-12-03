/**
 * Nexus Intelligence Feed Hook
 * Real-time AI health and learning updates
 */

import { useState, useEffect } from 'react';
import { getNexusStatus } from '@/lib/nexus/core';
import { getLearningInsights } from '@/lib/nexus/learning';
import { getMetricsSummary } from '@/lib/nexus/metrics';

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

    const interval = setInterval(fetchNexusData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return feed;
}
