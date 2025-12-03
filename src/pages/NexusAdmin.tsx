/**
 * Nexus Router Admin Dashboard
 * Live provider health and routing analytics
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NexusLog {
  id: string;
  provider: string;
  latency_ms: number;
  token_count: number;
  cost_usd_est: number;
  status: 'success' | 'failure';
  route_key: string;
  created_at: string;
}

interface ProviderStats {
  provider: string;
  total_requests: number;
  success_rate: number;
  avg_latency: number;
  last_used: string;
}

export default function NexusAdmin() {
  const [logs, setLogs] = useState<NexusLog[]>([]);
  const [stats, setStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNexusData();
    const interval = setInterval(fetchNexusData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNexusData = async () => {
    try {
      // Fetch recent logs
      const { data: logsData } = await supabase
        .from('nexus_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (logsData) {
        setLogs(logsData as NexusLog[]);
        
        // Calculate provider stats
        const providerMap = new Map<string, { success: number; total: number; latencies: number[]; lastUsed: string }>();
        
        logsData.forEach(log => {
          if (!providerMap.has(log.provider)) {
            providerMap.set(log.provider, { success: 0, total: 0, latencies: [], lastUsed: log.created_at });
          }
          
          const entry = providerMap.get(log.provider)!;
          entry.total++;
          if (log.status === 'success') {
            entry.success++;
            entry.latencies.push(log.latency_ms);
          }
          if (new Date(log.created_at) > new Date(entry.lastUsed)) {
            entry.lastUsed = log.created_at;
          }
        });

        const providerStats: ProviderStats[] = Array.from(providerMap.entries()).map(([provider, data]) => ({
          provider,
          total_requests: data.total,
          success_rate: (data.success / data.total) * 100,
          avg_latency: data.latencies.length > 0 
            ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
            : 0,
          last_used: data.lastUsed
        })).sort((a, b) => b.total_requests - a.total_requests);

        setStats(providerStats);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch Nexus data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'bg-green-500' : 'bg-red-500';
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      google: 'bg-blue-500',
      cerebras: 'bg-purple-500',
      groq: 'bg-orange-500',
      together: 'bg-pink-500',
      deepseek: 'bg-cyan-500',
      hyperbolic: 'bg-yellow-500'
    };
    return colors[provider] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading Nexus analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nexus Router Analytics</h1>
        <Badge variant="outline">Free-Tier Stack Only</Badge>
      </div>

      {/* Provider Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Card key={stat.provider} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold capitalize">{stat.provider}</h3>
              <Badge className={getProviderColor(stat.provider)}>
                {stat.total_requests} calls
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-medium">{stat.success_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Latency:</span>
                <span className="font-medium">{stat.avg_latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Used:</span>
                <span className="font-medium">{new Date(stat.last_used).toLocaleTimeString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Requests Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Routing Events (Last 200)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2">Time</th>
                <th className="pb-2">Provider</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2">Tokens</th>
                <th className="pb-2">Route</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-2">
                    <Badge variant="outline" className={getProviderColor(log.provider)}>
                      {log.provider}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                  </td>
                  <td className="py-2">{log.latency_ms}ms</td>
                  <td className="py-2">{log.token_count}</td>
                  <td className="py-2 text-muted-foreground">{log.route_key}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
