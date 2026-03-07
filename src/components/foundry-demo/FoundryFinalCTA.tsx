/**
 * Final section CTA — closing conversion block
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function FoundryFinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 md:py-36 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center relative"
      >
        <p className="text-sm sm:text-base text-muted-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed">
          The Memory Stream captures raw system behavior and crystallizes it
          into production-grade software — and when exceptional, into silicon.
        </p>
        <button
          onClick={() => navigate('/auth?redirect=/foundry')}
          className="px-10 sm:px-12 py-4 sm:py-5 bg-primary text-primary-foreground rounded-xl font-mono text-base sm:text-lg font-bold hover:bg-primary/90 transition-all duration-200 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-1 min-h-[56px] crystallize-glow"
        >
          Create Free Account
        </button>
        <p className="mt-6 text-xs font-mono text-muted-foreground/40">
          No credit card required · Passwordless magic link · Start crystallizing in 30 seconds
        </p>
      </motion.div>
    </section>
  );
}
