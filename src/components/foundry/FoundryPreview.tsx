/**
 * FoundryPreview — Anonymous landing view with CTA to sign in
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { MEMORY_STREAM_SUBTITLE, MEMORY_STREAM_CTA_AUTH } from '@/lib/branding/memory-stream';

export function FoundryPreview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-center max-w-3xl w-full"
      >
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground mb-8">
          Memory Stream — CMPSBL®
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9] mb-8">
          Crystallize
          <br />
          <span className="text-primary">Pipelines</span>
        </h1>

        <p className="text-lg text-muted-foreground/70 max-w-xl mx-auto mb-8">
          {MEMORY_STREAM_SUBTITLE}
        </p>

        {/* Memory Stream visualization — autoCrystallize for ambient life */}
        <div className="mb-10">
          <MemoryRiver autoCrystallize />
        </div>

        {/* Tier preview */}
        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          {['Mint', 'Prime', 'Relic', 'Mythic', 'Apex'].map((tier, i) => {
            const colors = [
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              'bg-sky-500/10 text-sky-400 border-sky-500/30',
              'bg-amber-500/10 text-amber-400 border-amber-500/30',
              'bg-purple-500/10 text-purple-400 border-purple-500/30',
              'bg-primary/10 text-primary border-primary/30',
            ];
            return (
              <motion.span
                key={tier}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`text-xs font-mono px-3 py-1 rounded border ${colors[i]} uppercase tracking-wider`}
              >
                {tier}
              </motion.span>
            );
          })}
        </div>

        {/* Stats preview */}
        <div className="flex items-center justify-center gap-8 font-mono mb-12">
          <div>
            <div className="text-2xl font-black text-foreground">1,143+</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipelines</div>
          </div>
          <div className="w-px h-8 bg-border/30" />
          <div>
            <div className="text-2xl font-black text-primary">68+</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Quality Floor</div>
          </div>
          <div className="w-px h-8 bg-border/30" />
          <div>
            <div className="text-2xl font-black text-foreground">5</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tiers</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/auth')}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          {MEMORY_STREAM_CTA_AUTH}
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs font-mono text-muted-foreground/40"
        >
          Every pipeline is real, scored, and independently verifiable
        </motion.div>
      </motion.div>
    </div>
  );
}