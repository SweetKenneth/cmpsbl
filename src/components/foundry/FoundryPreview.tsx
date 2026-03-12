/**
 * FoundryPreview — Anonymous landing view with CTA to sign in
 * Polished: deeper visual hierarchy, animated tier badges, cinematic depth
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { MEMORY_STREAM_SUBTITLE, MEMORY_STREAM_CTA_AUTH } from '@/lib/branding/memory-stream';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FoundryPreview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Layered ambient background */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1 opacity-60"
        style={{ background: 'radial-gradient(circle, hsl(var(--neon-cyan) / 0.06), transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3 opacity-50"
        style={{ background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.05), transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-center max-w-3xl w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
        >
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/80">Memory Stream</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9] mb-4">
          Crystallize
          <br />
          <span className="section-gradient-text">Memories</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg text-muted-foreground/70 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {MEMORY_STREAM_SUBTITLE}
        </motion.p>

        {/* Memory Stream visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-10"
        >
          <MemoryRiver autoCrystallize hideTagline />
        </motion.div>

        {/* Tier preview — staggered entrance */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 flex-wrap">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 200 }}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${colors[i]} uppercase tracking-wider backdrop-blur-sm`}
              >
                {tier}
              </motion.span>
            );
          })}
        </div>

        {/* Stats — elevated cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 sm:gap-8 font-mono mb-12"
        >
          {[
            { value: '1,143+', label: 'Pipelines', color: 'text-foreground' },
            { value: '68+', label: 'Quality Floor', color: 'text-primary' },
            { value: '5', label: 'Tiers', color: 'text-foreground' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/auth')}
          className="group relative px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-mono text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          <span className="flex items-center gap-2">
            {MEMORY_STREAM_CTA_AUTH}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-xs font-mono text-muted-foreground/40"
        >
          Every pipeline is real, scored, and independently verifiable
        </motion.div>
      </motion.div>
    </div>
  );
}
