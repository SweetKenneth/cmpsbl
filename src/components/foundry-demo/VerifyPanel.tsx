/**
 * Verify Panel — Engineer-testable live query interface
 * Uses server-side RPC aggregation to avoid the 1000-row PostgREST limit.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface QueryPreset {
  id: string;
  label: string;
  description: string;
  run: () => Promise<any>;
  format: (data: any) => string;
}

const PRESETS: QueryPreset[] = [
  {
    id: 'total', label: 'Total Discoveries', description: 'SELECT count(*) FROM discoveries',
    run: async () => { const { data } = await supabase.rpc('get_discovery_stats'); return { total: (data as any)?.total ?? 0 }; },
    format: (d) => `Total discoveries: ${d.total}`,
  },
  {
    id: 'perfect', label: 'Perfect Scores (CJPI = 100)', description: "SELECT count(*) FROM discoveries WHERE cjpi = 100",
    run: async () => { const { data } = await supabase.rpc('get_discovery_stats'); return { perfect_count: (data as any)?.perfect_count ?? 0 }; },
    format: (d) => `Discoveries with perfect CJPI 100: ${d.perfect_count}`,
  },
  {
    id: 'tiers', label: 'Tier Breakdown', description: "SELECT tier, count(*) FROM discoveries GROUP BY tier",
    run: async () => { const { data } = await supabase.rpc('get_discovery_stats'); return (data as any)?.tiers ?? {}; },
    format: (d) => Object.entries(d).map(([k, v]) => `  ${k === 'cmpsbl-only' ? 'APEX' : k.toUpperCase()}: ${v}`).join('\n'),
  },
  {
    id: 'categories', label: 'Category Distribution', description: "SELECT category, count(*), avg(cjpi) FROM discoveries GROUP BY category",
    run: async () => { const { data } = await supabase.rpc('get_discovery_stats'); return (data as any)?.categories ?? []; },
    format: (d) => d.map((c: any) => `  ${c.category}: ${c.count} discoveries (avg CJPI ${c.avg_cjpi})`).join('\n'),
  },
  {
    id: 'runs', label: 'Discovery Runs', description: "SELECT count(*), min(created_at), max(created_at) FROM discovery_runs",
    run: async () => {
      const { data } = await supabase.from('discovery_runs').select('created_at').order('created_at', { ascending: true });
      if (!data || data.length === 0) return { count: 0 };
      const first = new Date(data[0].created_at);
      const last = new Date(data[data.length - 1].created_at);
      const hours = ((last.getTime() - first.getTime()) / 3600000).toFixed(1);
      return { count: data.length, first: data[0].created_at, last: data[data.length - 1].created_at, hours };
    },
    format: (d) => `Runs: ${d.count}\nFirst: ${d.first}\nLast: ${d.last}\nElapsed: ${d.hours} hours`,
  },
  {
    id: 'top10', label: 'Top 10 Discoveries', description: "SELECT name, cjpi, tier, category, module_chain FROM discoveries ORDER BY cjpi DESC LIMIT 10",
    run: async () => {
      const { data } = await supabase.from('discoveries').select('name, cjpi, tier, category, module_chain').order('cjpi', { ascending: false }).limit(10);
      return data || [];
    },
    format: (d) => d.map((r: any, i: number) => `  ${i + 1}. ${r.name} — CJPI ${r.cjpi} [${r.tier === 'cmpsbl-only' ? 'APEX' : r.tier.toUpperCase()}]\n     ${r.category} · ${(r.module_chain || []).join(' → ')}`).join('\n'),
  },
  {
    id: 'systems', label: 'System Frequency', description: "Analyze which substrate systems appear most frequently in discoveries",
    run: async () => {
      const { data } = await supabase.rpc('get_discovery_stats');
      const freq = (data as any)?.module_freq ?? {};
      return Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]).map(([sys, count]) => ({ system: sys, appearances: count }));
    },
    format: (d) => d.map((s: any) => `  ${s.system}: ${s.appearances} appearances`).join('\n'),
  },
];

export function VerifyPanel() {
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [runCount, setRunCount] = useState(0);

  async function runQuery(preset: QueryPreset) {
    setActiveQuery(preset.id);
    setLoading(true);
    setResult('');
    try {
      const data = await preset.run();
      setResult(`> ${preset.description}\n\n${preset.format(data)}`);
      setRunCount(c => c + 1);
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  return (
    <section className="py-16 sm:py-20 md:py-40 px-5 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto relative">
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground font-mono">
              Verify It Yourself
            </h2>
            {runCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs sm:text-xs font-mono text-muted-foreground">{runCount} queries executed</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground/60 text-sm sm:text-sm mb-6 sm:mb-8 max-w-2xl">
            Don't take our word for it. Every button below runs a live query against the production
            discovery database. No caching. No mocking.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 mb-4 sm:mb-6">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => runQuery(preset)}
              disabled={loading}
              className={`text-left px-3 sm:px-3 py-2.5 sm:py-2.5 rounded-lg border transition-all text-xs sm:text-xs font-mono min-h-[44px] ${
                activeQuery === preset.id
                  ? 'border-primary/50 bg-primary/5 text-foreground'
                  : 'border-border/20 bg-card/30 text-muted-foreground hover:border-border/40 hover:bg-card/50'
              } disabled:opacity-50`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="bg-card/30 border border-border/20 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4 sm:px-4 py-2.5 border-b border-border/10 bg-muted/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
            </div>
            <span className="text-xs sm:text-xs font-mono text-muted-foreground/50 ml-2">
              live query terminal — production database
            </span>
          </div>
          <div className="p-4 sm:p-4 min-h-[180px] sm:min-h-[200px] max-h-[400px] overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 text-xs sm:text-xs font-mono text-muted-foreground">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border border-primary/50 border-t-primary rounded-full" />
                Querying production database...
              </div>
            ) : result ? (
              <pre className="text-xs sm:text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{result}</pre>
            ) : (
              <div className="text-xs sm:text-xs font-mono text-muted-foreground/40 leading-relaxed">
                Select a query above to run it against the live production database.
                <br /><br />
                Every result is fetched in real-time. No mocks. No cache. Pure receipts.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-xs font-mono text-muted-foreground/40 uppercase tracking-wider leading-relaxed px-2">
            All queries execute against the production database · Read-only · RLS enforced
          </p>
        </div>
      </div>
    </section>
  );
}
