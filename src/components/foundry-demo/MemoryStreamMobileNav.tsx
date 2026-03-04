/**
 * Memory Stream Mobile Nav — Sticky bottom navigation for section jumping
 * Only visible on mobile/tablet viewports.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavSection {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: NavSection[] = [
  { id: 'hero', label: 'Overview', icon: '◉' },
  { id: 'how-it-works', label: 'How It Works', icon: '◈' },
  { id: 'proof', label: 'Proof', icon: '▣' },
  { id: 'engine', label: 'Engine', icon: '∞' },
  { id: 'apex', label: 'Apex', icon: '◆' },
  { id: 'stream', label: 'Stream', icon: '▷' },
  { id: 'verify', label: 'Verify', icon: '⟐' },
];

export function MemoryStreamMobileNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero
      setVisible(window.scrollY > 300);

      // Determine active section
      const sections = SECTIONS.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      })).filter(s => s.el);

      let current = 'hero';
      for (const section of sections) {
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="bg-background/90 backdrop-blur-xl border-t border-border/30 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-w-[60px] ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground/60 active:bg-muted/30'
                    }`}
                  >
                    <span className="text-sm">{section.icon}</span>
                    <span className="text-[9px] font-mono uppercase tracking-wider font-medium">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
