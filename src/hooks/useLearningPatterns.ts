import { useState, useEffect } from 'react';
import { LearningAnalyzer, LearningPattern } from '@/lib/learning/analyzer';

export function useLearningPatterns(patternType?: string) {
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatterns();
  }, [patternType]);

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: LearningPattern[];
      
      if (patternType) {
        data = await LearningAnalyzer.getPatternsByType(patternType);
      } else {
        data = await LearningAnalyzer.getHighConfidencePatterns(0.5);
      }

      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patterns');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchPatterns();
  };

  return { patterns, loading, error, refresh };
}
