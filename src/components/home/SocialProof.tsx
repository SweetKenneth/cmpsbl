/**
 * Social Proof / Testimonials
 * Balanced: Building on substrate + Memory Stream output
 */

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We plugged DREAM cycles into our agent fleet and within a week they were surfacing patterns we'd never have found manually. The substrate does the thinking while we sleep.",
    author: "Engineering Lead",
    role: "Fortune 500 AI Team",
    rating: 5,
  },
  {
    quote: "Building on the substrate changed everything. Our agents adapt their routing in real-time, and EVOLUTION auto-patches drift before we even notice it. We just build — the substrate handles the rest.",
    author: "CTO",
    role: "Series B Startup",
    rating: 5,
  },
  {
    quote: "Persistent memory and governed evolution gave us what we couldn't build ourselves — an AI system that remembers, adapts, and stays compliant. Every action is auditable.",
    author: "VP of Compliance",
    role: "Enterprise SaaS",
    rating: 5,
  },
];

export function SocialProof() {
  return (
    <section className="relative z-10 py-14 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
            Builders on the substrate
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Teams using DREAM, ADAPT, and EVOLUTION to build intelligence that compounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-5 sm:p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.author}</span> · {t.role}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
