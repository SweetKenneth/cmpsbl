/**
 * useDefenseAlerts — UI hook for real-time DEFENSE alert stream
 * Subscribes to the defense event bus and provides the latest alerts.
 *
 * Returns:
 *  - alerts: last 20 alerts sorted by severity + timestamp
 *  - stats: event bus statistics
 *  - clear: function to dismiss alerts from view
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onDefenseEvent,
  getRecentAlerts,
  getEventBusStats,
  type DefenseAlertEvent,
} from '@/lib/substrate/defense/defense-events';

export interface UseDefenseAlertsReturn {
  alerts: readonly DefenseAlertEvent[];
  stats: ReturnType<typeof getEventBusStats>;
  hasActiveThreats: boolean;
  highestSeverity: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'none';
  clear: () => void;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export function useDefenseAlerts(limit = 20): UseDefenseAlertsReturn {
  const [alerts, setAlerts] = useState<readonly DefenseAlertEvent[]>(() => getRecentAlerts(limit));
  const [stats, setStats] = useState(() => getEventBusStats());
  const dismissedRef = useRef(new Set<string>());

  useEffect(() => {
    const unsubscribe = onDefenseEvent(() => {
      const recent = getRecentAlerts(limit);
      // Filter out dismissed alerts
      const filtered = dismissedRef.current.size > 0
        ? recent.filter(a => !dismissedRef.current.has(a.id))
        : recent;
      setAlerts(filtered);
      setStats(getEventBusStats());
    });

    return unsubscribe;
  }, [limit]);

  const clear = useCallback(() => {
    for (const alert of alerts) {
      dismissedRef.current.add(alert.id);
    }
    setAlerts([]);
    // Cap dismissed set
    if (dismissedRef.current.size > 200) {
      const arr = [...dismissedRef.current];
      dismissedRef.current = new Set(arr.slice(arr.length - 100));
    }
  }, [alerts]);

  // Compute derived state
  const activeAlerts = alerts.filter(a => a.verdict !== 'clean');
  const hasActiveThreats = activeAlerts.length > 0;

  let highestSeverity: UseDefenseAlertsReturn['highestSeverity'] = 'none';
  for (const alert of activeAlerts) {
    if ((SEVERITY_ORDER[alert.severity] || 0) > (SEVERITY_ORDER[highestSeverity] || 0)) {
      highestSeverity = alert.severity;
    }
  }

  return { alerts, stats, hasActiveThreats, highestSeverity, clear };
}

export default useDefenseAlerts;
