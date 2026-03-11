/**
 * Discovered Pipelines — Top 100 autonomous compositions from the Memory Stream
 * The substrate's most valuable execution paths, scored and ranked.
 */
import { Helmet } from 'react-helmet-async';
import { useDiscoveredPipelines } from '@/hooks/useDiscoveredPipelines';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Cpu, Sparkles, Network, Zap, Shield, Brain, Eye, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  apex: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', label: 'APEX' },
  mythic: { bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/30', label: 'MYTHIC' },
  relic: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border/40', label: 'RELIC' },
  prime: { bg: 'bg-secondary/50', text: 'text-secondary-foreground', border: 'border-border/30', label: 'PRIME' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  governance: Shield, orchestration: Network, cognitive: Brain, security: Shield,
  learning: Sparkles, observability: Eye, acquisition: Zap, evolution: GitBranch,
  synthesis: Cpu, integration: Layers, privacy: Shield, ethics: Shield,
  routing: Network, contracts: Layers, localization: Layers,
};

export default function DiscoveredPipelines() {
  const { data: pipelines, isLoading } = useDiscoveredPipelines(100);

  const topTen = pipelines?.filter(p => p.curated) || [];
  const remaining = pipelines?.filter(p => !p.curated) || [];

  const totalNodes = pipelines?.reduce((s, p) => s + (p.unique_nodes || 0), 0) || 0;
  const totalValue = pipelines?.reduce((s, p) => s + (p.estimated_value_usd || 0), 0) || 0;
  const avgScore = pipelines?.length
    ? (pipelines.reduce((s, p) => s + p.pipeline_score, 0) / pipelines.length).toFixed(1)
    : '0';

  return (
    <>
      <Helmet>
        <title>Discovered Pipelines — Autonomous Compositions from the Memory Stream</title>
        <meta name="description" content="The substrate's highest-scoring autonomous pipeline compositions. Scored, ranked, and ready for deployment." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-16 px-5 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono font-bold mb-6 tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AUTONOMOUS DISCOVERY
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
                Discovered Pipelines
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed mb-8">
                The Memory Stream autonomously composed and scored these execution paths from{' '}
                <span className="text-foreground font-medium">940+ capabilities</span> across{' '}
                <span className="text-foreground font-medium">40 nodes</span>. Each pipeline chains
                multiple Apex Discoveries into unified superpipelines — ranked by synergy,
                node diversity, and aggregate quality.
              </p>

              {/* Stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: 'Memories Discovered', value: pipelines?.length || 0 },
                  { label: 'Total Node Coverage', value: totalNodes },
                  { label: 'Avg Memory Score', value: avgScore },
                  { label: 'Combined Value', value: `$${(totalValue / 1000).toFixed(0)}K` },
                ].map((stat, i) => (
                  <div key={i} className="bg-card/50 border border-border/20 rounded-xl px-4 py-3">
                    <div className="text-lg sm:text-xl font-black font-mono text-foreground">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Top 10 Curated */}
        {topTen.length > 0 && (
          <section className="px-5 sm:px-6 pb-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground font-mono mb-8 text-center">
                Top 10 — Highest-Scoring Compositions
              </h2>
              <div className="space-y-4">
                {topTen.map((pipeline, i) => (
                  <PipelineCard key={pipeline.id} pipeline={pipeline} index={i} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Remaining */}
        {remaining.length > 0 && (
          <section className="px-5 sm:px-6 pb-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground font-mono mb-8 text-center">
                Extended Discovery — Ranks 11–{10 + remaining.length}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remaining.map((pipeline, i) => (
                  <PipelineCard key={pipeline.id} pipeline={pipeline} index={i + 10} />
                ))}
              </div>
            </div>
          </section>
        )}

        {isLoading && (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 text-muted-foreground font-mono text-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Querying the Memory Stream...
            </div>
          </div>
        )}

        {/* CTA */}
        <section className="px-5 sm:px-6 pb-24 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm mb-6">
              These pipelines represent a fraction of the <span className="text-foreground font-mono font-bold">10²⁹</span> possible execution paths.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/foundry">
                Explore the Memory Stream
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function PipelineCard({ pipeline, index, featured = false }: { pipeline: any; index: number; featured?: boolean }) {
  const tier = TIER_STYLES[pipeline.tier] || TIER_STYLES.prime;
  const Icon = CATEGORY_ICONS[pipeline.category] || Layers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className={`group border rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        featured ? 'bg-card/60 border-border/30' : 'bg-card/30 border-border/15'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Rank */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${tier.bg} ${tier.border} border flex items-center justify-center`}>
          <span className={`text-xs sm:text-sm font-black font-mono ${tier.text}`}>
            {pipeline.rank || index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${tier.bg} ${tier.text}`}>
              {tier.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{pipeline.category}</span>
          </div>

          {/* Codename */}
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1 tracking-tight">
            {pipeline.codename}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">
            {pipeline.description}
          </p>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {pipeline.unique_nodes} nodes
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {pipeline.stage_count} stages
            </span>
            <span className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              {pipeline.cross_sector_count} sectors
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {pipeline.synergy_rating?.toFixed(0)}% synergy
            </span>
            {pipeline.estimated_value_usd > 0 && (
              <span className="text-foreground/60 font-semibold">
                ${(pipeline.estimated_value_usd / 1000).toFixed(0)}K value
              </span>
            )}
          </div>

          {/* Node chain pills */}
          {featured && pipeline.node_chain && (
            <div className="flex flex-wrap gap-1 mt-3">
              {(pipeline.node_chain as string[]).slice(0, 12).map((node: string) => (
                <span key={node} className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/70 border border-border/20">
                  {node}
                </span>
              ))}
              {(pipeline.node_chain as string[]).length > 12 && (
                <span className="text-[9px] font-mono text-muted-foreground/40">
                  +{(pipeline.node_chain as string[]).length - 12} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg sm:text-xl font-black font-mono ${
            pipeline.pipeline_score >= 97 ? 'text-primary' : 'text-foreground/80'
          }`}>
            {pipeline.pipeline_score?.toFixed(1)}
          </div>
          <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">score</div>
        </div>
      </div>
    </motion.div>
  );
}
