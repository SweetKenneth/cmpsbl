/**
 * Lead Capture CTA — Email collection for non-authenticated visitors
 * Item #7: Convert anonymous traffic into leads
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LeadCaptureCTAProps {
  context?: 'scanner' | 'blog' | 'general';
  className?: string;
  variant?: 'inline' | 'banner' | 'minimal';
}

const COPY = {
  scanner: {
    headline: 'Get weekly scan insights',
    subline: 'Accessibility, SEO & security reports delivered to your inbox.',
    cta: 'Subscribe',
  },
  blog: {
    headline: 'Stay ahead of AI infrastructure',
    subline: 'Deep-dives on cognitive architecture, shipped weekly.',
    cta: 'Subscribe',
  },
  general: {
    headline: 'Join the substrate community',
    subline: 'Product updates, engineering insights, early access.',
    cta: 'Get Updates',
  },
};

const DISMISS_KEY = 'cmpsbl_lead_dismissed';

export function LeadCaptureCTA({ context = 'general', className = '', variant = 'inline' }: LeadCaptureCTAProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  });

  const copy = COPY[context];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const insertData: Record<string, unknown> = {
        email: email.toLowerCase().trim(),
        source: context,
        page_url: window.location.pathname,
      };
      const { error } = await supabase.from('lead_captures' as any).insert(insertData);
      if (error && !error.message.includes('duplicate')) throw error;
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  };

  if (dismissed || status === 'success') {
    if (status === 'success') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-2 text-sm text-primary ${className}`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>You're in. Watch your inbox.</span>
        </motion.div>
      );
    }
    return null;
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button type="submit" size="sm" disabled={status === 'loading'}>
          {copy.cta} <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </form>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative bg-card border border-border/50 rounded-xl p-6 ${className}`}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{copy.headline}</h3>
            <p className="text-sm text-muted-foreground">{copy.subline}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button type="submit" disabled={status === 'loading'} className="shrink-0 whitespace-nowrap">
            {status === 'loading' ? '...' : copy.cta}
          </Button>
        </form>

        {status === 'error' && (
          <p className="text-xs text-destructive mt-2">Something went wrong. Please try again.</p>
        )}

        <p className="text-[10px] text-muted-foreground mt-3">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
