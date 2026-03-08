/**
 * Nexus Intelligence Feed Hook
 * Real-time AI health and learning updates
 * 
 * Respects debugMode — when enabled, auto-refresh is disabled
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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

// Minimum refresh intervals to prevent DB hammering
const MIN_REFRESH_MS = 15000;
const LEARNING_STALE_MS = 60000; // Learning insights change rarely — fetch once per minute

export function useNexusFeed(refreshInterval: number = 30000) {
  const safeInterval = Math.max(refreshInterval, MIN_REFRESH_MS);
  const [feed, setFeed] = useState<NexusFeed>({
    status: null,
    learning: null,
    metrics: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);
  const lastLearningFetchRef = useRef(0);

  const fetchNexusData = useCallback(async () => {
    // Skip if debug mode is active
    if (!debugMode.allowPolling()) {
      if (mountedRef.current) setFeed(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const now = Date.now();
      const shouldFetchLearning = now - lastLearningFetchRef.current > LEARNING_STALE_MS;

      const promises: [Promise<any>, Promise<any>, Promise<any>] = [
        getNexusStatus(),
        shouldFetchLearning ? getLearningInsights() : Promise.resolve(null),
        getMetricsSummary(),
      ];

      const [status, learning, metrics] = await Promise.all(promises);

      if (shouldFetchLearning && learning !== null) {
        lastLearningFetchRef.current = now;
      }

      if (mountedRef.current) {
        setFeed(prev => ({
          status,
          learning: learning ?? prev.learning, // Keep previous if skipped
          metrics,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      if (mountedRef.current) {
        setFeed(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch Nexus data',
        }));
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchNexusData();

    const interval = setInterval(() => {
      if (debugMode.allowAutoRefresh()) {
        fetchNexusData();
      }
    }, safeInterval);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [safeInterval, fetchNexusData]);

  return feed;
}
