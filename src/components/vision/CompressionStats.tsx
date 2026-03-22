import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileArchive, TrendingDown } from "lucide-react";

interface CompressionData {
  total_compressed: number;
  avg_ratio: number;
  total_savings_kb: number;
}

export default function CompressionStats() {
  const [stats, setStats] = useState<CompressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Query compressed memories from cold storage
      const { data, error } = await supabase
        .from('brain_memory_cold')
        .select('core_summary, compression_ratio, summary')
        .not('core_summary', 'is', null);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalCompressed = data.length;
        const avgRatio = data.reduce((sum, entry) => sum + (entry.compression_ratio || 1), 0) / totalCompressed;
        
        // Estimate storage savings (rough calculation)
        const totalSavingsBytes = data.reduce((sum, entry) => {
          const originalSize = (entry.summary?.length || 0) * (entry.compression_ratio || 1);
          const compressedSize = entry.core_summary?.length || 0;
          return sum + (originalSize - compressedSize);
        }, 0);

        setStats({
          total_compressed: totalCompressed,
          avg_ratio: avgRatio,
          total_savings_kb: totalSavingsBytes / 1024
        });
      } else {
        setStats({
          total_compressed: 0,
          avg_ratio: 1.0,
          total_savings_kb: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch compression stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="w-5 h-5 text-primary" />
          Thought Compression
        </CardTitle>
        <CardDescription>
          Semantic summarization efficiency metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading compression data...</div>
        ) : !stats ? (
          <div className="text-muted-foreground">No compression data yet</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-medium">Avg Compression</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {stats.avg_ratio.toFixed(2)}x
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Entries</div>
                <div className="text-lg font-semibold">{stats.total_compressed}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Savings</div>
                <div className="text-lg font-semibold">{stats.total_savings_kb.toFixed(1)} KB</div>
              </div>
            </div>

            {stats.avg_ratio >= 2.5 && (
              <div className="p-2 rounded bg-neon-green/10 border border-neon-green/20">
                <p className="text-xs text-neon-green">
                  ✓ Optimal compression achieved (target: 2.5x)
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
