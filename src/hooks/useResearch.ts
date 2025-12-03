import { useState, useEffect } from 'react';
import { 
  submitResearchQuery, 
  getPendingQueries, 
  getHighConfidenceInsights,
  getResearchStats,
  ResearchQuery,
  ResearchInsight
} from '@/lib/research/spine';

export function useResearch() {
  const [stats, setStats] = useState({
    total_queries: 0,
    total_results: 0,
    avg_confidence: 0,
    verified_results: 0,
    verification_rate: 0
  });
  const [insights, setInsights] = useState<ResearchInsight[]>([]);
  const [pendingQueries, setPendingQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, insightsData, queriesData] = await Promise.all([
        getResearchStats(),
        getHighConfidenceInsights(0.7, 10),
        getPendingQueries(5)
      ]);

      setStats(statsData);
      setInsights(insightsData);
      setPendingQueries(queriesData);
    } catch (error) {
      console.error('Failed to fetch research data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuery = async (query: ResearchQuery) => {
    try {
      await submitResearchQuery(query);
      await fetchData(); // Refresh
      return { success: true };
    } catch (error) {
      console.error('Failed to submit query:', error);
      return { success: false, error };
    }
  };

  return {
    stats,
    insights,
    pendingQueries,
    loading,
    submitQuery,
    refresh: fetchData
  };
}
