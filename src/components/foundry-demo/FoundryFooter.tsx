/**
 * Memory Stream Footer — CTA with login/create account + navigation
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
      <section className="py-16 sm:py-24 md:py-32 px-5 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_60%)]" />
        
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="text-xs sm:text-xs font-mono uppercase tracking-[0.2em] sm:tracking-[0.4em] text-muted-foreground mb-5 sm:mb-6">
            The question isn't whether it works
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-6 sm:mb-8 leading-[0.95]">
            1,143&nbsp;pipelines.
            <br />
            95&nbsp;perfect&nbsp;scores.
            <br />
            <span className="text-primary">Under 9 hours.</span>
          </h2>
          <p className="text-muted-foreground/60 max-w-lg mx-auto mb-8 sm:mb-12 text-sm sm:text-base px-2 leading-relaxed">
            Every system you add changes the topology. Every discovery compounds the next.
            The Memory Stream doesn't stop — it accelerates.
          </p>

          {/* Primary CTA — Create Account / Login */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/auth?redirect=/foundry')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4 bg-primary text-primary-foreground rounded-xl font-mono text-sm sm:text-base font-bold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 min-h-[52px]"
            >
              Crystallize Software Now — Free
            </button>
            <button
              onClick={() => navigate('/auth?redirect=/foundry')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4 border border-border/30 text-foreground rounded-xl font-mono text-sm sm:text-base font-bold hover:bg-muted/20 transition-all duration-200 min-h-[52px]"
            >
              Sign In
            </button>
          </div>

          <p className="mt-5 sm:mt-6 text-xs sm:text-xs font-mono text-muted-foreground/40">
            No credit card · Passwordless magic link · Start crystallizing in 30 seconds
          </p>
        </div>
      </section>

      {/* Navigation grid */}
      <div className="border-t border-border/10 px-5 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-8 md:gap-12">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 sm:mb-4">
                  {col.title}
                </div>
                <ul className="space-y-2.5 sm:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm sm:text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
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
      <div className="border-t border-border/10 px-5 sm:px-6 py-5 sm:py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-lg font-black tracking-tighter text-foreground">CMPSBL</span>
            <span className="text-xs font-mono text-muted-foreground/40">®</span>
          </div>
          <div className="text-xs sm:text-xs font-mono text-muted-foreground/30 uppercase tracking-wider text-center md:text-right space-y-1">
            <div>All data sourced from production database · RLS enforced · Independently verifiable</div>
            <div>© {new Date().getFullYear()} CMPSBL. All rights reserved.</div>
          </div>
        </div>
      </div>

      {/* Safe area padding for mobile */}
      <div className="h-8 lg:h-0" />
    </footer>
  );
}
