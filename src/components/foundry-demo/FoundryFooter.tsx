/**
 * Memory Stream Footer — Closing CTA with real metrics
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
          1,143&nbsp;pipelines.
          <br />
          95&nbsp;perfect&nbsp;scores.
          <br />
          <span className="text-primary">Under 9 hours.</span>
        </h2>
        <p className="text-muted-foreground/60 max-w-lg mx-auto mb-12">
          Every system you add changes the topology. Every discovery compounds the next.
          The Memory Stream doesn't stop — it accelerates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          <button
            onClick={() => window.open('/docs/whitepaper/', '_blank')}
            className="px-8 py-3 border border-border/30 text-foreground rounded-lg font-mono text-sm font-bold hover:bg-muted/20 transition-colors"
          >
            Read Whitepaper
          </button>
        </div>

        {/* Technical footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-border/10"
        >
          <div className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wider space-y-1">
            <div>CMPSBL® Memory Stream</div>
            <div>All data sourced from production database · RLS enforced · Independently verifiable</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
