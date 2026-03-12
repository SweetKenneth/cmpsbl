/**
 * Mid-page CTA Interstitial — Conversion nudge between sections
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function FoundryMidCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-[hsl(var(--neon-purple)/0.03)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto relative"
      >
        <div className="bg-card/40 border border-primary/15 rounded-2xl p-8 sm:p-10 md:p-12 backdrop-blur-sm text-center shadow-lg shadow-primary/5">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary/60 mb-3">
            Ready to see for yourself?
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mb-3 sm:mb-4">
            Every memory is <span className="text-primary">yours to explore</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            Create a free account and start crystallizing memories from the Memory Stream.
            No credit card. No setup. Just pull.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/auth?redirect=/foundry')}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-mono text-sm font-bold hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 min-h-[48px]"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/auth?redirect=/foundry')}
              className="w-full sm:w-auto px-8 py-3.5 border border-border/30 text-foreground/80 rounded-xl font-mono text-sm font-medium hover:bg-muted/20 transition-all min-h-[48px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
