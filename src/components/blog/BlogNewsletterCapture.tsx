/**
 * Blog Newsletter Capture — Gap #13
 * Email capture CTA shown at end of blog posts
 */

import { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function BlogNewsletterCapture() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitted) return;

    setSubmitting(true);
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'newsletter_signup',
        category: 'conversion',
        label: email.trim(),
        page: window.location.pathname,
        metadata: { source: 'blog_footer' },
      });
      setSubmitted(true);
      toast.success('You\'re on the list!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">You're subscribed!</p>
        <p className="text-xs text-muted-foreground mt-1">We'll send the good stuff — no spam.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Get substrate insights</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Deep dives on cognitive infrastructure, AI governance, and what we're building — once a week, max.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Subscribe
        </Button>
      </form>
    </div>
  );
}
