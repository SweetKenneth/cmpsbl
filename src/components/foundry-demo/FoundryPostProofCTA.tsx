/**
 * Post-Proof Conversion CTA — appears after the verify panel
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function FoundryPostProofCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 md:py-28 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto relative text-center"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-4 leading-tight">
          Want to discover memories yourself?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground/70 max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed">
          Create an account to access the Foundry and explore discoveries
          from the Memory Stream in real time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/auth?redirect=/foundry')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-primary text-primary-foreground rounded-xl font-mono text-sm sm:text-base font-bold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 min-h-[52px] crystallize-glow"
          >
            Start Mining Pipelines
          </button>
          <button
            onClick={() => navigate('/pipelines')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 border border-border/30 text-foreground rounded-xl font-mono text-sm sm:text-base font-medium hover:bg-muted/20 transition-all duration-200 min-h-[52px]"
          >
            View Discovered Pipelines
          </button>
        </div>
        <p className="mt-6 text-xs font-mono text-muted-foreground/40">
          No credit card required · Free account · Start in 30 seconds
        </p>
      </motion.div>
    </section>
  );
}
