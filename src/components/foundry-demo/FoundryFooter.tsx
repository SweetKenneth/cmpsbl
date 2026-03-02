/**
 * Foundry Footer — Closing CTA
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function FoundryFooter() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_60%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center relative"
      >
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground mb-6">
          The question isn't whether it works
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-8 leading-[0.95]">
          It already printed 1,143&nbsp;pipelines.
          <br />
          <span className="text-primary">What will it find next?</span>
        </h2>
        <p className="text-muted-foreground/60 max-w-lg mx-auto mb-12">
          Every module you add changes the topology. Every discovery compound the next.
          The foundry doesn't stop — it accelerates.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/substrate')}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Explore the Substrate
          </button>
          <button
            onClick={() => navigate('/proof')}
            className="px-8 py-3 border border-border/30 text-foreground rounded-lg font-mono text-sm font-bold hover:bg-muted/20 transition-colors"
          >
            View Engineering Proof
          </button>
        </div>
      </motion.div>
    </section>
  );
}
