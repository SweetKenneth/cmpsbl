/**
 * Memory Stream Footer — Full site navigation + closing CTA
 */
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const NAV_COLUMNS = [
  {
    title: 'Substrate',
    links: [
      { label: 'Overview', to: '/substrate' },
      { label: 'Runtime', to: '/runtime' },
      { label: 'Engines', to: '/engines' },
      { label: 'Upgrade', to: '/upgrade' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Memory Stream', to: '/foundry' },
      { label: 'Cognitive Showcase', to: '/showcase' },
      { label: 'Engineering Proof', to: '/proof' },
      { label: 'Documentation', to: '/documentation' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Investors', to: '/investors' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/documentation' },
      { label: 'API Reference', to: '/docs/runtime' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
];

export function FoundryFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative overflow-hidden" id="footer">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_60%)]" />
        
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-4 sm:mb-6">
            The question isn't whether it works
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-6 sm:mb-8 leading-[0.95]">
            1,143&nbsp;pipelines.
            <br />
            95&nbsp;perfect&nbsp;scores.
            <br />
            <span className="text-primary">Under 9 hours.</span>
          </h2>
          <p className="text-muted-foreground/60 max-w-lg mx-auto mb-8 sm:mb-12 text-xs sm:text-sm md:text-base px-2">
            Every system you add changes the topology. Every discovery compounds the next.
            The Memory Stream doesn't stop — it accelerates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/substrate')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Explore the Substrate
            </button>
            <button
              onClick={() => navigate('/proof')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-border/30 text-foreground rounded-lg font-mono text-xs sm:text-sm font-bold hover:bg-muted/20 transition-colors"
            >
              View Engineering Proof
            </button>
          </div>
        </motion.div>
      </section>

      {/* Navigation grid */}
      <div className="border-t border-border/10 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/50 mb-3 sm:mb-4">
                  {col.title}
                </div>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/10 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-black tracking-tighter text-foreground">CMPSBL</span>
            <span className="text-[10px] font-mono text-muted-foreground/40">®</span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wider text-center md:text-right space-y-0.5 sm:space-y-1">
            <div>All data sourced from production database · RLS enforced · Independently verifiable</div>
            <div>© {new Date().getFullYear()} CMPSBL. All rights reserved.</div>
          </div>
        </div>
      </div>

      {/* Safe area padding for mobile nav */}
      <div className="h-20 lg:h-0" />
    </footer>
  );
}
